import asyncio
import json
import time
import uuid

import httpx
import websockets

BASE = "http://127.0.0.1:8000"
WS_BASE = "ws://127.0.0.1:8000"

async def recv_until(ws, predicate, timeout=20.0):
    deadline = time.monotonic() + timeout
    seen = []
    while time.monotonic() < deadline:
        remaining = max(0.1, deadline - time.monotonic())
        try:
            raw = await asyncio.wait_for(ws.recv(), timeout=remaining)
        except asyncio.TimeoutError:
            break
        data = json.loads(raw)
        seen.append(data)
        if predicate(data):
            return data, seen
    return None, seen

async def main():
    suffix = uuid.uuid4().hex[:8]
    async with httpx.AsyncClient(base_url=BASE, timeout=15) as client:
        r = await client.post("/api/session/create", json={
            "field_username": f"mode_field_{suffix}",
            "command_username": f"mode_command_{suffix}",
        })
        r.raise_for_status()
        session = r.json()

    sid = session["session_id"]
    field_url = f"{WS_BASE}/ws/field/{sid}?token={session['field_token']}"
    command_url = f"{WS_BASE}/ws/command/{sid}?token={session['command_token']}"
    results = []

    async with websockets.connect(command_url, open_timeout=10) as command_ws, websockets.connect(field_url, open_timeout=10) as field_ws:
        # Drain initial handshake messages from both endpoints and ensure both are ready.
        cmd_key, cmd_seen = await recv_until(command_ws, lambda m: m.get("type") == "session_key")
        field_key, field_seen = await recv_until(field_ws, lambda m: m.get("type") == "session_key")
        await asyncio.sleep(0.4)
        print(f"HANDSHAKE command={'PASS' if cmd_key else 'FAIL'} field={'PASS' if field_key else 'FAIL'}")

        modes = [
            ("Mode 1 / Government", 20, 50, False, False),
            ("Mode 2 / Government", 6, 120, False, False),
            ("Mode 3 / Government", 1, 200, False, False),
            ("Mode 4 / Local Mesh", 0, 500, True, False),
        ]

        async with httpx.AsyncClient(base_url=BASE, timeout=15) as client:
            for label, bandwidth, latency, mesh, emergency in modes:
                cfg = await client.post("/api/simulator/config", json={
                    "session_id": sid,
                    "bandwidth_kbps": bandwidth,
                    "latency_ms": latency,
                    "jitter_ms": 0,
                    "packet_loss_pct": 0,
                })
                cfg_ok = cfg.status_code == 200
                text = f"{label} test message"
                msg_type = "emergency_alert" if emergency else "voice_message"
                await field_ws.send(json.dumps({
                    "type": msg_type,
                    "text": text,
                    "audio_size": 45000 if bandwidth >= 6 else 0,
                    "is_emergency": emergency,
                    "language": "en",
                    "latitude": 13.0827,
                    "longitude": 80.2707,
                    "relayed_via_mesh": mesh,
                }))

                ack_task = asyncio.create_task(recv_until(field_ws, lambda m: m.get("type") == "ack", timeout=25))
                cmd_task = asyncio.create_task(recv_until(command_ws, lambda m: m.get("type") in {"voice_message", "text_message", "emergency_alert"} and m.get("text") == text, timeout=25))
                (ack, _), (received, _) = await asyncio.gather(ack_task, cmd_task)
                pass_test = bool(cfg_ok and ack and ack.get("status") == "delivered" and received and received.get("text") == text)
                results.append({
                    "case": label,
                    "config": cfg_ok,
                    "ack": ack.get("status") if ack else None,
                    "command_received": bool(received),
                    "mesh_flag": received.get("relayed_via_mesh") if received else None,
                    "pass": pass_test,
                })
                print(json.dumps(results[-1]))

            # Government emergency alert broadcast semantics on the shared Government path.
            await client.post("/api/simulator/config", json={
                "session_id": sid, "bandwidth_kbps": 20, "latency_ms": 50,
                "jitter_ms": 0, "packet_loss_pct": 0,
            })
            gov_text = "GOVERNMENT SOS: Coastal evacuation advisory"
            await field_ws.send(json.dumps({
                "type": "emergency_alert", "text": gov_text, "audio_size": 0,
                "is_emergency": True, "language": "en", "latitude": 13.0827,
                "longitude": 80.2707, "relayed_via_mesh": False,
            }))
            (gov_ack, _), (gov_received, _) = await asyncio.gather(
                asyncio.create_task(recv_until(field_ws, lambda m: m.get("type") == "ack", timeout=20)),
                asyncio.create_task(recv_until(command_ws, lambda m: m.get("type") == "emergency_alert" and m.get("text") == gov_text, timeout=20)),
            )
            gov_result = {
                "case": "Government SOS emergency alert",
                "ack": gov_ack.get("status") if gov_ack else None,
                "command_received": bool(gov_received),
                "emergency_type": gov_received.get("type") if gov_received else None,
                "pass": bool(gov_ack and gov_ack.get("status") == "delivered" and gov_received),
            }
            results.append(gov_result)
            print(json.dumps(gov_result))

    print("SUMMARY", json.dumps({"passed": sum(1 for x in results if x["pass"]), "total": len(results), "results": results}))
    if not all(x["pass"] for x in results):
        raise SystemExit(1)

if __name__ == "__main__":
    asyncio.run(main())
