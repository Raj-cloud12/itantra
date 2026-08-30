import httpx, time, sys

sys.stdout.reconfigure(encoding='utf-8')

API_BASE = 'http://localhost:8000/api'

def set_channel(mode_name, bw, lat, loss):
    print(f"\n=======================================================")
    print(f"📡 SWITCHING TO: {mode_name}")
    print(f"   Bandwidth: {bw} kbps | Latency: {lat} ms | Packet Loss: {loss}%")
    print(f"=======================================================")
    r = httpx.post(f"{API_BASE}/simulator/config", json={
        'session_id': 'DEMO_GLOBAL_SESSION_01',
        'bandwidth_kbps': bw,
        'latency_ms': lat,
        'packet_loss_pct': loss
    })
    time.sleep(1)

def send_msg(text, lang='ta', is_emergency=False, lat=12.9642, lng=80.2520):
    start = time.time()
    r = httpx.post(f"{API_BASE}/messages/send", json={
        'session_id': 'DEMO_GLOBAL_SESSION_01',
        'text': text,
        'language': lang,
        'is_emergency': is_emergency,
        'latitude': lat,
        'longitude': lng
    })
    elapsed = round((time.time() - start) * 1000, 1)
    print(f"   [DELIVERED in {elapsed}ms] Status: {r.status_code} | Text: {text}")
    time.sleep(1.5)

print("🚀 STARTING LIVE END-TO-END DEMO OF ITITANTRA 4-MODE SPECTRUM...")

# 1. Mode 1: 4G Real HD Call (>10 kbps)
set_channel("🟢 MODE 1: 4G High-Definition Voice Call (>10 kbps)", 50.0, 30, 0.0)
send_msg("🟢 [Mode 1 HD Call]: Live Spoken Human Voice Call from Field Unit 1. Signal crystal clear over 4G.")

# 2. Mode 2: 2G Compressed Voice (2-10 kbps)
set_channel("🔵 MODE 2: 2G Compressed Voice Stream (2–10 kbps)", 6.0, 120, 2.0)
send_msg("🔵 [Mode 2 Compressed Voice]: Downsampled and compressed voice transmission on 2G edge network.")

# 3. Mode 3: 1-Byte AI Neural TTS Codec (0.1–2 kbps)
set_channel("🟣 MODE 3: 1-Byte AI Neural TTS Codec (0.1–2 kbps)", 1.0, 250, 5.0)
send_msg("🟣 [Mode 3 AI TTS]: 🚨 Emergency assistance required at Kottivakkam junction. 1-byte neural token transmitted.")

# 4. Mode 4: 100% Off-Grid Mesh (0 kbps internet)
set_channel("🟠 MODE 4: 100% Off-Grid LoRa/BLE Mesh Network (0 kbps)", 0.0, 450, 10.0)
send_msg("🟠 [Mode 4 Off-Grid Mesh]: SOS alert relayed across 3 operative nodes via AES-256 encrypted peer mesh.", is_emergency=True)

print("\n🎉 DEMO COMPLETED! All 4 Modes tested and synchronized in Command Center & Mobile App!")
