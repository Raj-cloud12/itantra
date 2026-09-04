package com.ititantra.civilianapp

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.*
import android.content.Context
import android.content.pm.PackageManager
import android.net.wifi.WifiManager
import android.net.wifi.aware.*
import android.net.http.SslError
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.ParcelUuid
import android.util.Log
import android.webkit.*
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.k2fsa.sherpa.onnx.FeatureConfig
import com.k2fsa.sherpa.onnx.HomophoneReplacerConfig
import com.k2fsa.sherpa.onnx.OfflineModelConfig
import com.k2fsa.sherpa.onnx.OfflineRecognizer
import com.k2fsa.sherpa.onnx.OfflineRecognizerConfig
import com.k2fsa.sherpa.onnx.OfflineWhisperModelConfig
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.nio.charset.StandardCharsets
import java.util.*
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    
    // Sherpa-ONNX 100% Offline Multi-lingual ASR (Whisper-Tiny quantized int8)
    @Volatile
    private var sherpaRecognizer: OfflineRecognizer? = null
    private var currentRecognizerLang: String = ""
    private val sherpaLock = Any()
    private var audioRecord: AudioRecord? = null
    @Volatile
    private var isRecordingAudio = false
    private val asrExecutor = Executors.newSingleThreadExecutor()
    private val audioSamplesList = ArrayList<Float>()
    @Volatile
    private var activeSpeechLang: String = "ta"

    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bleAdvertiser: BluetoothLeAdvertiser? = null
    private var bleScanner: BluetoothLeScanner? = null
    private var currentBleCallback: AdvertiseCallback? = null
    private var udpSocket: DatagramSocket? = null
    private var isListeningUdp = false
    private var multicastLock: WifiManager.MulticastLock? = null

    // Wi-Fi Aware (NAN - Neighbor Awareness Networking 100m Range)
    private var wifiAwareManager: WifiAwareManager? = null
    private var wifiAwareSession: WifiAwareSession? = null
    private var publishDiscoverySession: PublishDiscoverySession? = null
    private var subscribeDiscoverySession: SubscribeDiscoverySession? = null
    private val AWARE_SERVICE_NAME = "iTiTantra_Local_Mesh"

    private val MESH_16BIT_UUID = ParcelUuid.fromString("0000180D-0000-1000-8000-00805F9B34FB")
    private val UDP_PORT = 8888

    private val requiredPermissions = arrayOf(
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.MODIFY_AUDIO_SETTINGS,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_WIFI_STATE,
        Manifest.permission.CHANGE_WIFI_STATE,
        Manifest.permission.BLUETOOTH_SCAN,
        Manifest.permission.BLUETOOTH_ADVERTISE,
        Manifest.permission.BLUETOOTH_CONNECT
    )

    @SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        requestAllPermissions()
        try {
            val wifi = applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            multicastLock = wifi?.createMulticastLock("iTiTantra_multicast_lock")
            multicastLock?.setReferenceCounted(true)
            multicastLock?.acquire()
            Log.i("UDP_MESH", "SUCCESS: Wi-Fi Multicast Lock Acquired!")
        } catch (e: Exception) {
            Log.e("UDP_MESH", "Error acquiring multicast lock: ${e.message}")
        }

        webView = findViewById(R.id.webView)
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.allowFileAccessFromFileURLs = true
        settings.allowUniversalAccessFromFileURLs = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.userAgentString = settings.userAgentString + " iTiTantra-Native-Android-Node/1.0"

        // Register Native Android Wi-Fi Aware, BLE & Radio Bridge
        webView.addJavascriptInterface(BleMeshBridge(), "AndroidBleMeshBridge")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                runOnUiThread { request?.grant(request.resources) }
            }

            override fun onGeolocationPermissionsShowPrompt(origin: String?, callback: GeolocationPermissions.Callback?) {
                callback?.invoke(origin, true, false)
            }
        }

        webView.clearCache(false)
        val targetUrl = "file:///android_asset/public/index.html"

        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                handler?.proceed()
            }
            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
            }
        }

        webView.loadUrl(targetUrl)

        initBluetooth()
        initWifiAware()
        ensureBleScannerPeriodic()
        startUdpMeshListener()
        initSherpaModelAssets()
    }

    private fun initBluetooth() {
        val bluetoothManager = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        bluetoothAdapter = bluetoothManager?.adapter
        bleAdvertiser = bluetoothAdapter?.bluetoothLeAdvertiser
        bleScanner = bluetoothAdapter?.bluetoothLeScanner
        startBleScanner()
    }

    // 1. WI-FI AWARE (NAN - NEIGHBOR AWARENESS NETWORKING 100M RANGE)
    private fun initWifiAware() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                if (!packageManager.hasSystemFeature(PackageManager.FEATURE_WIFI_AWARE)) {
                    Log.w("WIFI_AWARE", "Device does not support Wi-Fi Aware hardware feature")
                    return
                }

                wifiAwareManager = getSystemService(Context.WIFI_AWARE_SERVICE) as? WifiAwareManager
                if (wifiAwareManager?.isAvailable == true) {
                    wifiAwareManager?.attach(object : AttachCallback() {
                        override fun onAttached(session: WifiAwareSession) {
                            wifiAwareSession = session
                            Log.i("WIFI_AWARE", "SUCCESS: Wi-Fi Aware NAN Attached! Range: 100m")
                            publishWifiAwareMeshService()
                            subscribeWifiAwareMeshService()
                        }

                        override fun onAttachFailed() {
                            Log.e("WIFI_AWARE", "Wi-Fi Aware Attach Failed")
                        }
                    }, Handler(Looper.getMainLooper()))
                }
            } catch (e: Exception) {
                Log.e("WIFI_AWARE", "Error initializing Wi-Fi Aware: ${e.message}")
            }
        }
    }

    // 2. WI-FI AWARE PUBLISHER (Dispatches 24B Mesh Packets up to 100 meters)
    private fun publishWifiAwareMeshService() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && wifiAwareSession != null) {
            try {
                val config = PublishConfig.Builder()
                    .setServiceName(AWARE_SERVICE_NAME)
                    .setServiceSpecificInfo("iTiTantra_Node".toByteArray(StandardCharsets.UTF_8))
                    .build()

                wifiAwareSession?.publish(config, object : DiscoverySessionCallback() {
                    override fun onPublishStarted(session: PublishDiscoverySession) {
                        publishDiscoverySession = session
                        Log.i("WIFI_AWARE", "SUCCESS: Wi-Fi Aware Broadcast Active (100m Service Name: $AWARE_SERVICE_NAME)")
                    }

                    override fun onMessageReceived(peerHandle: PeerHandle, message: ByteArray) {
                        val receivedStr = String(message, StandardCharsets.UTF_8)
                        Log.i("WIFI_AWARE", "RECEIVED 100M NAN PACKET: $receivedStr")
                        runOnUiThread {
                            notifyWebviewPacketReceived(receivedStr, "WIFI_AWARE_NAN_100M")
                        }
                    }
                }, Handler(Looper.getMainLooper()))
            } catch (e: Exception) {
                Log.e("WIFI_AWARE", "Error publishing NAN: ${e.message}")
            }
        }
    }

    // 3. WI-FI AWARE SUBSCRIBER (Listens for incoming 100m packets from other disaster nodes)
    private fun subscribeWifiAwareMeshService() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && wifiAwareSession != null) {
            try {
                val config = SubscribeConfig.Builder()
                    .setServiceName(AWARE_SERVICE_NAME)
                    .build()

                wifiAwareSession?.subscribe(config, object : DiscoverySessionCallback() {
                    override fun onSubscribeStarted(session: SubscribeDiscoverySession) {
                        subscribeDiscoverySession = session
                        Log.i("WIFI_AWARE", "SUCCESS: Wi-Fi Aware Subscriber Active (Listening 100m)")
                    }

                    override fun onServiceDiscovered(peerHandle: PeerHandle, serviceSpecificInfo: ByteArray?, matchFilter: MutableList<ByteArray>?) {
                        Log.i("WIFI_AWARE", "DISCOVERED PEER NODE IN 100M RANGE: $peerHandle")
                    }

                    override fun onMessageReceived(peerHandle: PeerHandle, message: ByteArray) {
                        val receivedStr = String(message, StandardCharsets.UTF_8)
                        Log.i("WIFI_AWARE", "RECEIVED 100M NAN PACKET via Subscriber: $receivedStr")
                        runOnUiThread {
                            notifyWebviewPacketReceived(receivedStr, "WIFI_AWARE_NAN_100M")
                        }
                    }
                }, Handler(Looper.getMainLooper()))
            } catch (e: Exception) {
                Log.e("WIFI_AWARE", "Error subscribing NAN: ${e.message}")
            }
        }
    }

    // 4. SHERPA-ONNX OFFLINE ASR LOGIC (Multi-lingual Whisper-Tiny INT8)
    private fun initSherpaModelAssets() {
        Thread {
            try {
                val modelDir = File(filesDir, "whisper-tiny")
                if (!modelDir.exists()) modelDir.mkdirs()

                val filesToCopy = listOf(
                    "tiny-encoder.int8.onnx",
                    "tiny-decoder.int8.onnx",
                    "tiny-tokens.txt"
                )

                for (filename in filesToCopy) {
                    val targetFile = File(modelDir, filename)
                    if (!targetFile.exists() || targetFile.length() < 1000L) {
                        Log.i("SHERPA_ASR", "Extracting asset whisper-tiny/$filename to ${targetFile.absolutePath}...")
                        assets.open("whisper-tiny/$filename").use { input ->
                            FileOutputStream(targetFile).use { output ->
                                input.copyTo(output, bufferSize = 64 * 1024)
                            }
                        }
                        Log.i("SHERPA_ASR", "Extracted $filename successfully (${targetFile.length()} bytes)")
                    }
                }

                // Pre-warm default recognizer (Tamil / English)
                getOrInitRecognizer("ta")
            } catch (e: Exception) {
                Log.e("SHERPA_ASR", "Error initializing Sherpa model assets: ${e.message}", e)
            }
        }.start()
    }

    private fun mapToWhisperLang(lang: String): String {
        val l = lang.trim().lowercase()
        return when {
            l.startsWith("ta") -> "ta"
            l.startsWith("en") -> "en"
            l.startsWith("hi") -> "hi"
            l.startsWith("te") -> "te"
            l.startsWith("ml") -> "ml"
            l.startsWith("kn") -> "kn"
            l.startsWith("mr") -> "mr"
            l.startsWith("bn") -> "bn"
            l.startsWith("gu") -> "gu"
            l == "auto" || l.isEmpty() -> ""
            else -> l.take(2)
        }
    }

    private fun getOrInitRecognizer(lang: String): OfflineRecognizer? {
        val targetLang = mapToWhisperLang(lang)
        synchronized(sherpaLock) {
            if (sherpaRecognizer != null && currentRecognizerLang == targetLang) {
                return sherpaRecognizer
            }

            val modelDir = File(filesDir, "whisper-tiny")
            val encoderFile = File(modelDir, "tiny-encoder.int8.onnx")
            val decoderFile = File(modelDir, "tiny-decoder.int8.onnx")
            val tokensFile = File(modelDir, "tiny-tokens.txt")

            if (!encoderFile.exists() || !decoderFile.exists() || !tokensFile.exists() || decoderFile.length() < 1000L) {
                Log.w("SHERPA_ASR", "Model files missing in ${modelDir.absolutePath}, extracting now...")
                try {
                    if (!modelDir.exists()) modelDir.mkdirs()
                    assets.open("whisper-tiny/tiny-encoder.int8.onnx").use { input ->
                        FileOutputStream(encoderFile).use { output -> input.copyTo(output) }
                    }
                    assets.open("whisper-tiny/tiny-decoder.int8.onnx").use { input ->
                        FileOutputStream(decoderFile).use { output -> input.copyTo(output) }
                    }
                    assets.open("whisper-tiny/tiny-tokens.txt").use { input ->
                        FileOutputStream(tokensFile).use { output -> input.copyTo(output) }
                    }
                } catch (e: Exception) {
                    Log.e("SHERPA_ASR", "Failed extracting model files: ${e.message}", e)
                    return null
                }
            }

            try {
                sherpaRecognizer?.release()
                sherpaRecognizer = null

                val whisperConfig = OfflineWhisperModelConfig(
                    encoder = encoderFile.absolutePath,
                    decoder = decoderFile.absolutePath,
                    language = targetLang,
                    task = "transcribe",
                    tailPaddings = 1000,
                    enableTokenTimestamps = false,
                    enableSegmentTimestamps = false
                )

                val modelConfig = OfflineModelConfig().apply {
                    whisper = whisperConfig
                    tokens = tokensFile.absolutePath
                    numThreads = 4
                    debug = false
                    provider = "cpu"
                    modelType = "whisper"
                }

                val recConfig = OfflineRecognizerConfig(
                    featConfig = FeatureConfig(),
                    modelConfig = modelConfig,
                    hr = HomophoneReplacerConfig(),
                    decodingMethod = "greedy_search",
                    maxActivePaths = 4,
                    hotwordsFile = "",
                    hotwordsScore = 1.5f,
                    ruleFsts = "",
                    ruleFars = "",
                    blankPenalty = 0.0f
                )

                Log.i("SHERPA_ASR", "Initializing Sherpa OfflineRecognizer with language='$targetLang'...")
                sherpaRecognizer = OfflineRecognizer(null, recConfig)
                currentRecognizerLang = targetLang
                Log.i("SHERPA_ASR", "Sherpa OfflineRecognizer ready for language='$targetLang'!")
                return sherpaRecognizer
            } catch (e: Exception) {
                Log.e("SHERPA_ASR", "Failed to create OfflineRecognizer: ${e.message}", e)
                return null
            }
        }
    }

    private fun decodeSamples(samples: FloatArray, lang: String): String {
        if (samples.isEmpty()) return ""
        val rec = getOrInitRecognizer(lang) ?: return ""
        return try {
            val stream = rec.createStream()
            stream.acceptWaveform(samples, 16000)
            rec.decode(stream)
            val res = rec.getResult(stream)
            val recognizedText = res.text.trim()
            stream.release()

            // Filter Whisper silence hallucinations (e.g. "(Bell)", "[Music]", etc.)
            val lower = recognizedText.lowercase()
            if (lower == "(bell)" || lower == "[bell]" || lower == "(music)" || lower == "[music]" ||
                lower == "[applause]" || lower == "(applause)" || lower == "[silence]" ||
                recognizedText.matches(Regex("^[(\\[].*?[)\\]]$"))) {
                Log.w("SHERPA_ASR", "Filtered silence hallucination: '$recognizedText'")
                return ""
            }
            recognizedText
        } catch (e: Exception) {
            Log.e("SHERPA_ASR", "Error in Sherpa decode: ${e.message}", e)
            ""
        }
    }

    // 5. JAVASCRIPT BRIDGE
    inner class BleMeshBridge {
        @JavascriptInterface
        fun startSpeechRecognition(lang: String) {
            Log.i("SHERPA_ASR", "startSpeechRecognition called for language: $lang")
            activeSpeechLang = lang
            if (isRecordingAudio) {
                stopSpeechRecognition()
            }

            if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                Log.e("SHERPA_ASR", "RECORD_AUDIO permission missing")
                requestAllPermissions()
                return
            }

            val sampleRate = 16000
            val channelConfig = AudioFormat.CHANNEL_IN_MONO
            val audioFormat = AudioFormat.ENCODING_PCM_16BIT
            val minBufSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)
            val bufferSize = Math.max(minBufSize, sampleRate / 2)

            try {
                audioRecord = AudioRecord(
                    MediaRecorder.AudioSource.MIC,
                    sampleRate,
                    channelConfig,
                    audioFormat,
                    bufferSize
                )
                if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                    Log.e("SHERPA_ASR", "AudioRecord initialization failed")
                    return
                }

                synchronized(audioSamplesList) {
                    audioSamplesList.clear()
                }

                audioRecord?.startRecording()
                isRecordingAudio = true

                asrExecutor.execute {
                    val pcmBuffer = ShortArray(1600) // 100ms
                    var chunkCount = 0
                    while (isRecordingAudio) {
                        val read = audioRecord?.read(pcmBuffer, 0, pcmBuffer.size) ?: -1
                        if (read > 0) {
                            val floatBuffer = FloatArray(read)
                            for (i in 0 until read) {
                                floatBuffer[i] = pcmBuffer[i] / 32768.0f
                            }
                            synchronized(audioSamplesList) {
                                for (f in floatBuffer) {
                                    audioSamplesList.add(f)
                                }
                            }
                            chunkCount++
                            // Periodic interim update every ~2 seconds (20 chunks of 100ms)
                            if (chunkCount % 20 == 0 && audioSamplesList.size >= 32000) {
                                val currentSamples: FloatArray
                                synchronized(audioSamplesList) {
                                    currentSamples = audioSamplesList.toFloatArray()
                                }
                                val interimText = decodeSamples(currentSamples, activeSpeechLang)
                                if (interimText.isNotBlank()) {
                                    runOnUiThread {
                                        notifyWebviewSpeechResult(interimText, false)
                                    }
                                }
                            }
                        }
                    }
                }
                Log.i("SHERPA_ASR", "Audio recording started successfully")
            } catch (e: Exception) {
                Log.e("SHERPA_ASR", "AudioRecord error: ${e.message}", e)
            }
        }

        @JavascriptInterface
        fun stopSpeechRecognition(): String {
            Log.i("SHERPA_ASR", "stopSpeechRecognition called")
            isRecordingAudio = false
            try {
                audioRecord?.stop()
                audioRecord?.release()
                audioRecord = null
            } catch (e: Exception) {
                Log.w("SHERPA_ASR", "Error releasing AudioRecord: ${e.message}")
            }

            val fullSamples: FloatArray
            synchronized(audioSamplesList) {
                fullSamples = audioSamplesList.toFloatArray()
                audioSamplesList.clear()
            }

            if (fullSamples.isEmpty()) {
                Log.w("SHERPA_ASR", "No audio recorded")
                return ""
            }

            val finalText = decodeSamples(fullSamples, activeSpeechLang)
            Log.i("SHERPA_ASR", "Final Recognized ($activeSpeechLang): '$finalText'")

            runOnUiThread {
                notifyWebviewSpeechResult(finalText, true)
            }
            return finalText
        }

        @JavascriptInterface
        fun transcribeAudioBase64(base64Wav: String, lang: String): String {
            Log.i("SHERPA_ASR", "transcribeAudioBase64 called (length=${base64Wav.length}, lang=$lang)")
            try {
                val bytes = android.util.Base64.decode(base64Wav, android.util.Base64.DEFAULT)
                val offset = if (bytes.size > 44 && bytes[0] == 'R'.code.toByte() && bytes[1] == 'I'.code.toByte()) 44 else 0
                val shortCount = (bytes.size - offset) / 2
                val floatSamples = FloatArray(shortCount)
                for (i in 0 until shortCount) {
                    val low = bytes[offset + i * 2].toInt() and 0xFF
                    val high = bytes[offset + i * 2 + 1].toInt()
                    val s = (high shl 8) or low
                    floatSamples[i] = s.toShort() / 32768.0f
                }
                return decodeSamples(floatSamples, lang)
            } catch (e: Exception) {
                Log.e("SHERPA_ASR", "transcribeAudioBase64 failed: ${e.message}", e)
                return ""
            }
        }

        @JavascriptInterface
        fun broadcastMeshPacket(payloadJson: String) {
            Log.i("BLE_MESH_BRIDGE", "Broadcasting mesh packet across Wi-Fi Aware + BLE + UDP Radio: $payloadJson")
            broadcastBlePacket(payloadJson)
            broadcastUdpPacket(payloadJson)
        }

        @JavascriptInterface
        fun isNativeAvailable(): Boolean = true

        @JavascriptInterface
        fun isWifiAwareSupported(): Boolean {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                packageManager.hasSystemFeature(PackageManager.FEATURE_WIFI_AWARE)
            } else false
        }
    }

    private fun broadcastBlePacket(payloadJson: String) {
        val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        bleAdvertiser = bm?.adapter?.bluetoothLeAdvertiser
        if (bleAdvertiser == null) return
        try {
            val json = JSONObject(payloadJson)
            val cipher = json.optString("cipher_code", "CIPHER#AI-0000").filter { it.isLetterOrDigit() }.take(6).uppercase()
            val hop = json.optInt("hop_count", 1)
            val emergency = if (json.optBoolean("is_emergency", false)) "1" else "0"
            val text = json.optString("text", "")

            val prefix = "P:$cipher:H$hop:E$emergency:"
            val prefixBytes = prefix.toByteArray(StandardCharsets.UTF_8)
            val maxTextBytes = Math.max(0, 20 - prefixBytes.size)

            var subText = text
            var textBytes = subText.toByteArray(StandardCharsets.UTF_8)
            while (textBytes.size > maxTextBytes && subText.isNotEmpty()) {
                subText = subText.dropLast(1)
                textBytes = subText.toByteArray(StandardCharsets.UTF_8)
            }
            val finalBytes = ByteArray(prefixBytes.size + textBytes.size)
            System.arraycopy(prefixBytes, 0, finalBytes, 0, prefixBytes.size)
            System.arraycopy(textBytes, 0, finalBytes, prefixBytes.size, textBytes.size)

            val settings = AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                .setConnectable(false)
                .setTimeout(8000)
                .build()

            val data = AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .setIncludeTxPowerLevel(false)
                .addServiceData(MESH_16BIT_UUID, finalBytes)
                .build()

            currentBleCallback?.let { bleAdvertiser?.stopAdvertising(it) }
            currentBleCallback = object : AdvertiseCallback() {
                override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                    Log.i("BLE_MESH", "SUCCESS: BLE Mesh Beacon Active! (20B token bytes=${finalBytes.size})")
                }
                override fun onStartFailure(errorCode: Int) {
                    Log.e("BLE_MESH", "BLE Advertise Failed: code=$errorCode")
                }
            }
            bleAdvertiser?.startAdvertising(settings, data, currentBleCallback)
        } catch (e: Exception) {
            Log.e("BLE_MESH", "Error broadcasting BLE: ${e.message}")
        }
    }


    private fun ensureBleScannerPeriodic() {
        Thread {
            while (true) {
                Thread.sleep(5000)
                if (bleScanner == null) {
                    startBleScanner()
                }
            }
        }.start()
    }

    private fun startBleScanner() {
        val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        bleScanner = bm?.adapter?.bluetoothLeScanner
        if (bleScanner == null) return
        try {
            val settings = ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .build()

            bleScanner?.startScan(null, settings, object : ScanCallback() {
                override fun onScanResult(callbackType: Int, result: ScanResult?) {
                    val scanRecord = result?.scanRecord ?: return
                    val serviceData = scanRecord.getServiceData(MESH_16BIT_UUID)
                    if (serviceData != null && serviceData.isNotEmpty()) {
                        val tokenStr = String(serviceData, StandardCharsets.UTF_8)
                        handleInboundBleToken(tokenStr)
                    }
                }
                override fun onScanFailed(errorCode: Int) {}
            })
        } catch (e: Exception) {}
    }

    private fun handleInboundBleToken(token: String) {
        if (token.startsWith("P:")) {
            val parts = token.split(":")
            if (parts.size >= 4) {
                val cipher = parts[1]
                val hop = parts[2].replace("H", "").toIntOrNull() ?: 1
                val isEmerg = parts[3] == "E1"
                val textPreview = if (parts.size >= 5) parts.subList(4, parts.size).joinToString(":") else ""

                val packetObj = JSONObject().apply {
                    put("id", "ble_" + System.currentTimeMillis())
                    put("cipher_code", cipher)
                    put("hop_count", hop + 1)
                    put("is_emergency", isEmerg)
                    put("text", if (textPreview.isNotBlank()) textPreview else "🚨 அவசர உதவி தேவை! (Mode 3 BLE Mesh)")
                    put("network_mode", "mode-3-ai-mesh")
                    put("gateway_node", "📱 Phone 2 (BLE Mesh Relay Node)")
                    put("timestamp", System.currentTimeMillis())
                    if (isEmerg) put("type", "emergency_alert") else put("type", "voice_message")
                    put("sender_role", "field")
                    put("sender_username", "@victim_phone_1")
                }

                runOnUiThread {
                    notifyWebviewPacketReceived(packetObj.toString(), "BLE_MESH_RELAY")
                }
            }
        }
    }

    private fun broadcastUdpPacket(payload: String) {
        Thread {
            try {
                val data = payload.toByteArray(StandardCharsets.UTF_8)
                val targetBroadcastIps = mutableSetOf("255.255.255.255", "127.0.0.1")

                // Dynamically discover all active broadcast IP addresses across Wi-Fi, Hotspot, and P2P
                try {
                    val interfaces = java.net.NetworkInterface.getNetworkInterfaces()
                    while (interfaces.hasMoreElements()) {
                        val iface = interfaces.nextElement()
                        if (!iface.isLoopback && iface.isUp) {
                            for (ifaceAddr in iface.interfaceAddresses) {
                                val bcast = ifaceAddr.broadcast
                                if (bcast != null && bcast.hostAddress != null) {
                                    targetBroadcastIps.add(bcast.hostAddress)
                                }
                            }
                        }
                    }
                } catch (e: Exception) {}

                try {
                    val wm = applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
                    val dhcp = wm?.dhcpInfo
                    if (dhcp != null && dhcp.ipAddress != 0) {
                        val broadcast = (dhcp.ipAddress and dhcp.netmask) or dhcp.netmask.inv()
                        val quads = ByteArray(4)
                        for (k in 0..3) quads[k] = (broadcast shr k * 8).toByte()
                        targetBroadcastIps.add(InetAddress.getByAddress(quads).hostAddress ?: "255.255.255.255")
                    }
                } catch (e: Exception) {}

                for (ip in targetBroadcastIps) {
                    try {
                        val address = InetAddress.getByName(ip)
                        val packet = DatagramPacket(data, data.size, address, UDP_PORT)
                        udpSocket?.send(packet)
                    } catch (e: Exception) {}
                }
                Log.i("UDP_MESH", "SUCCESS: Dispatched UDP Multi-Subnet Packet (${data.size} bytes to ${targetBroadcastIps.size} destinations)")
            } catch (e: Exception) {
                Log.e("UDP_MESH", "UDP Broadcast Error: ${e.message}")
            }
        }.start()
    }

    private fun startUdpMeshListener() {
        if (isListeningUdp) return
        isListeningUdp = true

        Thread {
            try {
                udpSocket = DatagramSocket(UDP_PORT)
                udpSocket?.broadcast = true
                val buffer = ByteArray(65507)

                while (isListeningUdp) {
                    val packet = DatagramPacket(buffer, buffer.size)
                    udpSocket?.receive(packet)
                    val receivedStr = String(packet.data, 0, packet.length, StandardCharsets.UTF_8)
                    Log.i("UDP_MESH", "RECEIVED UDP PACKET size=${packet.length} bytes")
                    runOnUiThread {
                        notifyWebviewPacketReceived(receivedStr, "UDP_RADIO")
                    }
                }
            } catch (e: Exception) {}
        }.start()
    }

    private fun notifyWebviewPacketReceived(rawPayload: String, channel: String) {
        try {
            // Hardware Haptic Vibration (Phone shakes physically when air packet arrives)
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? android.os.Vibrator
            if (vibrator != null && vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(android.os.VibrationEffect.createWaveform(longArrayOf(0, 200, 100, 250), -1))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(longArrayOf(0, 200, 100, 250), -1)
                }
            }
            // Hardware Tone Generator
            val toneGen = android.media.ToneGenerator(android.media.AudioManager.STREAM_NOTIFICATION, 90)
            toneGen.startTone(android.media.ToneGenerator.TONE_PROP_BEEP2, 300)
        } catch (e: Exception) {
            Log.e("MESH_AIR", "Error in haptic/tone: ${e.message}")
        }

        val safeJson = rawPayload.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n")
        val jsCode = "if (window.onNativeMeshPacketReceived) { window.onNativeMeshPacketReceived(\"$safeJson\", \"$channel\"); }"
        webView.evaluateJavascript(jsCode, null)
    }

    private fun requestAllPermissions() {
        val missing = requiredPermissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), 101)
        }
    }

    private fun notifyWebviewSpeechResult(text: String, isFinal: Boolean) {
        val escaped = JSONObject.quote(text)
        val jsCode = "if (window.onNativeSpeechResult) { window.onNativeSpeechResult($escaped, $isFinal); }"
        webView.evaluateJavascript(jsCode, null)
    }

    override fun onDestroy() {
        super.onDestroy()
        isListeningUdp = false
        udpSocket?.close()
        isRecordingAudio = false
        try {
            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null
        } catch (e: Exception) {}
        try {
            sherpaRecognizer?.release()
            sherpaRecognizer = null
        } catch (e: Exception) {}
        try {
            asrExecutor.shutdown()
        } catch (e: Exception) {}
        try {
            if (multicastLock?.isHeld == true) multicastLock?.release()
        } catch (e: Exception) {}
        try {
            wifiAwareSession?.close()
        } catch (e: Exception) {}
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 101) {
            initBluetooth()
        }
    }
}
