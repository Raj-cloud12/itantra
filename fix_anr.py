import sys

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/MainActivity.kt", "r", encoding="utf-8") as f:
    content = f.read()

setup_sherpa_bad = '''    private fun setupSherpaOnnx() {
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
    }'''

setup_sherpa_good = '''    private fun setupSherpaOnnx() {
        Thread {
            try {
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
                Log.i("STT", "Sherpa ONNX Model Loaded Successfully in Background!")
            } catch (e: Exception) {
                Log.e("STT", "Failed to load Sherpa ONNX", e)
            }
        }.start()
    }'''

content = content.replace(setup_sherpa_bad, setup_sherpa_good)

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/MainActivity.kt", "w", encoding="utf-8") as f:
    f.write(content)
print("Moved Sherpa ONNX Init to Background Thread to prevent ANR!")
