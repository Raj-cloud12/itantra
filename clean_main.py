import sys
import re

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/MainActivity.kt", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find WebAppInterface and BleMeshBridge and replace them completely to be safe!
import urllib.request
# Just regex out the broken parts!

start = content.find("        @JavascriptInterface\n        fun startSpeechRecognition(lang: String) {")
end = content.find("        @JavascriptInterface\n        fun stopSpeechRecognition() {")

if start != -1 and end != -1:
    good_start = '''        @JavascriptInterface
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
        }

'''
    content = content[:start] + good_start + content[end:]
    
with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/MainActivity.kt", "w", encoding="utf-8") as f:
    f.write(content)
print("Cleaned!")
