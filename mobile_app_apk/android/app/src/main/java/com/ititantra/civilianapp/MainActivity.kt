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
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.nio.charset.StandardCharsets
import java.util.*

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
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
            }.

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

    // 4. JAVASCRIPT BRIDGE
    inner class BleMeshBridge {
        @JavascriptInterface
        fun startSpeechRecognition(lang: String) {}

        @JavascriptInterface
        fun stopSpeechRecognition() {}

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
            val cipher = json.optString("cipher_code", "CIPHER#AI-0000").replace(" ", "").take(6)
            val hop = json.optInt("hop_count", 1)
            val emergency = if (json.optBoolean("is_emergency", false)) "1" else "0"
            val text = json.optString("text", "")
            val compressedText = text.take(6)

            val bleToken = "P:$cipher:H$hop:E$emergency:$compressedText"
            val tokenBytes = bleToken.toByteArray(StandardCharsets.UTF_8).take(20).toByteArray()

            val settings = AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                .setConnectable(false)
                .setTimeout(3000)
                .build()

            val data = AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .setIncludeTxPowerLevel(false)
                .addServiceData(MESH_16BIT_UUID, tokenBytes)
                .build()

            currentBleCallback?.let { bleAdvertiser?.stopAdvertising(it) }
            currentBleCallback = object : AdvertiseCallback() {
                override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                    Log.i("BLE_MESH", "SUCCESS: BLE Mesh Beacon Active!")
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
                val textPreview = if (parts.size >= 5) parts[4] else "SOS"

                val packetObj = JSONObject().apply {
                    put("id", "ble_" + System.currentTimeMillis())
                    put("cipher_code", cipher)
                    put("hop_count", hop + 1)
                    put("is_emergency", isEmerg)
                    put("text", "📡 Relayed via BLE Mesh: $textPreview")
                    put("network_mode", "mode-3-ai-mesh")
                    put("gateway_node", "📱 Phone 2 (BLE Mesh Relay Node)")
                    put("timestamp", System.currentTimeMillis())
                    if (isEmerg) put("type", "emergency_alert") else put("type", "voice_message")
                    put("sender_role", "field")
                    put("sender_username", "@field_user")
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
                val targetBroadcastIps = mutableSetOf("255.255.255.255")

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
                Log.i("UDP_MESH", "SUCCESS: Dispatched UDP Multi-Subnet Packet (${data.size} bytes)")
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

    override fun onDestroy() {
        super.onDestroy()
        isListeningUdp = false
        udpSocket?.close()
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
