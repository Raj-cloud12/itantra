import sys

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "r", encoding="utf-8") as f:
    content = f.read()

# Fix config
content = content.replace(
"""                enableEndpoint = true,
                rule1MinTrailingSilence = 2.4f,
                rule2MinTrailingSilence = 1.2f,
                rule3MinUtteranceLength = 300.0f""",
"                enableEndpoint = true"
)

# Wait, `enableEndpoint` might also be invalid. Let's just pass `featConfig` and `modelConfig`!
import re
content = re.sub(
    r'val config = OnlineRecognizerConfig\([\s\S]*?featConfig = ([\s\S]*?),[\s\S]*?modelConfig = ([\s\S]*?),[\s\S]*?enableEndpoint = true[\s\S]*?\)',
    r'val config = OnlineRecognizerConfig(featConfig = \1, modelConfig = \2)',
    content
)

# Fix null safety
content = content.replace(
"""                    while (recognizer?.isReady(stream) == true) {
                        recognizer?.decode(stream)
                    }
                    
                    val isEndpoint = recognizer?.isEndpoint(stream) == true
                    val result = recognizer?.getResult(stream)?.text ?: ""
                    
                    if (result.isNotEmpty() && result != lastText) {
                        lastText = result
                        if (isEndpoint) {
                            onFinalResult(result)
                            recognizer?.reset(stream)
                            lastText = ""
                        } else {
                            onPartialResult(result)
                        }
                    } else if (isEndpoint) {
                         recognizer?.reset(stream)
                    }""",
"""                    stream?.let { s ->
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
)

content = content.replace("recognizer?.reset(stream)", "stream?.let { recognizer?.reset(it) }")

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated SherpaOnnxManager")

import os
if os.path.exists("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaTest.kt"):
    os.remove("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaTest.kt")
