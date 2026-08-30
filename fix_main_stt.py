import sys
import re

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/MainActivity.kt", "r", encoding="utf-8") as f:
    content = f.read()

# Replace properties
content = re.sub(
    r'private var speechRecognizer: SpeechRecognizer\? = null',
    r'private var sherpaRecognizer: SherpaOnnxManager? = null',
    content
)

# Remove setupSpeechRecognizer entirely
content = re.sub(r'private fun setupSpeechRecognizer\(\) \{[\s\S]*?\}\n\n', '', content)

# Add setupSherpaOnnx
setup_sherpa = '''    private fun setupSherpaOnnx() {
        sherpaRecognizer = SherpaOnnxManager(
            assetManager = assets,
            onPartialResult = { text ->
                runOnUiThread {
                    webView.evaluateJavascript("window.onNativeSpeechResult('$text', false);", null)
                }
            },
            onFinalResult = { text ->
                runOnUiThread {
                    webView.evaluateJavascript("window.onNativeSpeechResult('$text', true);", null)
                }
            }
        )
    }

'''

content = content.replace("private fun setupWebView() {", setup_sherpa + "    private fun setupWebView() {")
content = content.replace("setupSpeechRecognizer()", "setupSherpaOnnx()")

# Replace JS bridge calls
content = content.replace("speechRecognizer?.startListening(recognizerIntent)", "sherpaRecognizer?.startListening()")
content = content.replace("speechRecognizer?.stopListening()", "sherpaRecognizer?.stopListening()")
content = content.replace("speechRecognizer?.cancel()", "sherpaRecognizer?.stopListening()")
content = content.replace("speechRecognizer?.destroy()", "sherpaRecognizer?.stopListening()")

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/MainActivity.kt", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated MainActivity correctly")
