# 📱 iTiTantra Standalone Mobile App — Android Studio APK Build Guide

This directory (`d:\itantra\mobile_app_apk`) contains the **standalone Mobile App project** ready to be compiled into a native **Android APK** using Android Studio.

---

## 🚀 Quick Step-by-Step Android Studio APK Generation:

### Method 1: Using Capacitor (Recommended)

1. Open PowerShell or Terminal in this folder:
   ```bash
   cd d:\itantra\mobile_app_apk
   ```

2. Install dependencies & build Web assets:
   ```bash
   npm install
   npm run build
   ```

3. Add Android Native Platform:
   ```bash
   npx cap add android
   npx cap sync android
   ```

4. Open in Android Studio:
   ```bash
   npx cap open android
   ```

5. In **Android Studio**:
   - Go to menu: **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**
   - Click **locate** to find your compiled `app-debug.apk` file!
   - Install the APK on your phone!

---

### Method 2: Direct WebView Wrap in Android Studio (Zero Config)

If you just want to load the live app inside a native Android Studio WebView:

1. Open **Android Studio** ➔ **New Project** ➔ **Empty Activity**.
2. Name: `iTiTantra Node` | Package: `com.ititantra.civilianapp`.
3. In `activity_main.xml`, add a full-screen `WebView`:
   ```xml
   <WebView
       android:id="@+id/webView"
       android:layout_width="match_parent"
       android:layout_height="match_parent" />
   ```
4. In `MainActivity.java` or `MainActivity.kt`:
   ```kotlin
   val webView = findViewById<WebView>(R.id.webView)
   webView.settings.javaScriptEnabled = true
   webView.settings.domStorageEnabled = true
   webView.loadUrl("https://10.243.247.76:5173/mobile")
   ```
5. In `AndroidManifest.xml`, add internet permission:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.BLUETOOTH" />
   <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
   ```
6. Click **Build APK** ➔ Done!

---

## 🎯 Dual-App Architecture Summary:
- 💻 **Laptop / Command Center Web App**: Remains running on `https://localhost:5173/command-center`
- 📱 **Mobile Phone Android APK**: Compiled from this folder (`d:\itantra\mobile_app_apk`)
