import os
import shutil
import re

# 1. Update Frontend
frontend_dist = "d:/itantra/frontend/dist"
android_assets = "d:/itantra/mobile_app_apk/android/app/src/main/assets/public"

if os.path.exists(android_assets):
    shutil.rmtree(android_assets)
shutil.copytree(frontend_dist, android_assets)
print("Updated Frontend in Android APK assets")

# 2. Fix SherpaOnnxManager AudioRecord checks
with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "r", encoding="utf-8") as f:
    content = f.read()

good_start = """        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.VOICE_RECOGNITION,
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        )

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            Log.e("Sherpa", "AudioRecord failed to initialize! Mic might be in use or permission denied.")
            throw Exception("AudioRecord init failed")
        }

        try {
            audioRecord?.startRecording()
        } catch (e: Exception) {
            Log.e("Sherpa", "startRecording failed: ${e.message}")
            throw e
        }
        
        isRecording = true"""

content = re.sub(r'        audioRecord = AudioRecord\([\s\S]*?isRecording = true', good_start, content)

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed SherpaOnnxManager AudioRecord!")
