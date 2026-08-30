import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://raw.githubusercontent.com/k2-fsa/sherpa-onnx/master/android/SherpaOnnx/app/src/main/java/com/k2fsa/sherpa/onnx/MainActivity.kt"
try:
    data = urllib.request.urlopen(url, context=ctx).read().decode('utf-8')
    lines = data.split("\n")
    for i, line in enumerate(lines):
        if "Offline" in line or "Online" in line:
            print(f"{i}: {line.strip()}")
except Exception as e:
    print(e)
