with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("neMoCtc =", "nemoCtc =")

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "w", encoding="utf-8") as f:
    f.write(content)
