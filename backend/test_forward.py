import asyncio, json, httpx, websockets

async def test():
    async with httpx.AsyncClient() as c:
        r = await c.post('http://localhost:8000/api/session/create', json={'field_username':'fwd_test_f2','command_username':'fwd_test_c2'})
        d = r.json()
        sid = d['session_id']
        ftok = d['field_token']
        ctok = d['command_token']
        print('Session:', sid[:20])

    results = {'cmd_received': 0, 'dropped': 0, 'delivered': 0}

    async def cmd_listener():
        curl = f'ws://localhost:8000/ws/command/{sid}?token={ctok}'
        async with websockets.connect(curl) as ws:
            for _ in range(30):
                try:
                    m = json.loads(await asyncio.wait_for(ws.recv(), timeout=3))
                    t = m.get('type','')
                    if t in ('voice_message','text_message'):
                        results['cmd_received'] += 1
                        print(f'  CMD GOT: {m.get("text","")[:40]}')
                except asyncio.TimeoutError:
                    break

    async def field_sender():
        await asyncio.sleep(0.4)
        furl = f'ws://localhost:8000/ws/field/{sid}?token={ftok}'
        async with websockets.connect(furl) as ws:
            # drain setup messages
            for _ in range(4):
                try:
                    await asyncio.wait_for(ws.recv(), timeout=1.5)
                except asyncio.TimeoutError:
                    break
            # send 5 messages
            for i in range(5):
                await ws.send(json.dumps({
                    'type':'voice_message',
                    'text': f'Test message number {i}',
                    'audio_size':0,'is_emergency':False,'language':'en',
                    'latitude':13.0,'longitude':80.0,'relayed_via_mesh':False
                }))
                for _ in range(5):
                    try:
                        ack = json.loads(await asyncio.wait_for(ws.recv(), timeout=10))
                        if ack.get('type') == 'ack':
                            st = ack.get('status','?')
                            if st == 'dropped':
                                results['dropped'] += 1
                            else:
                                results['delivered'] += 1
                            print(f'  MSG {i}: {st.upper()}')
                            break
                    except asyncio.TimeoutError:
                        print(f'  MSG {i}: TIMEOUT')
                        break
                await asyncio.sleep(0.15)

    await asyncio.gather(cmd_listener(), field_sender())
    print()
    print('RESULTS:', results)
    if results['cmd_received'] >= results['delivered']:
        print('PASS - All delivered messages reached Command Center!')
    else:
        print(f'ISSUE - Delivered={results["delivered"]} but Command received={results["cmd_received"]}')

asyncio.run(test())
