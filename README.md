# iTantra: Low-Bandwidth Disaster Communication & Mesh Gateway

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-blue.svg)](https://github.com/Raj-cloud12/itantra)
[![Release](https://img.shields.io/badge/Release-iTantra.apk%20v1.0-emerald.svg)](https://github.com/Raj-cloud12/itantra)
[![Security](https://img.shields.io/badge/Encryption-AES--256--GCM-brightgreen.svg)](https://github.com/Raj-cloud12/itantra)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **iTantra** is an offline-first emergency communication platform. When extreme weather, floods, earthquakes, or cyclones knock out cellular towers and fiber backhauls, iTantra forms a peer-to-peer radio mesh network across standard Android smartphones to relay distress alerts, voice notes, and GPS beacons to emergency command centers — without requiring active cellular coverage or internet access.

📥 **[Download Android APK (v1.0)](https://itantra-4yzo.onrender.com/download)** • 🌐 **[Live Deployment](https://itantra-4yzo.onrender.com)** • 📋 **[MIT License](LICENSE)**

---

## 🎯 The Problem

During major disasters (cyclones, catastrophic floods, earthquakes), terrestrial telecommunications infrastructure frequently fails:
- Base stations lose power within hours as backup generator fuel is depleted.
- Underground optical fiber lines suffer physical breaks from falling trees, flooding, and ground movement.
- Civilians in affected zones cannot reach emergency services (112, NDRF, local dispatch), leaving responders with no ground-level situational awareness.

**iTantra bridges this blackout.** Participating smartphones act as self-healing relay nodes in a local ad-hoc radio mesh, hopping distress packets forward until they reach an uplink node with network connectivity.

---

## 🛰️ 4-Tier Communication Fallback Architecture

iTantra dynamically adapts transmission strategies according to available radio links and channel conditions:

`
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   iTantra Fallback Hierarchy                                │
├────────────────────────────────┬────────────────────────────────────────────────────────────┤
│ Tier 1: 4G / 5G Broadband      │ High-speed bidirectional WebSockets & live voice telemetry │
├────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Tier 2: 2G Audio Link          │ Ultra-compact voice frames compressed to ~1.2 KB           │
├────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Tier 3: BLE & Wi-Fi Direct Mesh│ 100% OFFLINE peer-to-peer air packet relay (No SIM/No Net) │
├────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Tier 4: Compact Distress Beacon│ 16-byte minimal distress frame (GPS + status flag)         │
└────────────────────────────────┴────────────────────────────────────────────────────────────┘
`

---

## ⚡ Core Architecture & Capabilities

### 1. Offline Radio Mesh (Tier 3)
- **Peer-to-Peer Broadcasting**: Messages are packed into compact binary frames and broadcast over Bluetooth Low Energy (BLE) peripheral advertising and Wi-Fi Neighbor 802.11 action frames.
- **Multi-Hop Relay**: Neighboring devices continuously scan, verify checksums, and forward packets along the mesh toward any active gateway node.
- **Delivery Acknowledgments (ACK)**: When a packet reaches an uplink or destination, an acknowledgment frame propagates through the mesh to silence retransmissions and conserve device battery.

### 2. Emergency SOS Beacon
- **Rapid Dispatch**: Single-tap distress beacon broadcasting current GPS coordinates, reverse-geocoded landmark references, and citizen identifier.
- **Pre-Configured Emergency Chips**: Quick-select emergency status chips in regional Indian languages:
  - Medical Emergency (மருத்துவ அவசரம் / तत्काल चिकित्सा सहायता)
  - Food & Drinking Water Needed (உணவு & குடிநீர் தேவை / भोजन और पानी की आवश्यकता)
  - Flood Evacuation Boat Needed (வெள்ள மீட்பு படகு தேவை / बाढ़ बचाव नाव)
  - Trapped on Roof (கூரை மீது சிக்கியுள்ளோம் / छत पर फंसे हुए हैं)

### 3. Private Local Mesh Chat
- **Direct Offline Messaging**: Exchange messages directly with nearby civilians or field responders over the local radio mesh.
- **End-to-End Encryption**: Direct peer messages support AES-256-GCM authenticated encryption; intermediate relay nodes forward encrypted ciphertext without plaintext exposure.

### 4. On-Device Offline Speech Recognition
- **Zero Cloud Requirement**: Built with an on-device quantized **Sherpa-ONNX (Whisper-Tiny int8)** engine natively integrated into Android.
- **Push-to-Talk (PTT)**: Hold or tap to record speech, transcribe locally on device, compact the payload, and transmit over the mesh.
- **Haptic & Audio Feedback**: Tactile vibrations and chimes confirm packet dispatch and incoming alert delivery.

### 5. Multilingual Support (10 Indian Languages)
Full UI localization and emergency phrase packs across 10 languages:
- **தமிழ் (Tamil)**
- **English**
- **हिंदी (Hindi)**
- **తెలుగు (Telugu)**
- **മലയാളം (Malayalam)**
- **ಕನ್ನಡ (Kannada)**
- **বাংলা (Bengali)**
- **मराठी (Marathi)**
- **ગુજરાતી (Gujarati)**
- **اردو (Urdu)**

### 6. Incident Command Center (Web Dashboard)
- **Aggregated Incident Stream**: Unified feed consolidating distress beacons, voice notes, and relay telemetry.
- **Live Ticker**: Displays active radio tiers, discovered air nodes, and GPS coordinates.
- **Sliding-Window Deduplication**: Filters multi-path packet duplicates and retransmissions.
- **One-Click Translation**: Translates regional distress alerts to English for dispatch coordinators.

---

## 🏗️ System Flow

`
 [ Field Node / Trapped Civilian ]
               │
               │ (Offline BLE / Wi-Fi Direct Mesh Frame)
               ▼
   [ Relay Node / Neighbor Device ]
               │
               │ (Uplink via Cellular, Satellite, or LoRa edge node)
               ▼
 [ FastAPI Gateway Server (Cloud or On-Premise) ]
               │
               │ (WebSocket & REST API)
               ▼
  [ Emergency Incident Command Center ]
`

---

## 📁 Repository Structure

`
itantra/
├── backend/                  # FastAPI Core Backend & Gateway
│   ├── app/
│   │   ├── api/              # Message ingestion and telemetry endpoints
│   │   ├── comms/            # Channel simulator and packet definitions
│   │   ├── database.py       # SQLite WAL database for local persistence
│   │   ├── models.py         # SQLAlchemy 2.0 data models
│   │   └── main.py           # Application gateway & WebSocket router
│   ├── requirements.txt      # Python dependencies
│   └── dist/                 # Built frontend SPA bundle served by backend
│
├── frontend/                 # React 18 + TypeScript Web Application
│   ├── src/
│   │   ├── pages/            # CommandCenterDashboard.tsx & FieldUserDashboard.tsx
│   │   ├── components/       # UI widgets, PTT button, audio player
│   │   └── utils/            # Codecs, language packs, and helpers
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Styling configuration
│
├── mobile_app_apk/           # Native Android Project (Capacitor)
│   ├── android/
│   │   ├── app/src/main/
│   │   │   ├── java/         # MainActivity.kt (BLE Mesh, Wi-Fi Direct, Sherpa-ONNX)
│   │   │   ├── assets/       # Whisper-Tiny ONNX models & web assets
│   │   │   └── res/          # Launcher icons, app manifests, layout configs
│   │   └── build.gradle      # Build configuration (R8 minification, ABI filters)
│   └── capacitor.config.json # Native bridge configuration
│
├── .gitignore                # Git exclusion rules
├── LICENSE                   # MIT License
└── README.md                 # Project documentation
`

---

## 🚀 Setup & Installation

### 1. Android Mobile App

#### Building with Gradle
1. Navigate to the Android project directory:
   `ash
   cd mobile_app_apk/android
   ./gradlew assembleDebug      # Linux / macOS
   gradlew.bat assembleDebug    # Windows
   `
2. Install the debug build on a connected device via ADB:
   `ash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   `

#### Building in Android Studio
1. Open Android Studio, select **Open Project**, and navigate to mobile_app_apk/android.
2. Sync Gradle dependencies and run directly on a physical device.

---

### 2. Backend Gateway (FastAPI)

`ash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
`
The API will be available at http://localhost:8000 with interactive Swagger docs at http://localhost:8000/docs.

---

### 3. Frontend Web Dashboard (React + TypeScript)

`ash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
`
Open http://localhost:5173 in your browser.

---

## 🔒 Security & Message Integrity

- **End-to-End Encryption**: Direct peer messages support AES-256-GCM authenticated encryption to protect civilian privacy.
- **Integrity Tags**: Authenticated tags verify payload integrity across multi-hop relays.
- **Privacy Controls**: GPS coordinates are transmitted strictly when emergency beacons or explicit location shares are triggered.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
