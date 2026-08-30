with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "r", encoding="utf-8") as f:
    content = f.read()

old = """        stream?.let { s ->
            val res = recognizer?.decode(s)
            val result = res?.text ?: ""
            if (result.isNotEmpty()) {
                onFinalResult(result)
            }
        }"""
new = """        stream?.let { s ->
            recognizer?.decode(s)
            val result = recognizer?.getResult(s)?.text ?: ""
            if (result.isNotEmpty()) {
                onFinalResult(result)
            }
        }"""
content = content.replace(old, new)

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "w", encoding="utf-8") as f:
    f.write(content)
