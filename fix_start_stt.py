import sys
import re

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/MainActivity.kt", "r", encoding="utf-8") as f:
    content = f.read()

# Replace startSpeechRecognition
pattern = r'@JavascriptInterface\s*fun startSpeechRecognition\(lang: String\) \{[\s\S]*?\}\s*\}'
replacement = '''@JavascriptInterface
        fun startSpeechRecognition(lang: String) {
            runOnUiThread {
                try {
                    sherpaRecognizer?.startListening()
                    Log.i("STT", "SUCCESS: Sherpa ONNX Started for $lang")
                } catch (e: Exception) {
                    Log.e("STT", "Error starting sherpa recognizer: ${e.message}")
                    webView.evaluateJavascript("window.onNativeSpeechError && window.onNativeSpeechError(99);", null)
                }
            }
        }'''

content = re.sub(pattern, replacement, content)

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/MainActivity.kt", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated startSpeechRecognition")
