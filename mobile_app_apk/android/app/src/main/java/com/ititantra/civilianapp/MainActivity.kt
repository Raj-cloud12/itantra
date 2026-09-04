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
import android.net.wifi.p2p.WifiP2pManager
import android.net.wifi.p2p.nsd.WifiP2pDnsSdServiceInfo
import android.net.wifi.p2p.nsd.WifiP2pDnsSdServiceRequest
import android.location.LocationManager
import androidx.core.location.LocationManagerCompat
import android.net.http.SslError
import android.widget.Toast
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

    // Wi-Fi Neighbor Direct (DNS-SD 802.11 Action Frames - 100m Range, Zero Hotspot, Zero Router)
    private var wifiP2pManager: WifiP2pManager? = null
    private var wifiP2pChannel: WifiP2pManager.Channel? = null
    private var wifiP2pServiceRequest: WifiP2pDnsSdServiceRequest? = null
    @Volatile
    private var isP2pListening = false

    private val MESH_16BIT_UUID = ParcelUuid.fromString("0000180D-0000-1000-8000-00805F9B34FB")
    private val UDP_PORT = 8888

    private val requiredPermissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.MODIFY_AUDIO_SETTINGS,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.CHANGE_WIFI_STATE,
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.NEARBY_WIFI_DEVICES
        )
    } else {
        arrayOf(
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
    }

    @SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        requestAllPermissions()
        requestLocationServices()
        requestBluetoothEnable()
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
        initWifiDirectNeighbor()
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

    // 1b. WI-FI NEIGHBOR (DIRECT DNS-SD 802.11 ACTION FRAMES - ZERO HOTSPOT, 100M RANGE)
    private var isP2pInitialized = false
    private var p2pRetryCount = 0

    private fun initWifiDirectNeighbor() {
        if (isP2pInitialized) return
        isP2pInitialized = true
        try {
            wifiP2pManager = getSystemService(Context.WIFI_P2P_SERVICE) as? WifiP2pManager
            wifiP2pChannel = wifiP2pManager?.initialize(this, mainLooper, null)
            Log.i("WIFI_NEIGHBOR", "Wi-Fi Direct P2P Initialized successfully")

            // Wait 2.5s for P2P HAL/driver to stabilize before issuing service requests
            Handler(Looper.getMainLooper()).postDelayed({
                startWifiNeighborListener()
            }, 2500)
        } catch (e: Exception) {
            Log.e("WIFI_NEIGHBOR", "Error initializing Wi-Fi Direct: ${e.message}")
        }
    }

    private fun startWifiNeighborListener() {
        val manager = wifiP2pManager ?: return
        val channel = wifiP2pChannel ?: return
        if (isP2pListening) return

        try {
            manager.setDnsSdResponseListeners(
                channel,
                { instanceName, _, srcDevice ->
                    Log.i("WIFI_NEIGHBOR", "Discovered Air Service: $instanceName from ${srcDevice.deviceName}")
                },
                { _, txtRecordMap, srcDevice ->
                    Log.i("WIFI_NEIGHBOR", "CAPTURED WI-FI AIR TWEET from ${srcDevice.deviceName}: $txtRecordMap")
                    if (txtRecordMap != null && txtRecordMap.containsKey("c")) {
                        val cipher = txtRecordMap["c"] ?: ""
                        val text = txtRecordMap["t"] ?: ""
                        val hop = txtRecordMap["h"]?.toIntOrNull() ?: 1
                        val sender = txtRecordMap["s"] ?: "@victim_phone_1"
                        val id = txtRecordMap["id"] ?: ("p2p_" + System.currentTimeMillis())

                        val packetObj = JSONObject().apply {
                            put("id", id)
                            put("cipher_code", cipher)
                            put("hop_count", hop + 1)
                            put("text", if (text.isNotBlank()) text else "🚨 அவசர உதவி தேவை! (Mode 3 Wi-Fi Neighbor)")
                            put("sender_username", sender)
                            put("network_mode", "mode-3-ai-mesh")
                            put("gateway_node", "📱 Phone 2 (Wi-Fi Neighbor Relay)")
                            put("timestamp", System.currentTimeMillis())
                            put("type", "voice_message")
                            put("sender_role", "field")
                        }
                        runOnUiThread {
                            notifyWebviewPacketReceived(packetObj.toString(), "WIFI_NEIGHBOR_AIR")
                        }
                    }
                }
            )

            addServiceRequestAndDiscover(manager, channel)
        } catch (e: Exception) {
            Log.e("WIFI_NEIGHBOR", "Error starting Wi-Fi Neighbor listener: ${e.message}")
        }
    }

    private fun addServiceRequestAndDiscover(manager: WifiP2pManager, channel: WifiP2pManager.Channel) {
        val req = WifiP2pDnsSdServiceRequest.newInstance()
        wifiP2pServiceRequest = req

        manager.addServiceRequest(channel, req, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                isP2pListening = true
                Log.i("WIFI_NEIGHBOR", "addServiceRequest OK, starting discoverServices...")
                manager.discoverServices(channel, object : WifiP2pManager.ActionListener {
                    override fun onSuccess() {
                        Log.i("WIFI_NEIGHBOR", "SUCCESS: Wi-Fi Neighbor Air Radius Listener Active! (100m, Zero Hotspot)")
                    }
                    override fun onFailure(code: Int) {
                        Log.w("WIFI_NEIGHBOR", "discoverServices failed: code=$code")
                    }
                })
            }
            override fun onFailure(code: Int) {
                Log.w("WIFI_NEIGHBOR", "addServiceRequest code=$code (retry=$p2pRetryCount/8)")
                if (p2pRetryCount < 8) {
                    p2pRetryCount++
                    val delay = (p2pRetryCount * 1500).toLong()
                    Handler(Looper.getMainLooper()).postDelayed({
                        addServiceRequestAndDiscover(manager, channel)
                    }, delay)
                }
            }
        })
    }

    private fun broadcastWifiNeighborTweet(payloadJson: String) {
        val manager = wifiP2pManager ?: return
        val channel = wifiP2pChannel ?: return
        try {
            val json = JSONObject(payloadJson)
            val cipher = json.optString("cipher_code", "KEY#ENC-4954-015F")
            val text = json.optString("text", "")
            val hop = json.optInt("hop_count", 1)
            val sender = json.optString("sender_username", "@victim_phone_1")
            val id = json.optString("id", "air_" + System.currentTimeMillis())

            val txtRecord = HashMap<String, String>()
            txtRecord["c"] = cipher
            txtRecord["h"] = hop.toString()
            txtRecord["s"] = sender
            txtRecord["id"] = id
            // Store text safely for DNS-SD TXT field limit
            txtRecord["t"] = text.take(120)

            val serviceInfo = WifiP2pDnsSdServiceInfo.newInstance(
                "itan_" + (System.currentTimeMillis() % 100000),
                "_itantra_mesh._tcp",
                txtRecord
            )

            manager.clearLocalServices(channel, object : WifiP2pManager.ActionListener {
                override fun onSuccess() {
                    manager.addLocalService(channel, serviceInfo, object : WifiP2pManager.ActionListener {
                        override fun onSuccess() {
                            Log.i("WIFI_NEIGHBOR", "SUCCESS: Wi-Fi Radius Tweet Broadcasted via 802.11 Action Frames! (Zero Hotspot)")
                            manager.discoverServices(channel, object : WifiP2pManager.ActionListener {
                                override fun onSuccess() {}
                                override fun onFailure(code: Int) {}
                            })
                        }
                        override fun onFailure(code: Int) {
                            Log.e("WIFI_NEIGHBOR", "addLocalService failed: $code")
                        }
                    })
                }
                override fun onFailure(reason: Int) {}
            })
        } catch (e: Exception) {
            Log.e("WIFI_NEIGHBOR", "Error broadcasting Wi-Fi Neighbor Tweet: ${e.message}")
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
            Log.i("AIR_MESH_BRIDGE", "Broadcasting mesh packet across Wi-Fi Neighbor + BLE + Aware + UDP: $payloadJson")
            broadcastWifiNeighborTweet(payloadJson)
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

    private fun requestBluetoothEnable() {
        try {
            val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
            val adapter = bm?.adapter
            if (adapter != null && !adapter.isEnabled) {
                Log.w("BLE_MESH", "Bluetooth is OFF — prompting user to turn ON")
                android.app.AlertDialog.Builder(this)
                    .setTitle("📶 Bluetooth தேவை — Air Mesh Relay")
                    .setMessage(
                        "இணையம் மற்றும் ஹாட்ஸ்பாட் இன்றி காற்றில் மெசேஜ் அனுப்பவும் பெறவும் போனில் Bluetooth ON ஆக இருக்கணும்.\n\n" +
                        "தயவுசெய்து Bluetooth-ஐ இயக்கவும்."
                    )
                    .setPositiveButton("📶 Bluetooth ON பண்ணு") { _, _ ->
                        startActivity(android.content.Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE))
                    }
                    .setNegativeButton("பின்னர்", null)
                    .show()
            }
        } catch (e: Exception) {
            Log.e("BLE_MESH", "Error checking Bluetooth: ${e.message}")
        }
    }

    private fun broadcastBlePacket(payloadJson: String) {
        val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        val adapter = bm?.adapter
        if (adapter == null || !adapter.isEnabled) {
            Log.e("BLE_MESH", "Bluetooth is DISABLED on device! Cannot broadcast BLE beacon.")
            runOnUiThread {
                Toast.makeText(this, "⚠️ Bluetooth அணைக்கப்பட்டுள்ளது! Bluetooth-ஐ ஆன் செய்யவும்.", Toast.LENGTH_LONG).show()
                requestBluetoothEnable()
            }
            return
        }

        bleAdvertiser = adapter.bluetoothLeAdvertiser
        if (bleAdvertiser == null) {
            Log.e("BLE_MESH", "Device does not support BLE Peripheral Advertising!")
            return
        }

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
                .setTimeout(0)
                .build()

            val data = AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .setIncludeTxPowerLevel(false)
                .addServiceData(MESH_16BIT_UUID, finalBytes)
                .build()

            currentBleCallback?.let { 
                try { bleAdvertiser?.stopAdvertising(it) } catch (e: Exception) {}
            }
            currentBleCallback = object : AdvertiseCallback() {
                override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                    Log.i("BLE_MESH", "SUCCESS: BLE Mesh Beacon Active! (20B token bytes=${finalBytes.size})")
                    // Stop after 8 seconds cleanly
                    Handler(Looper.getMainLooper()).postDelayed({
                        try {
                            bleAdvertiser?.stopAdvertising(this)
                        } catch (e: Exception) {}
                    }, 8000)
                }
                override fun onStartFailure(errorCode: Int) {
                    Log.e("BLE_MESH", "BLE Advertise Failed: code=$errorCode (1=DATA_TOO_LARGE, 2=TOO_MANY_ADVERTISERS, 3=ALREADY_STARTED, 4=INTERNAL_ERROR, 5=UNSUPPORTED)")
                }
            }
            bleAdvertiser?.startAdvertising(settings, data, currentBleCallback)
        } catch (e: Exception) {
            Log.e("BLE_MESH", "Error broadcasting BLE: ${e.message}")
        }
    }


    private var isBleScanning = false
    private var bleScanCallback: ScanCallback? = null

    private fun ensureBleScannerPeriodic() {
        Thread {
            while (true) {
                try {
                    Thread.sleep(12000)
                    val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
                    if (bm?.adapter?.isEnabled == true) {
                        if (!isBleScanning) {
                            Log.i("BLE_MESH", "Periodic keepalive: Starting BLE scanner...")
                            runOnUiThread { startBleScanner() }
                        }
                    }
                    try {
                        wifiP2pManager?.discoverServices(wifiP2pChannel, object : WifiP2pManager.ActionListener {
                            override fun onSuccess() {}
                            override fun onFailure(code: Int) {}
                        })
                    } catch (e: Exception) {}
                } catch (e: Exception) {}
            }
        }.start()
    }

    private fun startBleScanner() {
        val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        val adapter = bm?.adapter
        if (adapter == null || !adapter.isEnabled) {
            Log.w("BLE_MESH", "startBleScanner: Bluetooth is OFF, cannot scan")
            isBleScanning = false
            return
        }

        bleScanner = adapter.bluetoothLeScanner
        if (bleScanner == null) {
            isBleScanning = false
            return
        }

        try {
            // Stop any existing callback to avoid duplicates
            bleScanCallback?.let {
                try { bleScanner?.stopScan(it) } catch (e: Exception) {}
            }

            val settings = ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .setReportDelay(0)
                .build()

            val filter = ScanFilter.Builder()
                .setServiceData(MESH_16BIT_UUID, ByteArray(0), ByteArray(0))
                .build()

            val callback = object : ScanCallback() {
                override fun onScanResult(callbackType: Int, result: ScanResult?) {
                    val scanRecord = result?.scanRecord ?: return
                    val serviceData = scanRecord.getServiceData(MESH_16BIT_UUID)
                    if (serviceData != null && serviceData.isNotEmpty()) {
                        val tokenStr = String(serviceData, StandardCharsets.UTF_8)
                        Log.i("BLE_MESH", "AIR INTERCEPT: Captured token '$tokenStr' (RSSI: ${result.rssi} dBm)")
                        handleInboundBleToken(tokenStr)
                    }
                }

                override fun onBatchScanResults(results: MutableList<ScanResult>?) {
                    results?.forEach {
                        onScanResult(ScanSettings.CALLBACK_TYPE_ALL_MATCHES, it)
                    }
                }

                override fun onScanFailed(errorCode: Int) {
                    Log.e("BLE_MESH", "BLE Scan Failed: code=$errorCode (restarting in 3s...)")
                    isBleScanning = false
                    Handler(Looper.getMainLooper()).postDelayed({
                        startBleScanner()
                    }, 3000)
                }
            }

            bleScanCallback = callback
            try {
                bleScanner?.startScan(listOf(filter), settings, callback)
                isBleScanning = true
                Log.i("BLE_MESH", "SUCCESS: BLE Hardware Filter Scanner Started for $MESH_16BIT_UUID")
            } catch (e: Exception) {
                Log.w("BLE_MESH", "Filtered scan failed (${e.message}), trying unfiltered fallback scan...")
                bleScanner?.startScan(null, settings, callback)
                isBleScanning = true
                Log.i("BLE_MESH", "SUCCESS: BLE Unfiltered Fallback Scanner Active!")
            }
        } catch (e: Exception) {
            Log.e("BLE_MESH", "Error starting BLE scanner: ${e.message}")
            isBleScanning = false
        }
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

    private fun requestLocationServices() {
        try {
            val locationManager = getSystemService(Context.LOCATION_SERVICE) as? LocationManager
            val isLocationEnabled = locationManager?.let { LocationManagerCompat.isLocationEnabled(it) } ?: false

            val hasLocationPermission = ContextCompat.checkSelfPermission(
                this, Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED

            Log.i("WIFI_NEIGHBOR", "Location Status: DeviceEnabled=$isLocationEnabled, PermissionGranted=$hasLocationPermission")

            if (!hasLocationPermission) {
                Log.w("WIFI_NEIGHBOR", "Location Permission missing — requesting permission")
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    ),
                    101
                )
                return
            }

            if (!isLocationEnabled) {
                Log.w("WIFI_NEIGHBOR", "Device Location Services OFF — prompting user to turn ON")
                android.app.AlertDialog.Builder(this)
                    .setTitle("📍 Location தேவை — Wi-Fi Mesh Relay")
                    .setMessage(
                        "Wi-Fi Neighbor & BLE Mesh Relay மூலம் மெசேஜ் அனுப்பவும் பெறவும் போனில் Location ON ஆக இருக்கணும்.\n\n" +
                        "இது இருப்பிடத்தைக் கண்காணிக்க அல்ல — Android Wi-Fi Direct மற்றும் BLE அலைவரிசை மூலம் பிற போன்களுடன் ஹாட்ஸ்பாட் இன்றி இணைய Location தேவைப்படுகிறது.\n\n" +
                        "தயவுசெய்து Location-ஐ இயக்கவும்."
                    )
                    .setPositiveButton("📍 Location ON பண்ணு") { _, _ ->
                        startActivity(android.content.Intent(android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS))
                    }
                    .setNegativeButton("பின்னர்", null)
                    .setCancelable(false)
                    .show()
            } else {
                Log.i("WIFI_NEIGHBOR", "Location Services already ON")
            }
        } catch (e: Exception) {
            Log.e("WIFI_NEIGHBOR", "Error checking location services: ${e.message}")
        }
    }

    override fun onResume() {
        super.onResume()
        try {
            val locationManager = getSystemService(Context.LOCATION_SERVICE) as? LocationManager
            val isLocationEnabled = locationManager?.let { LocationManagerCompat.isLocationEnabled(it) } ?: false
            if (isLocationEnabled && !isP2pListening) {
                Log.i("WIFI_NEIGHBOR", "onResume: Location is ON, starting Wi-Fi Direct Neighbor...")
                initWifiDirectNeighbor()
            }
        } catch (e: Exception) {
            Log.e("WIFI_NEIGHBOR", "onResume check failed: ${e.message}")
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
            initWifiDirectNeighbor()
            requestLocationServices()
        }
    }
}
