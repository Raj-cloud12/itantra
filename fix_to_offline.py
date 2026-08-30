with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("import com.k2fsa.sherpa.onnx.*", "import com.k2fsa.sherpa.onnx.*")
content = content.replace("OnlineRecognizer", "OfflineRecognizer")
content = content.replace("OnlineStream", "OfflineStream")
content = content.replace("OnlineModelConfig", "OfflineModelConfig")
content = content.replace("OnlineNeMoCtcModelConfig", "OfflineNemoEncDecCtcModelConfig")

# Replace streaming loop
old_loop = """                    stream?.let { s ->
                        s.acceptWaveform(floatArray, sampleRate)
                        while (recognizer?.isReady(s) == true) {
                            recognizer?.decode(s)
                        }
                        
                        val isEndpoint = recognizer?.isEndpoint(s) == true
                        val result = recognizer?.getResult(s)?.text ?: ""
                        
                        if (result.isNotEmpty() && result != lastText) {
                            lastText = result
                            if (isEndpoint) {
                                onFinalResult(result)
                                recognizer?.reset(s)
                                lastText = ""
                            } else {
                                onPartialResult(result)
                            }
                        } else if (isEndpoint) {
                             recognizer?.reset(s)
                        }
                    }"""
new_loop = """                    stream?.let { s ->
                        s.acceptWaveform(floatArray, sampleRate)
                    }"""
content = content.replace(old_loop, new_loop)

old_stop = """        // Push final text if any
        stream?.let { s ->
            val result = recognizer?.getResult(s)?.text ?: ""
            if (result.isNotEmpty()) {
                onFinalResult(result)
            }
            recognizer?.reset(s)
        }"""
new_stop = """        stream?.let { s ->
            recognizer?.decode(s)
            val result = recognizer?.getResult(s)?.text ?: ""
            if (result.isNotEmpty()) {
                onFinalResult(result)
            }
        }"""
content = content.replace(old_stop, new_stop)

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated to OfflineRecognizer!")
