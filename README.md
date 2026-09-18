# iTantra: Indian Multilingual TTS & STT-Aided Neural Transceiver Radio Access for Low-Bitrate Links

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-blue.svg)](https://github.com/Raj-cloud12/itantra)
[![Smart India Hackathon](https://img.shields.io/badge/Hackathon-Smart%20India%20Hackathon%20Product-orange.svg)](https://github.com/Raj-cloud12/itantra)
[![Security](https://img.shields.io/badge/Encryption-AES--256--GCM-brightgreen.svg)](https://github.com/Raj-cloud12/itantra)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **iTantra** is a tactical, zero-infrastructure disaster communication network. When extreme weather, floods, earthquakes, or cyclones destroy mobile cell towers and fiber backhauls, iTantra establishes an autonomous, peer-to-peer radio mesh network across civilian smartphones to relay emergency voice notes, text alerts, and GPS distress beacons directly to rescue command centers — **with zero cellular network or active internet connection required**.

---

## 🎯 The Real-World Problem

During catastrophic disasters like cyclones (Michaung, Vardah), flash floods, or landslides, conventional telecommunication infrastructure collapses:
- Cell towers lose grid power and backup generator diesel within 3–6 hours.
- Underground optical fiber backhauls suffer physical severance from falling trees and flooding.
- Trapped civilians are unable to dial emergency services (112 / 108 / NDRF), leaving search and rescue teams operating blind.

**iTantra solves this ground-zero communication blackout.** Every citizen's phone running iTantra becomes a self-healing radio relay node in a distributed air mesh.

---

## 🛰️ The 4-Tier Tactical Fallback Architecture

iTantra dynamically shifts across 4 communication tiers depending on available radio frequencies and network survivability:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   iTantra Fallback Hierarchy                                │
├────────────────────────────────┬────────────────────────────────────────────────────────────┤
│ Tier 1: 4G / 5G Broadband      │ High-speed bidirectional WebSockets & live voice telemetry │
├────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Tier 2: 2G CELT Audio Link     │ Ultra-compact voice frames compressed to ~1.2 KB           │
├────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Tier 3: BLE & Wi-Fi Direct Mesh│ 100% OFFLINE peer-to-peer air packet relay (No SIM/No Net) │
├────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Tier 4: LoRa & Satellite Beacon│ 16-byte ultra-compact distress frame (ISRO NavIC / 865 MHz)│
└────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key System Features

### 1. 📴 100% Offline Radio Mesh (Tier 3)
- **Air-Toss P2P Broadcasting**: Phone 1 encodes messages into compact TantraMesh binary packets and advertises them via Bluetooth Low Energy (BLE) Peripheral Advertising and Wi-Fi Neighbor 802.11 action frames.
- **Silent Multi-Hop Relay**: Nearby devices (Phone 2, Phone 3, etc.) continuously scan the airwaves, intercept packets, verify checksums, and hop them forward toward any device with an active gateway connection.
- **Automatic Delivery Acknowledgments (ACK)**: Once a packet reaches the destination or command uplink, a compact ACK is broadcast back through the mesh to silence transmitters and save battery.

### 2. 🚨 1-Tap Emergency SOS Beacon
- **Sub-100ms Instant Dispatch**: Single-tap distress beacon broadcasting emergency GPS coordinates, reverse-geocoded place names, and citizen callsigns.
- **Pre-Typed Emergency Chips**: Quick-select rescue requests in regional languages:
  - 🚑 *Medical Emergency* (`மருத்துவ அவசரம்`)
  - 🍞 *Food & Drinking Water Needed* (`உணவு & குடிநீர் தேவை`)
  - 🚤 *Flood Evacuation Boat Needed* (`வெள்ள மீட்பு படகு தேவை`)
  - 🏠 *Trapped on Roof* (`கூரை மீது சிக்கியுள்ளோம்`)
- **Full-Chunk Assembly Engine**: Reassembles multi-chunk regional distress payloads with packet loss recovery timers to ensure 100% message integrity.

### 3. 🔒 Mode 3 Local Mesh Chat (Private E2EE)
- **Zero-Internet Peer Chat**: Talk directly to nearby friends, family, or rescue team members offline.
- **AES-256-GCM End-to-End Encryption**: Locked direct messages can only be decrypted by the intended recipient callsign; intermediate relay nodes see only encrypted cipher payloads.

### 4. 🎙️ On-Device Offline AI Speech Recognition
- **Zero Cloud Dependency**: Runs an on-device quantized **Sherpa-ONNX (Whisper-Tiny int8)** engine natively inside Android.
- **Push-to-Talk (PTT) Walkie-Talkie**: Hold or tap to record speech, automatically transcribe to text, compact the payload, and fire across the mesh.
- **Hardware Haptics & Chimes**: Tactile feedback and audio tones confirm air transmission and incoming emergency alerts.

### 5. 🌐 10 Indian Regional Disaster Languages
Field civilians and disaster responders can operate the entire app and receive alerts in 10 languages:
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

### 6. 🏢 Tactical Incident Command Center (Web Dashboard)
- **Live Unified Feed**: Centralized incident stream aggregating distress beacons, voice notes, and citizen relays.
- **Real-Time Telemetry Ticker**: Monitors all 4 radio tiers, active air nodes, and GPS coordinates.
- **Automated Text-to-Speech (TTS) Replay**: Hear citizen voice alerts read aloud in authentic regional accents.
- **Sliding-Window Deduplication**: Filters out redundant echoes and multi-path packet duplicates.
- **One-Click Translation**: Instantly translate regional citizen distress messages to English for central disaster management teams.

---

## 🏗️ Architecture Overview

```
 [ Phone 1: Trapped Citizen ]
           │
           │ (Offline BLE / Wi-Fi Direct Beacon)
           ▼
 [ Phone 2: Neighbor / Relay Node ]
           │
           │ (Uplink via cellular / satellite / LoRa edge node)
           ▼
 [ FastAPI Backend Gateway (Render / Cloud / On-Premise) ]
           │
           │ (WebSocket / REST API)
           ▼
 [ Disaster Management Command Center Dashboard ]
```

---

## 📁 Repository Structure

```
itantra/
├── backend/                  # FastAPI Core Backend & Gateway
│   ├── app/
│   │   ├── api/              # Message and mesh ingestion endpoints
│   │   ├── comms/            # Channel simulator and network adapters
│   │   ├── database.py       # SQLite WAL database for high-throughput persistence
│   │   └── main.py           # Application entrypoint & WebSocket hub
│   ├── requirements.txt      # Python dependencies
│   └── dist/                 # Production SPA bundle served on Render
│
├── frontend/                 # React 18 + TypeScript Web Application
│   ├── src/
│   │   ├── pages/            # CommandCenterDashboard.tsx & FieldUserDashboard.tsx
│   │   ├── components/       # UI widgets, PTT button, audio player
│   │   └── utils/            # Encryption helpers, audio codecs, language packs
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Tactical disaster UI styling
│
├── mobile_app_apk/           # Native Android Studio Project
│   ├── android/
│   │   ├── app/src/main/
│   │   │   ├── java/         # MainActivity.kt (BLE Mesh, Wi-Fi Direct, Sherpa-ONNX)
│   │   │   ├── assets/       # Whisper-Tiny ONNX models & public web assets
│   │   │   └── res/          # Launcher icons, app manifests, layout configs
│   │   └── build.gradle      # Optimized build configuration (R8 minification, ABI filters)
│   ├── capacitor.config.json # Native bridge configuration
│   └── README_ANDROID_STUDIO.md # Android Studio compilation guide
│
├── .gitignore                # Production git exclusion rules
├── LICENSE                   # MIT License
└── README.md                 # Project documentation
```

---

## 🚀 Quick Setup & Installation

### 1. Android Mobile App (APK)

#### Option A: Build and Install via Command Line
1. Navigate to the Android project directory and assemble the debug APK:
   ```bash
   cd mobile_app_apk/android
   ./gradlew assembleDebug      # Linux / macOS
   gradlew.bat assembleDebug    # Windows
   ```
2. Install the APK to your connected test device:
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

#### Option B: Build from Source in Android Studio
1. Open Android Studio and select **Open Project** -> Choose `mobile_app_apk/android`.
2. Let Gradle sync project dependencies and run directly on a physical device.

---

### 2. Backend Command Center (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # On Windows
# source venv/bin/activate # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will be live at `http://localhost:8000`.

---

### 3. Frontend Web Dashboard (React + TypeScript)

```bash
cd frontend

# Install Node packages
npm install

# Start local development server
npm run dev
```
Open `http://localhost:5173` in your web browser.

---

## 🔒 Security & Privacy

- **Military-Grade Encryption**: All mesh payloads utilize `AES-256-GCM` with authenticated tags to prevent tampering and eavesdropping.
- **Privacy By Design**: Location data is transmitted solely during emergency distress beacon activation.
- **Deterministic Verification**: Packet signatures prevent replay attacks across intermediate radio relays.

---

## 🏆 Smart India Hackathon (SIH) Presentation Notes

- **Field Testing**: Validated across multiple physical Android hardware devices (Samsung Galaxy and Vivo test units) communicating purely over air mesh without active SIM cards.
- **Low-Bitrate Efficiency**: Text compression achieves up to **92% bandwidth reduction** compared to raw audio streams.
- **Deployment Ready**: Self-contained APK requires zero cloud setup for on-ground disaster response teams.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
