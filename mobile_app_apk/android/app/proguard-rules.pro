# ============================================================
# iTiTantra Civilian App — ProGuard / R8 Keep Rules
# Production-safe: Keeps all app, Sherpa ONNX, and bridge classes
# ============================================================

# ─── 1. Keep entire app package (MainActivity + BleMeshBridge) ───
-keep class com.ititantra.civilianapp.** { *; }
-keepclassmembers class com.ititantra.civilianapp.** { *; }

# ─── 2. Keep WebView JavaScript interface methods ───
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ─── 3. Keep Sherpa ONNX native bridge (speech recognition) ───
-keep class com.k2fsa.sherpa.onnx.** { *; }
-keepclassmembers class com.k2fsa.sherpa.onnx.** { *; }

# ─── 4. Keep ONNX Runtime JNI layer ───
-keep class ai.onnxruntime.** { *; }

# ─── 5. Keep AndroidX & Material classes used by WebView shell ───
-keep class androidx.webkit.** { *; }
-keep class com.google.android.material.** { *; }
-keep class androidx.appcompat.** { *; }

# ─── 6. Keep native method declarations ───
-keepclasseswithmembernames class * {
    native <methods>;
}

# ─── 7. Keep enums (used by Sherpa ONNX config) ───
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ─── 8. Keep Parcelable & Serializable ───
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ─── 9. Suppress warnings for third-party libs ───
-dontwarn com.k2fsa.sherpa.onnx.**
-dontwarn ai.onnxruntime.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
