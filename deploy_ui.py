import os
import shutil
import subprocess

def run(cmd, cwd):
    print(f"Running: {cmd} in {cwd}")
    subprocess.run(cmd, shell=True, check=True, cwd=cwd)

print("Building frontend...")
run("npm run build", "d:/itantra/frontend")

print("Clearing old assets...")
android_assets = "d:/itantra/mobile_app_apk/android/app/src/main/assets/public"
if os.path.exists(android_assets):
    shutil.rmtree(android_assets)

print("Copying new UI...")
shutil.copytree("d:/itantra/frontend/dist", android_assets)

print("Building APK...")
run("python C:/Users/rajku/.gemini/antigravity/brain/aee562ce-2420-4799-972c-aa832b34a99d/scratch/build_apk_512m.py", "d:/itantra")

print("DONE!")
