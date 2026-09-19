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
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.location.Geocoder
import androidx.core.location.LocationManagerCompat
import android.net.http.SslError
import android.widget.Toast
import android.os.Build
import android.os.Bundle
import android.os.Vibrator
import android.os.VibrationEffect
import android.os.Environment
import android.provider.Settings
import android.content.Intent
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
import com.k2fsa.sherpa.onnx.OfflineNemoEncDecCtcModelConfig
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.nio.charset.StandardCharsets
import java.util.*
import java.util.concurrent.Executors

object TantraMeshCodec {
    fun encodeCompact(text: String): ByteArray {
        val out = java.io.ByteArrayOutputStream()
        var offset = 0
        val len = text.length
        while (offset < len) {
            val cp = text.codePointAt(offset)
            offset += Character.charCount(cp)
            if (cp in 0x0B80..0x0BFF) {
                // Tamil Unicode block 0x0B80..0x0BFF (128 characters) mapped to single byte with MSB 1
                out.write(0x80 or (cp - 0x0B80))
            } else if (cp < 0x80) {
                // ASCII letters, numbers, punctuation, spaces (0x00..0x7F)
                out.write(cp)
            } else {
                // Multi-byte Unicode (Emojis like 🚨, other languages)
                val cpChars = Character.toChars(cp)
                val b = String(cpChars).toByteArray(StandardCharsets.UTF_8)
                out.write(0x7F)
                out.write(b.size)
                out.write(b)
            }
        }
        return out.toByteArray()
    }

    fun decodeCompact(data: ByteArray): String {
        val sb = StringBuilder()
        var i = 0
        while (i < data.size) {
            val b = data[i].toInt() and 0xFF
            if ((b and 0x80) != 0) {
                val code = 0x0B80 + (b and 0x7F)
                sb.append(code.toChar())
                i++
            } else if (b == 0x7F && i + 1 < data.size) {
                val len = data[i + 1].toInt() and 0xFF
                if (i + 2 + len <= data.size) {
                    sb.append(String(data, i + 2, len, StandardCharsets.UTF_8))
                    i += 2 + len
                } else {
                    i++
                }
            } else {
                sb.append(b.toChar())
                i++
            }
        }
        return sb.toString()
    }
}

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
    private val downloadExecutor = Executors.newSingleThreadExecutor()

    private fun downloadFileWithProgress(sourceUrl: String, destFile: File, onProgress: (Int) -> Unit): Boolean {
        var currentUrl = sourceUrl
        var input: java.io.InputStream? = null
        var output: FileOutputStream? = null
        var connection: java.net.HttpURLConnection? = null
        try {
            var redirects = 0
            while (redirects < 6) {
                val url = java.net.URL(currentUrl)
                connection = url.openConnection() as java.net.HttpURLConnection
                connection.connectTimeout = 30000
                connection.readTimeout = 90000
                connection.instanceFollowRedirects = true
                connection.setRequestProperty("User-Agent", "iTiTantra-Android")
                connection.connect()

                val code = connection.responseCode
                if (code == java.net.HttpURLConnection.HTTP_MOVED_TEMP ||
                    code == java.net.HttpURLConnection.HTTP_MOVED_PERM ||
                    code == java.net.HttpURLConnection.HTTP_SEE_OTHER ||
                    code == 307 || code == 308) {
                    val newLocation = connection.getHeaderField("Location")
                    Log.i("MODEL_DL", "Redirect ($code) -> $newLocation")
                    connection.disconnect()
                    if (newLocation != null && newLocation.isNotEmpty()) {
                        currentUrl = java.net.URL(java.net.URL(currentUrl), newLocation).toString()
                        redirects++
                        continue
                    } else {
                        return false
                    }
                }

                if (code != java.net.HttpURLConnection.HTTP_OK) {
                    Log.e("MODEL_DL", "Server returned HTTP $code: ${connection.responseMessage}")
                    return false
                }
                break
            }

            val fileLength = connection?.contentLengthLong ?: -1L
            input = connection?.inputStream ?: return false
            val parent = destFile.parentFile
            if (parent != null && !parent.exists()) parent.mkdirs()
            val tempFile = File(parent, "${destFile.name}.tmp")
            output = FileOutputStream(tempFile)

            val data = ByteArray(32768)
            var total: Long = 0
            var count: Int
            var lastReportedPct = -1

            while (input.read(data).also { count = it } != -1) {
                total += count
                output.write(data, 0, count)
                if (fileLength > 0) {
                    val pct = (total * 100 / fileLength).toInt().coerceIn(0, 100)
                    if (pct != lastReportedPct) {
                        lastReportedPct = pct
                        onProgress(pct)
                    }
                }
            }
            output.flush()
            output.close()
            output = null
            input.close()
            input = null

            if (destFile.exists()) destFile.delete()
            tempFile.renameTo(destFile)
            Log.i("MODEL_DL", "Download completed successfully: ${destFile.absolutePath} ($total bytes)")
            return true
        } catch (e: Exception) {
            Log.e("MODEL_DL", "Download error: ${e.message}", e)
            return false
        } finally {
            try { output?.close() } catch (e: Exception) {}
            try { input?.close() } catch (e: Exception) {}
            try { connection?.disconnect() } catch (e: Exception) {}
        }
    }
    private val audioSamplesList = ArrayList<Float>()
    @Volatile
    private var activeSpeechLang: String = "ta"
    @Volatile
    private var lastRecognizedText: String = ""

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
    private val processedTokens = java.util.concurrent.ConcurrentHashMap<String, Long>()
    private var lastHapticTimestamp = 0L

    private var currentLatitude: Double = 0.0
    private var currentLongitude: Double = 0.0
    val recentSelfBroadcastCiphers = java.util.concurrent.ConcurrentHashMap.newKeySet<String>()

    private val locationListener = object : LocationListener {
        override fun onLocationChanged(location: Location) {
            if (location.latitude != 0.0 && location.longitude != 0.0) {
                currentLatitude = location.latitude
                currentLongitude = location.longitude
                Log.i("REAL_GPS", "Continuous GPS update: lat=$currentLatitude, lon=$currentLongitude (acc=${location.accuracy}m)")
                val placeName = resolveDevicePlaceName(currentLatitude, currentLongitude)
                runOnUiThread {
                    webView.evaluateJavascript(
                        "window.onNativeGpsUpdate && window.onNativeGpsUpdate(${currentLatitude}, ${currentLongitude}, '${placeName.replace("'", "\\'")}');",
                        null
                    )
                }
            }
        }
        override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
        override fun onProviderEnabled(provider: String) {}
        override fun onProviderDisabled(provider: String) {}
    }

    private fun resolveDevicePlaceName(lat: Double, lon: Double): String {
        var placeName = ""
        try {
            if (lat != 0.0 && lon != 0.0) {
                val geocoder = Geocoder(this@MainActivity, Locale.ENGLISH)
                val addrs = geocoder.getFromLocation(lat, lon, 1)
                if (!addrs.isNullOrEmpty()) {
                    val a = addrs[0]
                    val feature = a.featureName ?: a.thoroughfare ?: a.subLocality ?: a.locality
                    if (!feature.isNullOrBlank()) {
                        placeName = "$feature, ${a.locality ?: "Chennai"}"
                    }
                }
            }
        } catch (e: Exception) {
            Log.w("REAL_GPS", "Geocoder error: ${e.message}")
        }
        if (placeName.isBlank()) {
            if (Math.abs(lat - 12.8718) < 0.01 && Math.abs(lon - 80.2185) < 0.01) {
                placeName = "St. Joseph's Institute of Technology, OMR, Chennai"
            } else if (lat != 0.0 && lon != 0.0) {
                placeName = String.format(Locale.US, "Chennai Sector (%.4f°N, %.4f°E)", lat, lon)
            } else {
                placeName = "Chennai Field Sector"
            }
        }
        return placeName
    }

    private fun initGpsTracking() {
        try {
            val lm = getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return
            val hasFine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
            val hasCoarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
            if (hasFine || hasCoarse) {
                if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 1.0f, locationListener)
                }
                if (lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 1000L, 1.0f, locationListener)
                }
                updateDeviceLocation()
            }
        } catch (e: Exception) {
            Log.w("REAL_GPS", "initGpsTracking error: ${e.message}")
        }
    }

    private fun updateDeviceLocation() {
        try {
            val lm = getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return
            val hasFine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
            val hasCoarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
            if (hasFine || hasCoarse) {
                val locGps = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                val locNet = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                val best = when {
                    locGps != null && locNet != null -> if (locGps.time > locNet.time) locGps else locNet
                    locGps != null -> locGps
                    else -> locNet
                }
                if (best != null && best.latitude != 0.0 && best.longitude != 0.0) {
                    currentLatitude = best.latitude
                    currentLongitude = best.longitude
                    Log.i("REAL_GPS", "Real GPS acquired: lat=$currentLatitude, lon=$currentLongitude")
                    val placeName = resolveDevicePlaceName(currentLatitude, currentLongitude)
                    runOnUiThread {
                        webView.evaluateJavascript(
                            "window.onNativeGpsUpdate && window.onNativeGpsUpdate(${currentLatitude}, ${currentLongitude}, '${placeName.replace("'", "\\'")}');",
                            null
                        )
                    }
                }
            }
        } catch (e: Exception) {
            Log.w("REAL_GPS", "Could not get device location: ${e.message}")
        }
    }

    private var lastVibrationTimestamp = 0L

    private fun vibratePhone(ms: Long = 200) {
        val now = System.currentTimeMillis()
        if (now - lastVibrationTimestamp < 4500L) {
            // Strictly prevent repetitive or continuous vibration loops within 4.5 seconds
            return
        }
        lastVibrationTimestamp = now
        try {
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(ms.coerceIn(50, 400), VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(ms.coerceIn(50, 400))
            }
            Log.i("HAPTIC", "Vibrated phone once for ${ms}ms")
        } catch (e: Exception) {
            Log.w("HAPTIC", "vibratePhone error: ${e.message}")
        }
    }

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
        autoEnableRadios()
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
        WebView.setWebContentsDebuggingEnabled(true)
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

        webView.clearCache(true)
        settings.cacheMode = WebSettings.LOAD_NO_CACHE
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
        initGpsTracking()
    }

    private fun autoEnableRadios() {
        try {
            // 1. Auto-enable Bluetooth
            val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
            val adapter = bm?.adapter
            if (adapter != null && !adapter.isEnabled) {
                Log.i("RADIO_MGR", "Auto-enabling Bluetooth...")
                try {
                    @Suppress("DEPRECATION")
                    adapter.enable()
                } catch (e: Exception) {
                    Log.w("RADIO_MGR", "adapter.enable failed: ${e.message}")
                }
                if (!adapter.isEnabled) {
                    try {
                        val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
                        enableBtIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        startActivity(enableBtIntent)
                    } catch (e: Exception) {}
                }
            }

            // 2. Auto-enable Wi-Fi
            val wm = applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            if (wm != null && !wm.isWifiEnabled) {
                Log.i("RADIO_MGR", "Auto-enabling Wi-Fi...")
                try {
                    @Suppress("DEPRECATION")
                    wm.isWifiEnabled = true
                } catch (e: Exception) {
                    Log.w("RADIO_MGR", "wm.isWifiEnabled failed: ${e.message}")
                }
            }
        } catch (e: Exception) {
            Log.e("RADIO_MGR", "Error auto-enabling radios: ${e.message}")
        }
    }

    private var bluetoothGattServer: android.bluetooth.BluetoothGattServer? = null

    private fun initBluetooth() {
        autoEnableRadios()
        val bluetoothManager = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        bluetoothAdapter = bluetoothManager?.adapter

        try {
            if (bluetoothGattServer == null && bluetoothManager != null) {
                bluetoothGattServer = bluetoothManager.openGattServer(this, object : android.bluetooth.BluetoothGattServerCallback() {})
                Log.i("BLE_MESH", "SUCCESS: Bluetooth GATT Server opened & bound to Bluetooth framework!")
            }
        } catch (e: Exception) {
            Log.w("BLE_MESH", "openGattServer: ${e.message}")
        }

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
        if (isP2pInitialized && wifiP2pManager != null) return
        isP2pInitialized = true
        try {
            wifiP2pManager = getSystemService(Context.WIFI_P2P_SERVICE) as? WifiP2pManager
            wifiP2pChannel = wifiP2pManager?.initialize(this, mainLooper, null)
            Log.i("WIFI_NEIGHBOR", "Wi-Fi Direct P2P Initialized successfully")

            Handler(Looper.getMainLooper()).postDelayed({
                startWifiNeighborListener()
            }, 1500)
            startWifiDirectWatchdog()
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
                        val isCompact = txtRecordMap["enc"] == "compact"
                        val text = if (isCompact) {
                            try {
                                val b64 = txtRecordMap["t"] ?: ""
                                val raw = android.util.Base64.decode(b64, android.util.Base64.NO_WRAP)
                                TantraMeshCodec.decodeCompact(raw)
                            } catch (e: Exception) {
                                txtRecordMap["t"] ?: ""
                            }
                        } else {
                            val sb = StringBuilder()
                            sb.append(txtRecordMap["t"] ?: "")
                            for (i in 1..3) {
                                val part = txtRecordMap["t$i"]
                                if (!part.isNullOrEmpty()) sb.append(part)
                            }
                            sb.toString()
                        }
                        val hop = txtRecordMap["h"]?.toIntOrNull() ?: 1
                        val sender = txtRecordMap["s"] ?: "@victim_phone_1"
                        val id = txtRecordMap["id"] ?: ("air_" + cipher.lowercase() + "_h" + hop)

                        val dedupKey = "wifi_${cipher}_${hop}"
                        val now = System.currentTimeMillis()
                        val last = processedTokens[dedupKey]
                        if (last != null && (now - last) < 12000L) {
                            return@setDnsSdResponseListeners
                        }
                        processedTokens[dedupKey] = now

                        val isGovt = sender == "@command_center" || text.contains("GOVT") || text.contains("COMMAND")
                        val packetObj = JSONObject().apply {
                            put("id", id)
                            put("cipher_code", cipher)
                            put("hop_count", hop + 1)
                            put("text", if (text.isNotBlank()) text else "🎙️ குரல் / உரை செய்தி (Mode 3 Wi-Fi Neighbor)")
                            put("sender_username", sender)
                            put("network_mode", "mode-3-ai-mesh")
                            put("gateway_node", if (isGovt) "🏢 Command Center (Downlink Wi-Fi)" else "📱 Phone 2 (Wi-Fi Neighbor Relay)")
                            put("timestamp", System.currentTimeMillis())
                            put("type", if (isGovt) "emergency_alert" else "voice_message")
                            put("sender_role", if (isGovt) "command" else "field")
                            put("is_emergency", isGovt)
                        }
                        runOnUiThread {
                            notifyWebviewPacketReceived(packetObj.toString(), "WIFI_NEIGHBOR_AIR")
                        }
                    }
                }
            )

            setupWifiDirectDiscovery(manager, channel)
        } catch (e: Exception) {
            Log.e("WIFI_NEIGHBOR", "Error starting Wi-Fi Neighbor listener: ${e.message}")
        }
    }

    private fun setupWifiDirectDiscovery(manager: WifiP2pManager, channel: WifiP2pManager.Channel) {
        // Clear stale service requests first to prevent BUSY (code 2) errors
        manager.clearServiceRequests(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                addServiceRequestAndDiscover(manager, channel)
            }
            override fun onFailure(reason: Int) {
                Log.w("WIFI_NEIGHBOR", "clearServiceRequests failed code=$reason, attempting add anyway...")
                addServiceRequestAndDiscover(manager, channel)
            }
        })
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
                        if (code == WifiP2pManager.BUSY) {
                            manager.discoverPeers(channel, object : WifiP2pManager.ActionListener {
                                override fun onSuccess() {}
                                override fun onFailure(r: Int) {}
                            })
                        }
                    }
                })
            }
            override fun onFailure(code: Int) {
                Log.w("WIFI_NEIGHBOR", "addServiceRequest code=$code (retry=$p2pRetryCount/8)")
                if (p2pRetryCount < 8) {
                    p2pRetryCount++
                    val delay = (p2pRetryCount * 1500).toLong()
                    Handler(Looper.getMainLooper()).postDelayed({
                        setupWifiDirectDiscovery(manager, channel)
                    }, delay)
                }
            }
        })
    }

    private fun startWifiDirectWatchdog() {
        Thread {
            while (true) {
                try {
                    Thread.sleep(15000)
                    val wm = applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
                    if (wm?.isWifiEnabled == true && wifiP2pManager != null && wifiP2pChannel != null) {
                        wifiP2pManager?.discoverServices(wifiP2pChannel, object : WifiP2pManager.ActionListener {
                            override fun onSuccess() {
                                Log.d("WIFI_NEIGHBOR", "Watchdog: discoverServices heartbeat OK")
                            }
                            override fun onFailure(code: Int) {
                                Log.d("WIFI_NEIGHBOR", "Watchdog: refreshing discovery...")
                                wifiP2pChannel?.let { ch ->
                                    setupWifiDirectDiscovery(wifiP2pManager!!, ch)
                                }
                            }
                        })
                    }
                } catch (e: Exception) {}
            }
        }.start()
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
            
            // Encode text into single compact Base64 record (3x smaller)
            val compactBytes = TantraMeshCodec.encodeCompact(text)
            val compactB64 = android.util.Base64.encodeToString(compactBytes, android.util.Base64.NO_WRAP)
            txtRecord["t"] = compactB64
            txtRecord["enc"] = "compact"

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
                override fun onFailure(reason: Int) {
                    manager.addLocalService(channel, serviceInfo, object : WifiP2pManager.ActionListener {
                        override fun onSuccess() {
                            Log.i("WIFI_NEIGHBOR", "SUCCESS: Wi-Fi Radius Tweet Broadcasted (fallback)!")
                        }
                        override fun onFailure(code: Int) {
                            Log.e("WIFI_NEIGHBOR", "addLocalService fallback failed: $code")
                        }
                    })
                }
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

    private fun getModelDirForLang(lang: String): File {
        val l = lang.trim().lowercase()
        val code = when {
            l.startsWith("ta") -> "ta"
            l.startsWith("te") -> "te"
            l.startsWith("hi") -> "hi"
            l.startsWith("ml") -> "ml"
            l.startsWith("kn") -> "kn"
            l.startsWith("mr") -> "mr"
            l.startsWith("bn") -> "bn"
            l.startsWith("gu") -> "gu"
            l.startsWith("en") -> "en"
            else -> l.take(2)
        }
        return File(File(filesDir, "models"), "indic-$code")
    }

    private fun isIndicModelInstalled(lang: String): Boolean {
        val dir = getModelDirForLang(lang)
        val model = File(dir, "model.int8.onnx")
        val l = lang.trim().lowercase()
        val tokens = if (l.startsWith("en")) File(dir, "tokens.txt") else File(File(filesDir, "models"), "tokens.txt")
        return model.exists() && model.length() > 5_000_000L && tokens.exists() && tokens.length() > 500L
    }

    private fun getOrInitRecognizer(lang: String): OfflineRecognizer? {
        val l = lang.trim().lowercase()
        val isIndic = isIndicModelInstalled(l)
        val targetKey = if (isIndic) "indic-$l" else "whisper-${mapToWhisperLang(l)}"

        synchronized(sherpaLock) {
            if (sherpaRecognizer != null && currentRecognizerLang == targetKey) {
                return sherpaRecognizer
            }

            try {
                sherpaRecognizer?.release()
                sherpaRecognizer = null

                // 1. Try AI4Bharat IndicConformer if installed
                if (isIndic) {
                    val dir = getModelDirForLang(l)
                    val modelFile = File(dir, "model.int8.onnx")
                    val tokensFile = if (l.startsWith("en")) File(dir, "tokens.txt") else File(File(filesDir, "models"), "tokens.txt")

                    Log.i("SHERPA_ASR", "Loading AI4Bharat IndicConformer model for '$l' from ${modelFile.absolutePath}...")
                    val nemoConfig = OfflineNemoEncDecCtcModelConfig(model = modelFile.absolutePath)
                    val modelConfig = OfflineModelConfig().apply {
                        nemo = nemoConfig
                        tokens = tokensFile.absolutePath
                        numThreads = 4
                        debug = false
                        provider = "cpu"
                        modelType = "nemo_ctc"
                    }

                    val recConfig = OfflineRecognizerConfig(
                        featConfig = FeatureConfig(),
                        modelConfig = modelConfig,
                        decodingMethod = "greedy_search"
                    )

                    sherpaRecognizer = OfflineRecognizer(null, recConfig)
                    currentRecognizerLang = targetKey
                    Log.i("SHERPA_ASR", "AI4Bharat IndicConformer successfully initialized for '$l'!")
                    return sherpaRecognizer
                }

                // 2. Fallback to built-in Whisper-tiny
                val targetLang = mapToWhisperLang(l)
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

                Log.i("SHERPA_ASR", "Initializing Sherpa OfflineRecognizer (whisper) with language='$targetLang'...")
                sherpaRecognizer = OfflineRecognizer(null, recConfig)
                currentRecognizerLang = targetKey
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

    private fun mapToLocaleTag(lang: String): String {
        val l = lang.trim().lowercase()
        return when {
            l.startsWith("ta-en") -> "en-IN"
            l.startsWith("ta") -> "ta-IN"
            l.startsWith("hi") -> "hi-IN"
            l.startsWith("te") -> "te-IN"
            l.startsWith("ml") -> "ml-IN"
            l.startsWith("kn") -> "kn-IN"
            l.startsWith("mr") -> "mr-IN"
            l.startsWith("bn") -> "bn-IN"
            l.startsWith("gu") -> "gu-IN"
            l.startsWith("en") -> "en-IN"
            else -> "ta-IN"
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PERMANENT OFFLINE DEVICE IDENTITY (SURVIVES UNINSTALL & DATA WIPES)
    // ══════════════════════════════════════════════════════════════════════════

    private fun getHardwareDeviceId(): String {
        return try {
            val androidId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
            if (!androidId.isNullOrEmpty()) androidId else "node_${Build.MODEL.hashCode().toString(16)}"
        } catch (e: Exception) {
            "node_${Build.MODEL.hashCode().toString(16)}"
        }
    }

    private fun getPersistentIdentityFiles(): List<File> {
        val list = mutableListOf<File>()
        try {
            // 1. External Public Downloads (Survives app uninstall on Android)
            val downloadDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (downloadDir != null) {
                if (!downloadDir.exists()) downloadDir.mkdirs()
                list.add(File(downloadDir, ".ititantra_device_profile.dat"))
            }
        } catch (e: Exception) {}
        try {
            // 2. External Public Documents (Survives app uninstall on Android)
            val docsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
            if (docsDir != null) {
                if (!docsDir.exists()) docsDir.mkdirs()
                list.add(File(docsDir, ".ititantra_device_profile.dat"))
            }
        } catch (e: Exception) {}
        try {
            // 3. App Internal Files (Private sandbox backup)
            list.add(File(filesDir, "ititantra_device_profile.dat"))
        } catch (e: Exception) {}
        return list
    }

    private fun savePermanentIdentity(rawUsername: String): Boolean {
        val clean = rawUsername.trim()
        if (clean.length < 2) return false
        val formatted = if (clean.startsWith("@")) clean else "@$clean"
        val hwId = getHardwareDeviceId()
        val hwFingerprint = "${Build.MANUFACTURER}_${Build.MODEL}_${Build.BOARD}"

        val profileObj = JSONObject().apply {
            put("username", formatted)
            put("is_locked", true)
            put("hardware_id", hwId)
            put("hardware_fingerprint", hwFingerprint)
            put("locked_at", System.currentTimeMillis())
        }
        val jsonStr = profileObj.toString()

        // 1. Cache in SharedPreferences
        try {
            val prefs = getSharedPreferences("ititantra_device_identity", Context.MODE_PRIVATE)
            prefs.edit()
                .putString("locked_username", formatted)
                .putBoolean("is_locked", true)
                .putString("hardware_id", hwId)
                .putLong("locked_at", System.currentTimeMillis())
                .apply()
        } catch (e: Exception) {
            Log.e("IDENTITY", "Error writing SharedPreferences: ${e.message}")
        }

        // 2. Save into External Public Files (Download & Documents)
        var successCount = 0
        for (file in getPersistentIdentityFiles()) {
            try {
                file.parentFile?.mkdirs()
                val encoded = android.util.Base64.encodeToString(
                    jsonStr.toByteArray(Charsets.UTF_8),
                    android.util.Base64.NO_WRAP
                )
                file.writeText(encoded, Charsets.UTF_8)
                successCount++
                Log.i("IDENTITY", "Saved permanent profile to ${file.absolutePath}")
            } catch (e: Exception) {
                Log.w("IDENTITY", "Could not write to ${file.absolutePath}: ${e.message}")
            }
        }
        return true
    }

    private fun loadPermanentIdentity(): JSONObject {
        val hwId = getHardwareDeviceId()

        // 1. Check SharedPreferences first (instant cache)
        try {
            val prefs = getSharedPreferences("ititantra_device_identity", Context.MODE_PRIVATE)
            val cachedUser = prefs.getString("locked_username", "")
            val isLocked = prefs.getBoolean("is_locked", false)
            if (!cachedUser.isNullOrEmpty() && isLocked) {
                return JSONObject().apply {
                    put("username", cachedUser)
                    put("is_locked", true)
                    put("hardware_id", hwId)
                    put("source", "shared_prefs")
                }
            }
        } catch (e: Exception) {}

        // 2. Check Persistent External Storage (Survives Uninstall & Clear Data)
        for (file in getPersistentIdentityFiles()) {
            try {
                if (file.exists() && file.length() > 0) {
                    val raw = file.readText(Charsets.UTF_8).trim()
                    val decodedBytes = android.util.Base64.decode(raw, android.util.Base64.NO_WRAP)
                    val jsonStr = String(decodedBytes, Charsets.UTF_8)
                    val parsed = JSONObject(jsonStr)
                    val username = parsed.optString("username")
                    val isLocked = parsed.optBoolean("is_locked", false)

                    if (!username.isNullOrEmpty() && isLocked) {
                        Log.i("IDENTITY", "Restored identity '$username' from persistent file: ${file.absolutePath}")
                        // Re-seed SharedPreferences cache
                        try {
                            val prefs = getSharedPreferences("ititantra_device_identity", Context.MODE_PRIVATE)
                            prefs.edit()
                                .putString("locked_username", username)
                                .putBoolean("is_locked", true)
                                .putString("hardware_id", hwId)
                                .apply()
                        } catch (e: Exception) {}

                        parsed.put("source", "external_storage_recovery")
                        return parsed
                    }
                }
            } catch (e: Exception) {
                Log.w("IDENTITY", "Could not read identity from ${file.absolutePath}: ${e.message}")
            }
        }

        // 3. Not locked yet
        return JSONObject().apply {
            put("username", "")
            put("is_locked", false)
            put("hardware_id", hwId)
        }
    }

    private fun getPersistentChatFiles(): List<File> {
        val list = ArrayList<File>()
        try {
            val docsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
            if (docsDir != null) {
                if (!docsDir.exists()) docsDir.mkdirs()
                list.add(File(docsDir, ".ititantra_mesh_chats.dat"))
            }
        } catch (e: Exception) {}
        try {
            val downloadDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (downloadDir != null) {
                if (!downloadDir.exists()) downloadDir.mkdirs()
                list.add(File(downloadDir, ".ititantra_mesh_chats.dat"))
            }
        } catch (e: Exception) {}
        try {
            list.add(File(filesDir, "ititantra_mesh_chats.dat"))
        } catch (e: Exception) {}
        return list
    }

    private fun savePermanentChatHistory(chatJson: String): Boolean {
        if (chatJson.isBlank()) return false
        try {
            val prefs = getSharedPreferences("ititantra_mesh_chats", Context.MODE_PRIVATE)
            prefs.edit().putString("chat_history_json", chatJson).apply()
        } catch (e: Exception) {}

        for (file in getPersistentChatFiles()) {
            try {
                file.parentFile?.mkdirs()
                val encoded = android.util.Base64.encodeToString(
                    chatJson.toByteArray(Charsets.UTF_8),
                    android.util.Base64.NO_WRAP
                )
                file.writeText(encoded, Charsets.UTF_8)
            } catch (e: Exception) {
                Log.w("CHAT_STORAGE", "Could not write chats to ${file.absolutePath}: ${e.message}")
            }
        }
        return true
    }

    private fun loadPermanentChatHistory(): String {
        try {
            val prefs = getSharedPreferences("ititantra_mesh_chats", Context.MODE_PRIVATE)
            val cached = prefs.getString("chat_history_json", "")
            if (!cached.isNullOrEmpty() && cached.trim().startsWith("[")) {
                return cached
            }
        } catch (e: Exception) {}

        for (file in getPersistentChatFiles()) {
            try {
                if (file.exists() && file.length() > 0) {
                    val raw = file.readText(Charsets.UTF_8).trim()
                    val decodedBytes = android.util.Base64.decode(raw, android.util.Base64.NO_WRAP)
                    val jsonStr = String(decodedBytes, Charsets.UTF_8).trim()
                    if (jsonStr.startsWith("[")) {
                        Log.i("CHAT_STORAGE", "Restored chat history from ${file.absolutePath}")
                        try {
                            getSharedPreferences("ititantra_mesh_chats", Context.MODE_PRIVATE)
                                .edit().putString("chat_history_json", jsonStr).apply()
                        } catch (e: Exception) {}
                        return jsonStr
                    }
                }
            } catch (e: Exception) {
                Log.w("CHAT_STORAGE", "Could not read chats from ${file.absolutePath}: ${e.message}")
            }
        }
        return "[]"
    }

    // 5. JAVASCRIPT BRIDGE
    inner class BleMeshBridge {
        @JavascriptInterface
        fun savePermanentMeshChat(chatJson: String): Boolean {
            return savePermanentChatHistory(chatJson)
        }

        @JavascriptInterface
        fun getPermanentMeshChat(): String {
            return loadPermanentChatHistory()
        }

        @JavascriptInterface
        fun getPermanentDeviceIdentity(): String {
            return loadPermanentIdentity().toString()
        }

        @JavascriptInterface
        fun lockPermanentDeviceIdentity(username: String): Boolean {
            Log.i("IDENTITY", "lockPermanentDeviceIdentity called with: '$username'")
            return savePermanentIdentity(username)
        }

        @JavascriptInterface
        fun getDeviceGpsJson(): String {
            updateDeviceLocation()
            val place = resolveDevicePlaceName(currentLatitude, currentLongitude)
            val cleanPlace = place.replace("\"", "\\\"")
            return """{"lat": $currentLatitude, "lng": $currentLongitude, "place": "$cleanPlace"}"""
        }

        @JavascriptInterface
        fun getDevicePlaceName(): String {
            updateDeviceLocation()
            return resolveDevicePlaceName(currentLatitude, currentLongitude)
        }

        @JavascriptInterface
        fun startSpeechRecognition(lang: String) {
            val localeTag = mapToLocaleTag(lang)
            Log.i("NATIVE_ASR", "startSpeechRecognition for '$lang' -> locale '$localeTag' (using on-device Sherpa ONNX ASR)")
            activeSpeechLang = lang
            lastRecognizedText = ""
        }

        @JavascriptInterface
        fun stopSpeechRecognition(): String {
            Log.i("NATIVE_ASR", "stopSpeechRecognition called")
            return lastRecognizedText
        }

        @JavascriptInterface
        fun isLanguagePackInstalled(lang: String): Boolean {
            return isIndicModelInstalled(lang)
        }

        @JavascriptInterface
        fun downloadLanguagePack(lang: String) {
            val l = lang.trim().lowercase()
            val code = when {
                l.startsWith("ta") -> "ta"
                l.startsWith("te") -> "te"
                l.startsWith("hi") -> "hi"
                l.startsWith("ml") -> "ml"
                l.startsWith("kn") -> "kn"
                l.startsWith("mr") -> "mr"
                l.startsWith("bn") -> "bn"
                l.startsWith("gu") -> "gu"
                l.startsWith("en") -> "en"
                else -> l.take(2)
            }
            Log.i("MODEL_DL", "downloadLanguagePack requested for '$lang' -> code '$code'")

            downloadExecutor.execute {
                try {
                    val modelsDir = File(filesDir, "models")
                    if (!modelsDir.exists()) modelsDir.mkdirs()

                    val langDir = File(modelsDir, "indic-$code")
                    if (!langDir.exists()) langDir.mkdirs()

                    // 1. Download tokens.txt if needed
                    val tokensFile = if (code == "en") File(langDir, "tokens.txt") else File(modelsDir, "tokens.txt")
                    if (!tokensFile.exists() || tokensFile.length() < 500L) {
                        val tokensUrl = if (code == "en")
                            "https://huggingface.co/parismitaglobalsolutions/indicconformer-sherpa-onnx/resolve/main/en/tokens.txt"
                        else
                            "https://huggingface.co/parismitaglobalsolutions/indicconformer-sherpa-onnx/resolve/main/tokens.txt"
                        Log.i("MODEL_DL", "Downloading tokens from $tokensUrl...")
                        downloadFileWithProgress(tokensUrl, tokensFile) { _ -> }
                    }

                    // 2. Download model.int8.onnx
                    val modelFile = File(langDir, "model.int8.onnx")
                    val modelUrl = "https://huggingface.co/parismitaglobalsolutions/indicconformer-sherpa-onnx/resolve/main/$code/model.int8.onnx"
                    Log.i("MODEL_DL", "Downloading model from $modelUrl...")

                    val success = downloadFileWithProgress(modelUrl, modelFile) { pct ->
                        runOnUiThread {
                            webView.evaluateJavascript("if (window.onModelDownloadProgress) { window.onModelDownloadProgress('$lang', $pct); }", null)
                        }
                    }

                    if (success && modelFile.exists() && modelFile.length() > 5_000_000L) {
                        Log.i("MODEL_DL", "Successfully installed AI4Bharat IndicConformer for '$code' (${modelFile.length()} bytes)")
                        // Initialize recognizer immediately in background
                        getOrInitRecognizer(lang)
                        runOnUiThread {
                            webView.evaluateJavascript("if (window.onModelDownloadComplete) { window.onModelDownloadComplete('$lang'); }", null)
                        }
                    } else {
                        Log.e("MODEL_DL", "Failed downloading model for '$code'")
                        runOnUiThread {
                            webView.evaluateJavascript("if (window.onModelDownloadError) { window.onModelDownloadError('$lang', 'Download failed'); }", null)
                        }
                    }
                } catch (e: Exception) {
                    Log.e("MODEL_DL", "Exception during model download: ${e.message}", e)
                    runOnUiThread {
                        val errEscaped = JSONObject.quote(e.message ?: "Unknown error")
                        webView.evaluateJavascript("if (window.onModelDownloadError) { window.onModelDownloadError('$lang', $errEscaped); }", null)
                    }
                }
            }
        }

        @JavascriptInterface
        fun transcribeAudioBase64(base64Wav: String, lang: String): String {
            Log.i("SHERPA_ASR", "transcribeAudioBase64 called (length=${base64Wav.length}, lang=$lang)")
            try {
                val clean = if (base64Wav.contains(",")) base64Wav.substringAfter(",") else base64Wav
                val bytes = android.util.Base64.decode(clean.trim(), android.util.Base64.DEFAULT)
                val offset = if (bytes.size > 44 && bytes[0] == 'R'.code.toByte() && bytes[1] == 'I'.code.toByte()) 44 else 0
                val wavSampleRate = if (offset == 44 && bytes.size >= 28) {
                    val r = (bytes[24].toInt() and 0xFF) or
                            ((bytes[25].toInt() and 0xFF) shl 8) or
                            ((bytes[26].toInt() and 0xFF) shl 16) or
                            ((bytes[27].toInt() and 0xFF) shl 24)
                    if (r in 8000..96000) r else 16000
                } else {
                    16000
                }
                val shortCount = (bytes.size - offset) / 2
                val floatSamples = FloatArray(shortCount)
                for (i in 0 until shortCount) {
                    val low = bytes[offset + i * 2].toInt() and 0xFF
                    val high = bytes[offset + i * 2 + 1].toInt()
                    val s = (high shl 8) or low
                    floatSamples[i] = s.toShort() / 32768.0f
                }

                val finalSamples: FloatArray = if (wavSampleRate != 16000 && wavSampleRate > 0 && floatSamples.isNotEmpty()) {
                    val ratio = wavSampleRate.toDouble() / 16000.0
                    val newLen = Math.max(1, Math.floor(floatSamples.size / ratio).toInt())
                    val resampled = FloatArray(newLen)
                    for (i in 0 until newLen) {
                        val srcIdx = i * ratio
                        val idx0 = Math.floor(srcIdx).toInt()
                        val idx1 = Math.min(idx0 + 1, floatSamples.size - 1)
                        val frac = (srcIdx - idx0).toFloat()
                        resampled[i] = floatSamples[idx0] * (1.0f - frac) + floatSamples[idx1] * frac
                    }
                    Log.i("SHERPA_ASR", "Resampled audio from ${wavSampleRate}Hz (${floatSamples.size} samples) to 16000Hz (${resampled.size} samples)")
                    resampled
                } else {
                    floatSamples
                }

                val res = decodeSamples(finalSamples, lang)
                Log.i("SHERPA_ASR", "transcribeAudioBase64 decoded result ($lang): '$res'")
                if (res.isNotBlank()) {
                    runOnUiThread {
                        notifyWebviewSpeechResult(res, true)
                    }
                }
                return res
            } catch (e: Exception) {
                Log.e("SHERPA_ASR", "transcribeAudioBase64 failed: ${e.message}", e)
                return ""
            }
        }



        @JavascriptInterface
        fun broadcastMeshPacket(payloadJson: String) {
            autoEnableRadios()
            Log.i("AIR_MESH_BRIDGE", "Broadcasting mesh packet across Wi-Fi Neighbor + BLE + Aware + UDP: $payloadJson")
            broadcastWifiNeighborTweet(payloadJson)
            broadcastBlePacket(payloadJson)
            broadcastUdpPacket(payloadJson)
        }

        @JavascriptInterface
        fun ensureRadiosEnabled() {
            autoEnableRadios()
        }

        @JavascriptInterface
        fun isNativeAvailable(): Boolean = true

        @JavascriptInterface
        fun isWifiAwareSupported(): Boolean {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                packageManager.hasSystemFeature(PackageManager.FEATURE_WIFI_AWARE)
            } else false
        }

        @JavascriptInterface
        fun getGpsLatitude(): Double {
            updateDeviceLocation()
            return if (currentLatitude != 0.0) currentLatitude else 12.8718
        }

        @JavascriptInterface
        fun getGpsLongitude(): Double {
            updateDeviceLocation()
            return if (currentLongitude != 0.0) currentLongitude else 80.2185
        }

        @JavascriptInterface
        fun vibrateDevice(ms: Long) {
            vibratePhone(ms)
        }
    }

    private fun requestBluetoothEnable() {
        autoEnableRadios()
    }

    private var bleRotateThread: Thread? = null

    private fun advertiseSingleBlePayload(advPayload: ByteArray) {
        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(false)
            .setTimeout(0)
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(false)
            .addServiceData(MESH_16BIT_UUID, advPayload)
            .build()

        currentBleCallback?.let {
            try { bleAdvertiser?.stopAdvertising(it) } catch (e: Exception) {}
        }
        currentBleCallback = object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                Log.d("BLE_MESH", "Advertising ACTIVE: payload ${advPayload.size} bytes")
            }
            override fun onStartFailure(errorCode: Int) {
                Log.e("BLE_MESH", "Advertising FAILED: errorCode $errorCode (payload size ${advPayload.size} bytes)")
            }
        }
        try {
            bleAdvertiser?.startAdvertising(settings, data, currentBleCallback)
        } catch (e: Exception) {
            Log.e("BLE_MESH", "startAdvertising exception: ${e.message}")
        }
    }

    private fun broadcastBleCompactAck(cipherHi: Byte, cipherLo: Byte, hop: Int) {
        val ack = ByteArray(5)
        ack[0] = 0xA2.toByte() // Compact ACK magic
        ack[1] = cipherHi
        ack[2] = cipherLo
        ack[3] = hop.toByte()
        ack[4] = 0x01.toByte()
        advertiseSingleBlePayload(ack)
        // Automatically stop advertising ACK after 2.0s to release airwaves and stop infinite vibration
        Handler(Looper.getMainLooper()).postDelayed({
            try {
                currentBleCallback?.let { bleAdvertiser?.stopAdvertising(it) }
            } catch (e: Exception) {}
        }, 2000L)
    }

    private fun broadcastBlePacket(payloadJson: String) {
        autoEnableRadios()
        val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        val adapter = bm?.adapter
        if (adapter == null || !adapter.isEnabled) {
            Log.w("BLE_MESH", "Bluetooth is OFF, attempting auto-enable...")
            autoEnableRadios()
            return
        }

        bleAdvertiser = adapter.bluetoothLeAdvertiser
        if (bleAdvertiser == null) {
            Log.e("BLE_MESH", "Device does not support BLE Peripheral Advertising!")
            return
        }

        try {
            val json = JSONObject(payloadJson)
            val isAck = json.optString("type") == "mesh_relay_ack"
            val rawCipher = json.optString("cipher_code", "")
            val cleaned = rawCipher.filter { it.isLetterOrDigit() }
            val cipher = if (cleaned.length >= 4) {
                cleaned.takeLast(4).uppercase()
            } else {
                val randVal = (System.currentTimeMillis() and 0xFFFF).toInt()
                String.format("%04X", randVal)
            }
            recentSelfBroadcastCiphers.add(cipher.uppercase())
            val cipherInt = try { cipher.toInt(16) } catch (e: Exception) { (System.currentTimeMillis() and 0xFFFF).toInt() }
            val cipherHi = ((cipherInt shr 8) and 0xFF).toByte()
            val cipherLo = (cipherInt and 0xFF).toByte()
            val hop = json.optInt("hop_count", 1)
            val emergency = json.optBoolean("is_emergency", false)
            val isPrivateMesh = json.optBoolean("is_local_mesh_private", false) || json.optString("session_id") == "LOCAL_MESH_PRIVATE"
            val senderUser = json.optString("sender_username", "@field_user")
            val targetUser = json.optString("target_username", "@all_friends")
            val encText = json.optString("encrypted_text", "")
            val rawText = json.optString("text", "")

            // For Mode 3 Private E2EE packets, format as "🔒|sender|target|cipher|encrypted_text"
            val text = if (isPrivateMesh) {
                val effectiveEnc = if (encText.isNotBlank()) encText else android.util.Base64.encodeToString(rawText.toByteArray(StandardCharsets.UTF_8), android.util.Base64.NO_WRAP)
                "🔒|$senderUser|$targetUser|$cipher|$effectiveEnc"
            } else if (rawText.isNotBlank()) {
                rawText
            } else {
                "🚨 SOS: Emergency Rescue Needed"
            }

            if (isAck) {
                broadcastBleCompactAck(cipherHi, cipherLo, hop)
                return
            }

            val isGenericFallback = rawText.isBlank() || rawText.startsWith("🚨 SOS: I am in emergency") || rawText.startsWith("🚨 SOS")
            val isEmergencyBeacon = emergency || json.optString("network_mode") == "mode-4-satellite-beacon" || json.optString("type") == "emergency_alert"

            val packets = mutableListOf<ByteArray>()

            if (isEmergencyBeacon && isGenericFallback) {
                // 🚀 ULTRA-FAST 1-TAP SOS: Single 1-Chunk Packet (Sub-100ms Instant Air Dispatch!)
                val beaconText = "🚨 SOS"
                val compactBytes = TantraMeshCodec.encodeCompact(beaconText)
                val packet = ByteArray(5 + compactBytes.size)
                packet[0] = 0xA1.toByte() // Tantra Compact Mesh Magic
                packet[1] = cipherHi
                packet[2] = cipherLo
                packet[3] = 0x01.toByte() // Chunk 0 of 1 (totalChunks = 1)
                packet[4] = 1.toByte()    // Emergency flag = 1
                System.arraycopy(compactBytes, 0, packet, 5, compactBytes.size)
                packets.add(packet)
            } else {
                // Multi-chunk encoding for custom text / voice notes
                val compactBytes = TantraMeshCodec.encodeCompact(text)
                val chunkSize = 18 // 18 compact bytes per chunk. Total packet = 5 header + 18 = 23 bytes <= 24 bytes BLE limit
                val totalChunks = Math.max(1, Math.min(15, Math.ceil(compactBytes.size.toDouble() / chunkSize).toInt()))

                for (cIdx in 0 until totalChunks) {
                    val start = cIdx * chunkSize
                    val end = Math.min(start + chunkSize, compactBytes.size)
                    val chunkSlice = if (start < compactBytes.size) compactBytes.copyOfRange(start, end) else ByteArray(0)

                    val packet = ByteArray(5 + chunkSlice.size)
                    packet[0] = 0xA1.toByte() // Tantra Compact Mesh Magic
                    packet[1] = cipherHi
                    packet[2] = cipherLo
                    val metaByte = (((cIdx and 0x0F) shl 4) or (totalChunks and 0x0F)).toByte()
                    packet[3] = metaByte
                    val bleEmergByte = if (emergency) 1 else 0
                    packet[4] = bleEmergByte.toByte()
                    System.arraycopy(chunkSlice, 0, packet, 5, chunkSlice.size)
                    packets.add(packet)
                }
            }

            bleRotateThread?.interrupt()
            bleRotateThread = Thread {
                try {
                    val startTime = System.currentTimeMillis()
                    var cIdx = 0
                    // Ultra-fast rotation: 220ms for multi-chunk (5x faster than 1200ms)
                    val sleepTime = if (packets.size == 1) 1500L else 220L
                    while (System.currentTimeMillis() - startTime < 30000L && !Thread.currentThread().isInterrupted) {
                        val advPayload = packets[cIdx]
                        advertiseSingleBlePayload(advPayload)
                        Thread.sleep(sleepTime)
                        if (packets.size > 1) {
                            cIdx = (cIdx + 1) % packets.size
                        }
                    }
                    try {
                        currentBleCallback?.let { bleAdvertiser?.stopAdvertising(it) }
                    } catch (e: Exception) {}
                } catch (e: InterruptedException) {
                } catch (e: Exception) {
                    Log.e("BLE_MESH", "Rotate advertiser error: ${e.message}")
                }
            }
            bleRotateThread?.start()
            Log.i("BLE_MESH", "SUCCESS: Started Fast BLE Mesh Beacon (${packets.size} packets, cipher=$cipher)")
        } catch (e: Exception) {
            Log.e("BLE_MESH", "Error broadcasting BLE: ${e.message}")
        }
    }


    @Volatile private var isBleScanning = false
    @Volatile private var isScanStarting = false
    private var bleRetryAttempts = 0
    private val scanRetryHandler = Handler(Looper.getMainLooper())
    private var lastScanStartTime = 0L
    private var bleScanCallback: ScanCallback? = null

    private fun ensureBleScannerPeriodic() {
        Thread {
            while (true) {
                try {
                    // Refresh BLE scan every 30 seconds to prevent Android OS from silently throttling long scans
                    Thread.sleep(30000)
                    val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
                    if (bm?.adapter?.isEnabled == true && bleRetryAttempts == 0) {
                        runOnUiThread {
                            try {
                                bleScanCallback?.let { bleScanner?.stopScan(it) }
                            } catch (e: Exception) {}
                            isBleScanning = false
                            isScanStarting = false
                            startBleScanner()
                        }
                    }
                } catch (e: Exception) {}
            }
        }.start()
    }

    @Synchronized
    private fun startBleScanner() {
        val now = System.currentTimeMillis()
        if (isBleScanning || isScanStarting) {
            return
        }
        // Rate-limit start attempts: at least 2.5s between calls
        if (now - lastScanStartTime < 2500L) {
            return
        }
        lastScanStartTime = now

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

        isScanStarting = true
        try {
            // Clean up any stale registration on the previous callback
            bleScanCallback?.let {
                try { bleScanner?.stopScan(it) } catch (e: Exception) {}
            }

            val settings = ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .setReportDelay(0)
                .build()

            val filter = ScanFilter.Builder().build()
            val filters = listOf(filter)

            val callback = object : ScanCallback() {
                override fun onScanResult(callbackType: Int, result: ScanResult?) {
                    val scanRecord = result?.scanRecord ?: return

                    // Check MESH_16BIT_UUID service data
                    var serviceData = scanRecord.getServiceData(MESH_16BIT_UUID)
                    if (serviceData == null) {
                        // Fallback check in serviceData map across all keys
                        val allData = scanRecord.serviceData
                        for ((uuid, data) in allData) {
                            if (uuid != null && uuid.toString().contains("180d", ignoreCase = true)) {
                                serviceData = data
                                break
                            }
                        }
                    }

                    if (serviceData != null && serviceData.isNotEmpty()) {
                        val firstByte = serviceData[0].toInt() and 0xFF
                        if (firstByte == 0xA1 && serviceData.size >= 5) {
                            handleInboundCompactBlePacket(serviceData, result.rssi)
                        } else if (firstByte == 0xA2 && serviceData.size >= 4) {
                            handleInboundCompactBleAck(serviceData)
                        } else {
                            val tokenStr = String(serviceData, StandardCharsets.UTF_8)
                            Log.i("BLE_MESH", "AIR INTERCEPT: Captured legacy token '$tokenStr' (RSSI: ${result.rssi} dBm)")
                            handleInboundBleToken(tokenStr)
                        }
                    }
                }

                override fun onBatchScanResults(results: MutableList<ScanResult>?) {
                    results?.forEach { onScanResult(ScanSettings.CALLBACK_TYPE_ALL_MATCHES, it) }
                }

                override fun onScanFailed(errorCode: Int) {
                    Log.e("BLE_MESH", "BLE Scan Failed: code=$errorCode (attempt=$bleRetryAttempts)")
                    isBleScanning = false

                    bleRetryAttempts++
                    // Android 14+ enforces max 5 scan starts per 30s. Back off by at least 15s to respect OS throttle
                    val backoffMs = if (bleRetryAttempts >= 3) {
                        bleRetryAttempts = 0
                        25000L
                    } else {
                        15000L
                    }
                    Log.w("BLE_MESH", "Backing off for ${backoffMs / 1000}s before next BLE scan attempt...")
                    scanRetryHandler.removeCallbacksAndMessages(null)
                    scanRetryHandler.postDelayed({
                        startBleScanner()
                    }, backoffMs)
                }
            }
            bleScanCallback = callback

            bleScanner?.startScan(filters, settings, callback)
            isBleScanning = true
            Log.i("BLE_MESH", "SUCCESS: BLE Scanner Active (Balanced Mode)!")
        } catch (e: Exception) {
            Log.e("BLE_MESH", "startBleScanner exception: ${e.message}")
            isBleScanning = false
        } finally {
            isScanStarting = false
        }
    }

    private val chunkAssembler = java.util.concurrent.ConcurrentHashMap<String, java.util.concurrent.ConcurrentHashMap<Int, String>>()
    private val assembledNotifiedLength = java.util.concurrent.ConcurrentHashMap<String, Int>()

    private val compactChunkAssembler = java.util.concurrent.ConcurrentHashMap<String, java.util.concurrent.ConcurrentHashMap<Int, ByteArray>>()
    private val compactAssembledLength = java.util.concurrent.ConcurrentHashMap<String, Int>()
    private val compactRelayedCiphers = java.util.concurrent.ConcurrentHashMap<String, Boolean>()
    private val compactRelayTimers = java.util.concurrent.ConcurrentHashMap<String, Boolean>()
    private val relayedPacketKeys = java.util.concurrent.ConcurrentHashMap<String, Long>()
    private val handledAckCiphers = java.util.concurrent.ConcurrentHashMap<String, Boolean>()

    private fun handleInboundCompactBleAck(data: ByteArray) {
        if (data.size < 4) return
        val cipherHi = data[1].toInt() and 0xFF
        val cipherLo = data[2].toInt() and 0xFF
        val cipher = String.format("%04X", (cipherHi shl 8) or cipherLo)
        
        // Strict deduplication: Only process ACK and vibrate ONCE per cipher!
        if (handledAckCiphers.putIfAbsent(cipher, true) != null) {
            return
        }

        val hop = data[3].toInt() and 0xFF
        val ackObj = JSONObject().apply {
            put("type", "mesh_relay_ack")
            put("id", "air_${cipher.lowercase()}_ack")
            put("cipher_code", cipher)
            put("hop_count", hop)
            put("status", "delivered")
        }
        Log.i("BLE_MESH", "SUCCESS: Received Compact Mesh ACK for cipher=$cipher (Handled once)")
        // Stop transmitter carousel on Phone 1 immediately
        bleRotateThread?.interrupt()
        try { bleAdvertiser?.stopAdvertising(currentBleCallback) } catch (e: Exception) {}
        runOnUiThread {
            notifyWebviewPacketReceived(ackObj.toString(), "BLE_MESH_ACK")
        }
    }

    private fun handleInboundCompactBlePacket(data: ByteArray, rssi: Int) {
        if (data.size < 5) return
        val cipherHi = data[1].toInt() and 0xFF
        val cipherLo = data[2].toInt() and 0xFF
        val cipher = String.format("%04X", (cipherHi shl 8) or cipherLo)
        val meta = data[3].toInt() and 0xFF
        val cIdx = (meta shr 4) and 0x0F
        val totalChunks = Math.max(1, meta and 0x0F)
        val rawEmerg = (data[4].toInt() and 0xFF) == 1
        val chunkSlice = if (data.size > 5) data.copyOfRange(5, data.size) else ByteArray(0)

        val isSelf = recentSelfBroadcastCiphers.contains(cipher.uppercase())
        if (isSelf) {
            Log.d("BLE_MESH", "Ignoring own broadcast cipher $cipher")
            return
        }

        val chunkMap = compactChunkAssembler.computeIfAbsent(cipher) { java.util.concurrent.ConcurrentHashMap() }
        chunkMap[cIdx] = chunkSlice

        val hasAll = (0 until totalChunks).all { chunkMap.containsKey(it) }
        val alreadyRelayed = compactRelayedCiphers[cipher] == true

        // 🚀 FULL MESSAGE INTEGRITY: Wait for ALL chunks to arrive so the complete emergency text is preserved!
        // Single-chunk 1-tap beacons (totalChunks == 1) have hasAll=true immediately (sub-100ms instant).
        if (hasAll && !alreadyRelayed) {
            triggerCompactRelay(cipher, cipherHi, cipherLo, totalChunks, rawEmerg, rssi)
        } else if (rawEmerg && !alreadyRelayed && !compactRelayTimers.containsKey(cipher)) {
            // Safety fallback: If subsequent chunks are delayed or dropped over radio airwaves,
            // fallback after 2.5s to relay whatever arrived instead of dropping the beacon.
            compactRelayTimers[cipher] = true
            Handler(Looper.getMainLooper()).postDelayed({
                compactRelayTimers.remove(cipher)
                if (compactRelayedCiphers[cipher] != true) {
                    triggerCompactRelay(cipher, cipherHi, cipherLo, totalChunks, rawEmerg, rssi)
                }
            }, 2500L)
        }
    }

    private fun triggerCompactRelay(
        cipher: String,
        cipherHi: Int,
        cipherLo: Int,
        totalChunks: Int,
        rawEmerg: Boolean,
        rssi: Int
    ) {
        if (compactRelayedCiphers.putIfAbsent(cipher, true) != null) return

        val chunkMap = compactChunkAssembler[cipher] ?: return
        val byteStream = java.io.ByteArrayOutputStream()
        for (i in 0 until totalChunks) {
            val chunk = chunkMap[i]
            if (chunk != null) {
                byteStream.write(chunk)
            } else {
                break
            }
        }
        val decodedText = TantraMeshCodec.decodeCompact(byteStream.toByteArray())
        val isEmerg = rawEmerg || decodedText.contains("🚨") || decodedText.contains("SOS") || decodedText.contains("Emergency")

        compactAssembledLength[cipher] = decodedText.length
        // Send ACK once when complete so Phone 1 stops broadcasting
        broadcastBleCompactAck(cipherHi.toByte(), cipherLo.toByte(), 2)

        val isPrivateMesh = decodedText.startsWith("🔒|") || decodedText.startsWith("MESH3|")
        // Strict Vibration: ONLY critical emergency SOS alerts vibrate
        if (isEmerg) {
            vibratePhone(250)
        }
        updateDeviceLocation()
        val lat = if (currentLatitude != 0.0) currentLatitude else 12.8718
        val lon = if (currentLongitude != 0.0) currentLongitude else 80.2185

        val isGovt = decodedText.contains("GOVT") || decodedText.contains("COMMAND")
        val place = resolveDevicePlaceName(lat, lon)
        val fullText = if (decodedText.isNotBlank() && decodedText != "🚨 SOS" && !decodedText.startsWith("🚨 SOS: HELP!")) {
            decodedText
        } else {
            "🚨 SOS: I am in emergency, kindly help me! [$place - GPS: ${String.format(java.util.Locale.US, "%.5f", lat)}°N, ${String.format(java.util.Locale.US, "%.5f", lon)}°E]"
        }

        var senderUser = if (isGovt) "@command_center" else "@victim_phone_1"
        var targetUser = if (isGovt) "@all_citizens" else "@command_center"
        var encPayload = ""
        var cipherToUse = cipher
        var displayText = if (isGovt) decodedText else fullText

        if (isPrivateMesh) {
            val parts = decodedText.split("|")
            senderUser = parts.getOrNull(1) ?: "@citizen"
            targetUser = parts.getOrNull(2) ?: "@all_friends"
            cipherToUse = parts.getOrNull(3) ?: cipher
            encPayload = parts.getOrNull(4) ?: ""
            displayText = "🔒 Encrypted Message (Locked for $targetUser)"
        }

        val cleanC = cipherToUse.lowercase().replace("[^a-z0-9]".toRegex(), "")
        val sdf = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.US).apply {
            timeZone = java.util.TimeZone.getTimeZone("Asia/Kolkata")
        }
        val istTime = sdf.format(java.util.Date()).uppercase()

        val packetObj = JSONObject().apply {
            put("id", "air_${cleanC}")
            put("channel_type", if (isPrivateMesh) "CIVILIAN_P2P" else "EMERGENCY_ALERT")
            put("cipher_code", cipherToUse)
            put("hop_count", 2)
            put("is_emergency", isEmerg && !isPrivateMesh)
            put("text", displayText)
            put("latitude", lat)
            put("longitude", lon)
            put("address_name", "$place [GPS: ${String.format(java.util.Locale.US, "%.5f", lat)}°N, ${String.format(java.util.Locale.US, "%.5f", lon)}°E]")
            put("network_mode", if (isEmerg && !isPrivateMesh) "mode-4-satellite-beacon" else "mode-3-ai-mesh")
            put("gateway_node", if (isGovt) "🏢 Command Center (Downlink BLE)" else "📱 Phone 2 (Silent Mesh Relay Node)")
            put("timestamp", java.time.Instant.now().toString())
            put("display_time", istTime)
            put("type", if (isEmerg && !isPrivateMesh) "emergency_alert" else "voice_message")
            put("sender_role", if (isGovt) "command" else "field")
            put("sender_username", senderUser)
            put("target_username", targetUser)
            put("is_local_mesh_private", isPrivateMesh)
            put("session_id", if (isPrivateMesh) "LOCAL_MESH_PRIVATE" else "DEMO_GLOBAL_SESSION_01")
            if (isPrivateMesh) {
                put("is_locked", true)
                put("encrypted_text", encPayload)
                put("local_mode", "mode-3-p2p-nan")
            }
        }
        Log.i("BLE_MESH", "AIR INTERCEPT COMPACT FINAL: ($totalChunks/$totalChunks chunks, text='$displayText', cipher=$cipherToUse, RSSI=$rssi dBm, isGovt=$isGovt, isPrivate=$isPrivateMesh)")
        runOnUiThread {
            notifyWebviewPacketReceived(packetObj.toString(), "BLE_MESH_RELAY")
        }

        // Dual Relay directly to local gateway and Cloudflare ONLY IF NOT FROM COMMAND CENTER!
        if (!isGovt) {
            val relayPath = if (isPrivateMesh) "/api/mesh/p2p/send" else "/api/messages/send"
            Thread {
                val targets = listOf(
                    "https://itantra-4yzo.onrender.com$relayPath",
                    "http://127.0.0.1:8000$relayPath",
                    "http://192.168.137.146:8000$relayPath",
                    "http://192.168.137.1:8000$relayPath"
                )
                for (target in targets) {
                    try {
                        val url = java.net.URL(target)
                        val conn = url.openConnection() as java.net.HttpURLConnection
                        conn.requestMethod = "POST"
                        conn.setRequestProperty("Content-Type", "application/json")
                        conn.doOutput = true
                        conn.connectTimeout = 2500
                        conn.readTimeout = 2500
                        conn.outputStream.use { os ->
                            os.write(packetObj.toString().toByteArray(StandardCharsets.UTF_8))
                        }
                        val code = conn.responseCode
                        if (code in 200..299) {
                            Log.i("BLE_MESH", "SUCCESS: Compact Dual Relay to $target delivered (HTTP $code)")
                            break
                        }
                    } catch (e: Exception) {}
                }
            }.start()
        }
    }

    private fun handleInboundBleToken(token: String) {
        val now = System.currentTimeMillis()
        val lastSeen = processedTokens[token]
        if (lastSeen != null && (now - lastSeen) < 1500L) {
            return
        }
        processedTokens[token] = now

        if (processedTokens.size > 300) {
            val iter = processedTokens.entries.iterator()
            while (iter.hasNext()) {
                val entry = iter.next()
                if (now - entry.value > 60000L) iter.remove()
            }
        }

        // Handle ACK token: A:7A4B:H2:
        if (token.startsWith("A:")) {
            val parts = token.split(":")
            if (parts.size >= 3) {
                val cipher = parts[1]
                val hop = parts[2].replace("H", "").toIntOrNull() ?: 2
                val ackObj = JSONObject().apply {
                    put("type", "mesh_relay_ack")
                    put("id", "air_${cipher.lowercase()}_ack")
                    put("cipher_code", cipher)
                    put("hop_count", hop)
                    put("status", "delivered")
                }
                Log.i("BLE_MESH", "SUCCESS: Received Mesh ACK for cipher=$cipher")
                runOnUiThread {
                    notifyWebviewPacketReceived(ackObj.toString(), "BLE_MESH_ACK")
                }
            }
            return
        }

        // Handle Multi-Chunk Payload token: P:$cipher:C$cIdx:$totalChunks:E$emergency:$chunkText
        if (token.startsWith("P:")) {
            val parts = token.split(":")
            if (parts.size >= 5 && parts[2].startsWith("C")) {
                val cipher = parts[1]
                val cIdx = parts[2].substring(1).toIntOrNull() ?: 0
                val totalChunks = parts[3].toIntOrNull() ?: 1
                val isEmerg = parts[4].startsWith("E1")
                val chunkText = if (parts.size >= 6) parts.subList(5, parts.size).joinToString(":") else ""

                val chunkMap = chunkAssembler.computeIfAbsent(cipher) { java.util.concurrent.ConcurrentHashMap() }
                chunkMap[cIdx] = chunkText

                val assembled = (0 until totalChunks).mapNotNull { chunkMap[it] }.joinToString("")
                val prevLen = assembledNotifiedLength[cipher] ?: 0

                if (assembled.length > prevLen) {
                    assembledNotifiedLength[cipher] = assembled.length
                    val uniqueSeq = System.currentTimeMillis() % 100000
                    updateDeviceLocation()
                    val lat = if (currentLatitude != 0.0) currentLatitude else 12.8718
                    val lon = if (currentLongitude != 0.0) currentLongitude else 80.2185
                    val packetObj = JSONObject().apply {
                        put("id", "air_${cipher.lowercase()}_${uniqueSeq}")
                        put("cipher_code", cipher)
                        put("hop_count", 2)
                        put("is_emergency", isEmerg)
                        put("text", assembled)
                        put("latitude", lat)
                        put("longitude", lon)
                        put("address_name", "GPS (${String.format(java.util.Locale.US, "%.5f", lat)}°N, ${String.format(java.util.Locale.US, "%.5f", lon)}°E)")
                        put("network_mode", if (isEmerg) "mode-4-satellite-beacon" else "mode-3-ai-mesh")
                        put("gateway_node", "📱 Phone 2 (BLE Mesh Relay Node)")
                        put("timestamp", "${System.currentTimeMillis()}")
                        if (isEmerg) put("type", "emergency_alert") else put("type", "voice_message")
                        put("sender_role", "field")
                        put("sender_username", "@victim_phone_1")
                    }
                    Log.i("BLE_MESH", "AIR INTERCEPT: Assembled (${chunkMap.size}/$totalChunks chunks): '$assembled'")
                    runOnUiThread {
                        notifyWebviewPacketReceived(packetObj.toString(), "BLE_MESH_RELAY")
                    }
                }
                return
            }
            if (parts.size >= 4) {
                val cipher = parts[1]
                val hop = parts[2].replace("H", "").toIntOrNull() ?: 1
                val textPreview = if (parts.size >= 5) parts.subList(4, parts.size).joinToString(":") else ""
                val isEmerg = parts[3].startsWith("E1") || textPreview.contains("SATELL") || textPreview.contains("SOS")
                val uniqueSeq = System.currentTimeMillis() % 100000
                updateDeviceLocation()
                val lat = if (currentLatitude != 0.0) currentLatitude else 12.8718
                val lon = if (currentLongitude != 0.0) currentLongitude else 80.2185

                val place = resolveDevicePlaceName(lat, lon)
                val fullText = if (textPreview.isNotBlank()) {
                    textPreview
                } else if (isEmerg) {
                    "🚨 SOS: I am in emergency, kindly help me! [$place - GPS: ${String.format(java.util.Locale.US, "%.5f", lat)}°N, ${String.format(java.util.Locale.US, "%.5f", lon)}°E]"
                } else {
                    "🎙️ Voice / Text Message (Mode 3 Radio Mesh)"
                }

                val packetObj = JSONObject().apply {
                    put("id", "air_${cipher.lowercase()}_${uniqueSeq}")
                    put("cipher_code", cipher)
                    put("hop_count", hop + 1)
                    put("is_emergency", isEmerg)
                    put("text", fullText)
                    put("latitude", lat)
                    put("longitude", lon)
                    put("address_name", "$place [GPS: ${String.format(java.util.Locale.US, "%.5f", lat)}°N, ${String.format(java.util.Locale.US, "%.5f", lon)}°E]")
                    put("network_mode", if (isEmerg) "mode-4-satellite-beacon" else "mode-3-ai-mesh")
                    put("gateway_node", "📱 Phone 2 (BLE Mesh Relay Node)")
                    put("timestamp", "${System.currentTimeMillis()}")
                    if (isEmerg) put("type", "emergency_alert") else put("type", "voice_message")
                    put("sender_role", "field")
                    put("sender_username", "@victim_phone_1")
                }

                Log.i("BLE_MESH", "AIR INTERCEPT: Relaying packet id=air_${cipher.lowercase()}_${uniqueSeq} isEmerg=$isEmerg")
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
                                    targetBroadcastIps.add(bcast.hostAddress!!)
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
        val now = System.currentTimeMillis()
        val isAck = rawPayload.contains("\"type\":\"mesh_relay_ack\"") || channel == "BLE_MESH_ACK"

        val isPrivateMesh = rawPayload.contains("\"is_local_mesh_private\":true") ||
                            rawPayload.contains("\"is_local_mesh_private\": true") ||
                            rawPayload.contains("\"session_id\":\"LOCAL_MESH_PRIVATE\"") ||
                            rawPayload.contains("\"session_id\": \"LOCAL_MESH_PRIVATE\"") ||
                            rawPayload.contains("LOCK#") ||
                            rawPayload.contains("🔒")

        val isEmergency = rawPayload.contains("\"is_emergency\":true") || 
                          rawPayload.contains("\"is_emergency\": true") ||
                          rawPayload.contains("🚨") ||
                          rawPayload.contains("SOS")
        // Vibration is managed safely with strict packet-ID deduplication inside WebView triggerSafeHaptic.
        // Native layer only sounds tone for new critical emergency SOS
        if (isEmergency && !isAck && (now - lastHapticTimestamp > 5000L)) {
            lastHapticTimestamp = now
            try {
                if (!isPrivateMesh) {
                    val toneGen = android.media.ToneGenerator(android.media.AudioManager.STREAM_NOTIFICATION, 70)
                    toneGen.startTone(android.media.ToneGenerator.TONE_PROP_BEEP2, 180)
                    Handler(Looper.getMainLooper()).postDelayed({
                        try { toneGen.release() } catch (e: Exception) {}
                    }, 350)
                }
            } catch (e: Exception) {
                Log.e("MESH_AIR", "Error in tone: ${e.message}")
            }
        }

        val safeJson = rawPayload.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n")
        val jsCode = "if (window.onNativeMeshPacketReceived) { window.onNativeMeshPacketReceived(\"$safeJson\", \"$channel\"); }"
        webView.evaluateJavascript(jsCode, null)

        // 🚀 Native Dual Relay: Phone 2 forwards intercepted mesh packet to Command Center over Internet / Hotspot
        val isFromCommand = rawPayload.contains("\"sender_role\":\"command\"") || 
                            rawPayload.contains("\"sender_role\": \"command\"") || 
                            rawPayload.contains("\"sender_username\":\"@command_center\"") || 
                            rawPayload.contains("\"sender_username\": \"@command_center\"") ||
                            rawPayload.contains("🚨 EVACUATION ORDER") ||
                            rawPayload.contains("EMERGENCY RELIEF DISPATCH")
        if (!isAck && !isFromCommand) {
            val dedupKey = try {
                val j = JSONObject(rawPayload)
                val c = j.optString("cipher_code")
                val t = j.optString("text").take(40)
                if (c.isNotEmpty()) c else t
            } catch (e: Exception) { rawPayload.take(40) }
            val lastRelayTime = relayedPacketKeys[dedupKey] ?: 0L
            if (now - lastRelayTime < 15000L) {
                // Already relayed this packet to command center within 15 seconds! Skip duplicate flood!
                return
            }
            relayedPacketKeys[dedupKey] = now

            val relayPath = if (isPrivateMesh) "/api/mesh/p2p/send" else "/api/messages/send"
            Thread {
                val endpoints = listOf(
                    "https://itantra-4yzo.onrender.com$relayPath",
                    "http://127.0.0.1:8000$relayPath",
                    "http://192.168.137.146:8000$relayPath",
                    "http://192.168.137.1:8000$relayPath"
                )
                for (ep in endpoints) {
                    try {
                        val url = java.net.URL(ep)
                        val conn = url.openConnection() as java.net.HttpURLConnection
                        conn.connectTimeout = 3000
                        conn.readTimeout = 3000
                        conn.requestMethod = "POST"
                        conn.setRequestProperty("Content-Type", "application/json")
                        conn.doOutput = true
                        conn.outputStream.use { os ->
                            os.write(rawPayload.toByteArray(java.nio.charset.StandardCharsets.UTF_8))
                        }
                        val code = conn.responseCode
                        Log.i("NATIVE_RELAY", "Relayed to $ep -> HTTP $code")
                        if (code in 200..299) {
                            try {
                                val json = JSONObject(rawPayload)
                                val ackObj = JSONObject().apply {
                                    put("type", "mesh_relay_ack")
                                    put("id", json.optString("id"))
                                    put("cipher_code", json.optString("cipher_code"))
                                    put("status", "delivered")
                                    put("hop_count", 2)
                                    put("gateway_node", "📱 Phone 2 (BLE Mesh Relay Node)")
                                    put("timestamp", System.currentTimeMillis().toString())
                                }
                                broadcastBlePacket(ackObj.toString())
                                broadcastWifiNeighborTweet(ackObj.toString())
                            } catch (e: Exception) {}
                            break
                        }
                    } catch (e: Exception) {}
                }
            }.start()
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        val evalJs = intent?.getStringExtra("eval_js")
        if (!evalJs.isNullOrEmpty()) {
            runOnUiThread { webView.evaluateJavascript(evalJs, null) }
        }
        val broadcastJson = intent?.getStringExtra("broadcast_json")
        if (!broadcastJson.isNullOrEmpty()) {
            BleMeshBridge().broadcastMeshPacket(broadcastJson)
        }
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
                    .setTitle("📍 Location Services Required")
                    .setMessage(
                        "Device Location (GPS) must be enabled to send your exact distress coordinates to rescue teams and establish peer-to-peer Wi-Fi Aware & BLE radio mesh connectivity.\n\n" +
                        "Please turn on Location Services."
                    )
                    .setPositiveButton("Turn ON Location") { _, _ ->
                        startActivity(android.content.Intent(android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS))
                    }
                    .setNegativeButton("Later", null)
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
        autoEnableRadios()
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
