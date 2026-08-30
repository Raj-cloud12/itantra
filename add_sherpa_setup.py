import sys

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/MainActivity.kt", "r", encoding="utf-8") as f:
    content = f.read()

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

content = content.replace("    private fun initBluetooth() {", setup_sherpa + "    private fun initBluetooth() {")
content = content.replace("        initBluetooth()", "        setupSherpaOnnx()\n        initBluetooth()")

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/MainActivity.kt", "w", encoding="utf-8") as f:
    f.write(content)
print("Added setupSherpaOnnx")
