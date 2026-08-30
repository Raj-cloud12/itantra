import asyncio, json, httpx, websockets

BASE = "http://localhost:8000"

async def run_test():
    print("=" * 60)
    print("  iTiTantra LIVE MESSAGE DELIVERY TEST")
    print("=" * 60)

    async with httpx.AsyncClient() as client:
        r = await client.post(f"{BASE}/api/session/create", json={
            "field_username": "test_field_x9",
            "command_username": "test_cmd_x9"
        })
        assert r.status_code == 200, f"Session create failed: {r.text}"
        s = r.json()
        session_id, field_token, cmd_token = s["session_id"], s["field_token"], s["command_token"]
        print(f"[1] PASS  Session: {session_id[:20]}...")

    furl = f"ws://localhost:8000/ws/field/{session_id}?token={field_token}"
    curl = f"ws://localhost:8000/ws/command/{session_id}?token={cmd_token}"

    cmd_msg, field_reply = {}, {}

    async def drain(ws, n=4, t=1.5):
        """Drain n messages with timeout t seconds each."""
        for _ in range(n):
            try:
                return json.loads(await asyncio.wait_for(ws.recv(), timeout=t))
            except asyncio.TimeoutError:
                break
        return None

    async def field_client():
        async with websockets.connect(furl) as ws:
            msg = json.loads(await ws.recv())
            print(f"[2] PASS  Field WS connected, type={msg['type']}")
            # drain initial stats_update
            for _ in range(3):
                try:
                    m = json.loads(await asyncio.wait_for(ws.recv(), timeout=1.5))
                    if m["type"] == "stats_update":
                        print(f"[3] PASS  Initial stats_update: bw={m.get('current_bandwidth_kbps')} kbps")
                except asyncio.TimeoutError:
                    break

            await ws.send(json.dumps({
                "type": "voice_message",
                "text": "Hello Command Center!",
                "audio_size": 45000,
                "is_emergency": False,
                "language": "en",
                "latitude": 13.0827,
                "longitude": 80.2707,
                "relayed_via_mesh": False
            }))
            print(f"[4] PASS  Field sent message")

            for _ in range(8):
                try:
                    ack = json.loads(await asyncio.wait_for(ws.recv(), timeout=10.0))
                    if ack.get("type") == "ack":
                        st = ack.get("status", "?")
                        if st == "delivered":
                            stats = ack.get("stats", {})
                            print(f"[5] PASS  ACK={st.upper()} transit={stats.get('transit_time_ms')}ms compressed={stats.get('compressed_bytes')}B")
                        elif st == "dropped":
                            print(f"[5] WARN  Packet DROPPED by simulator (high packet loss)")
                        else:
                            print(f"[5] FAIL  status={st} msg={ack.get('message')}")
                        break
                except asyncio.TimeoutError:
                    print(f"[5] FAIL  Timed out waiting for ACK!")
                    break

            # Wait for reply from command
            for _ in range(6):
                try:
                    r = json.loads(await asyncio.wait_for(ws.recv(), timeout=6.0))
                    if r.get("type") in ("voice_message", "text_message"):
                        field_reply.update(r)
                        print(f"[8] PASS  Field got reply: '{r.get('text')}'")
                        break
                except asyncio.TimeoutError:
                    print(f"[8] INFO  No reply from command within timeout")
                    break

    async def command_client():
        await asyncio.sleep(0.4)
        async with websockets.connect(curl) as ws:
            for _ in range(5):
                try:
                    m = json.loads(await asyncio.wait_for(ws.recv(), timeout=1.5))
                    if m["type"] == "session_key":
                        print(f"[2b] PASS  Command WS connected")
                    elif m["type"] == "stats_update":
                        print(f"[3b] PASS  Command stats_update: bw={m.get('current_bandwidth_kbps')} kbps")
                    elif m["type"] == "presence":
                        print(f"[3c] PASS  Field presence={m.get('status')}")
                except asyncio.TimeoutError:
                    break

            for _ in range(10):
                try:
                    fwd = json.loads(await asyncio.wait_for(ws.recv(), timeout=10.0))
                    if fwd.get("type") in ("voice_message", "text_message", "emergency_alert"):
                        cmd_msg.update(fwd)
                        stats = fwd.get("stats", {})
                        print(f"[6] PASS  Command received: '{fwd.get('text')}'")
                        print(f"    compress={stats.get('compressed_bytes')}B enc={stats.get('encrypted_bytes')}B transit={stats.get('transit_time_ms')}ms method={stats.get('compression_method')}")

                        await ws.send(json.dumps({
                            "type": "text_message",
                            "text": "Reply: Help is coming!",
                            "audio_size": 0, "is_emergency": False, "language": "en",
                            "latitude": 28.6139, "longitude": 77.2090, "relayed_via_mesh": False
                        }))
                        print(f"[7] PASS  Command sent reply")

                        for _ in range(5):
                            try:
                                ack2 = json.loads(await asyncio.wait_for(ws.recv(), timeout=5.0))
                                if ack2.get("type") == "ack":
                                    print(f"[7b] PASS  Reply ACK: {ack2.get('status', '?').upper()}")
                                    break
                            except asyncio.TimeoutError:
                                break
                        break
                except asyncio.TimeoutError:
                    print(f"[6] FAIL  Command did NOT receive message!")
                    break

    await asyncio.gather(field_client(), command_client())

    print()
    print("=" * 60)
    if cmd_msg.get("text"):
        print("  RESULT: FULL PIPELINE WORKING!")
        print(f"  Field->Command: '{cmd_msg.get('text')}'")
        if field_reply.get("text"):
            print(f"  Command->Field: '{field_reply.get('text')}'")
    else:
        print("  RESULT: FAIL - Message did NOT reach Command Center!")
    print("=" * 60)

asyncio.run(run_test())
