import sys
import re

with open("d:/itantra/mobile_app_apk/android/app/build.gradle", "r", encoding="utf-8") as f:
    content = f.read()

if "aaptOptions" not in content:
    content = content.replace("android {", "android {\n    aaptOptions {\n        noCompress \"onnx\"\n        noCompress \"txt\"\n    }\n")

with open("d:/itantra/mobile_app_apk/android/app/build.gradle", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated build.gradle aaptOptions")
