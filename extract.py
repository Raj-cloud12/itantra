import tarfile
import os

with tarfile.open("model.tar.bz2", "r:bz2") as tar:
    tar.extractall("d:/itantra/mobile_app_apk/android/app/src/main/assets/sherpa_new")
print("Extracted!")
