import asyncio
import base64
import json
from pathlib import Path
import websockets

BASE = "ws://localhost:8000"
SESSION = "DEMO_GLOBAL_SESSION_01"
AUDIO = "data:audio/wav;base64," + base64.b64encode(Path(r"D:\itantra\test_speech.wav").read_bytes()).decode("ascii")

async def drain(ws, seconds=0.4):
    end = asyncio.get_running_loop().time() + seconds
    while asyncio.get_running_loop().time() < end:
        try:
            await asyncio.wait_for(ws.recv(), timeout=max(0.01, end - asyncio.get_running_loop().time()))
        except asyncio.TimeoutError:
            break

async def receive_until(ws, wanted, timeout=20):
    end = asyncio.get_running_loop().time() + timeout
    while True:
        remaining = end - asyncio.get_running_loop().time()
        if remaining <= 0:
            raise TimeoutError(f"Timed out waiting for {wanted}")
        data = json.loads(await asyncio.wait_for(ws.recv(), timeout=remaining))
        if data.get("type") in wanted:
            return data

async def main():
    command_url = f"{BASE}/ws/command/{SESSION}?token=demo_command_token"
    field_url = f"{BASE}/ws/field/{SESSION}?token=demo_field_token"
    async with websockets.connect(command_url, max_size=2_000_000) as command, websockets.connect(field_url, max_size=2_000_000) as field:
        await drain(command)
        await drain(field)
        tests = [
            ("Mode 1", 20, AUDIO),
            ("Mode 2", 6, AUDIO),
            ("Mode 3", 1, None),
        ]
        for name, bandwidth, audio in tests:
            payload = {
                "type": "voice_message",
                "text": f"Hello world - {name} WebSocket test",
                "audio_size": 45000,
                "is_emergency": False,
                "language": "en",
            }
            if audio:
                payload["audio_url"] = audio
            await field.send(json.dumps(payload))
            ack = await receive_until(field, {"ack"}, timeout=30)
            incoming = await receive_until(command, {"voice_message", "text_message", "emergency_alert"}, timeout=30)
            print(json.dumps({
                "mode": name,
                "bandwidth": bandwidth,
                "ack": ack.get("status"),
                "received_text": incoming.get("text"),
                "received_audio": bool(incoming.get("audio_url")),
                "received_audio_chars": len(incoming.get("audio_url") or ""),
            }))

asyncio.run(main())
