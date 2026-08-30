import sys

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "r", encoding="utf-8") as f:
    content = f.read()

old_config = """                transducer = OnlineTransducerModelConfig(
                    encoder = "sherpa/model.int8.onnx",
                    decoder = "",
                    joiner = ""
                )"""
new_config = """                neMoCtc = OnlineNeMoCtcModelConfig(
                    model = "sherpa/model.int8.onnx"
                )"""

content = content.replace(old_config, new_config)

with open("d:/itantra/mobile_app_apk/android/app/src/main/java/com/ititantra/civilianapp/SherpaOnnxManager.kt", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated config to NeMo CTC")
