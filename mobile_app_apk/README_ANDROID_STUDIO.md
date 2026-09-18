# 📱 iTantra Mobile App — Android Studio Build Guide

This directory contains the mobile client project for **iTantra**, configured for native Android compilation using Android Studio and Gradle.

---

## 🚀 Building the APK

### Prerequisites
- **Android Studio** (Hedgehog / Iguana or newer recommended)
- **JDK 17** (bundled with Android Studio JBR)
- **Node.js 18+** & **npm**

---

### Step-by-Step Instructions

#### 1. Install Dependencies & Build Web Assets
From this directory:
```bash
npm install
npm run build
```

#### 2. Sync Native Android Project
Sync web assets and plugins to the native Android Gradle project:
```bash
npx cap sync android
```

#### 3. Open in Android Studio
Launch Android Studio with this project:
```bash
npx cap open android
```
*Or manually open the `android` subfolder directly inside Android Studio.*

#### 4. Build APK via Gradle
- **Via Command Line**:
  ```bash
  cd android
  ./gradlew assembleDebug      # Linux / macOS
  gradlew.bat assembleDebug    # Windows
  ```
  The compiled APK is generated at:
  `android/app/build/outputs/apk/debug/app-debug.apk`

- **Via Android Studio GUI**:
  1. Click **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**.
  2. Once complete, click **locate** in the notification popup to view `app-debug.apk`.

#### 5. Install to Device
Connect your Android test phone with USB debugging enabled:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ⚙️ Native Android Capabilities
- **Bluetooth Low Energy (BLE 5.0)**: Background advertising and packet scanning without active pairing.
- **Wi-Fi Aware (NAN)**: Peer-to-peer discovery and direct data sockets within 100m range.
- **Sherpa-ONNX Whisper Engine**: Offline speech recognition with zero cloud dependencies.
- **Hardware Haptics**: Vibration confirmation on packet reception and emergency broadcast triggers.