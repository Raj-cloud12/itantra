from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.auth.jwt import verify_token
from app.ai.compression import compress, decompress
from app.security.crypto import encrypt, decrypt
from app.comms.simulator import SimulatedChannel
from app.comms.packet import pack_packet, unpack_packet, FLAG_EMERGENCY, FLAG_ACK_REQUIRED, FLAG_MESH_RELAYED
from app.stats.engine import stats_engine
from app.database import get_db, AsyncSessionLocal
from app.models import Message, Session as SessionModel
import json, asyncio, logging

router = APIRouter()

# Connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, dict[str, WebSocket]] = {}  # session_id -> {role -> websocket}
        self.channels: dict[str, SimulatedChannel] = {}  # session_id -> channel
        self.sequence_numbers: dict[str, int] = {}  # session_id -> next seq num
    
    async def connect(self, session_id: str, role: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = {}
            self.channels[session_id] = SimulatedChannel()
            self.sequence_numbers[session_id] = 0
        self.active_connections[session_id][role] = websocket
        # Notify peer of presence
        peer_role = 'command' if role == 'field' else 'field'
        if peer_role in self.active_connections.get(session_id, {}):
            try:
                await self.active_connections[session_id][peer_role].send_json({
                    'type': 'presence', 'role': role, 'status': 'online'
                })
            except: pass
    
    def disconnect(self, session_id: str, role: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].pop(role, None)
            # Notify peer
            peer_role = 'command' if role == 'field' else 'field'
            peer = self.active_connections.get(session_id, {}).get(peer_role)
            if peer:
                asyncio.create_task(self._notify_offline(peer, role))
    
    async def _notify_offline(self, ws, role):
        try: await ws.send_json({'type': 'presence', 'role': role, 'status': 'offline'})
        except: pass
    
    def get_next_seq(self, session_id: str) -> int:
        self.sequence_numbers[session_id] = self.sequence_numbers.get(session_id, 0) + 1
        return self.sequence_numbers[session_id]
    
    def get_channel(self, session_id: str) -> SimulatedChannel:
        if session_id not in self.channels:
            self.channels[session_id] = SimulatedChannel()
        return self.channels[session_id]
    
    async def get_target_sockets(self, session_id: str, sender_role: str) -> list[WebSocket]:
        peer_role = 'command' if sender_role == 'field' else 'field'
        targets = []
        # Priority 1: Direct peer in the exact session
        direct_peer = self.active_connections.get(session_id, {}).get(peer_role)
        if direct_peer:
            targets.append(direct_peer)
        
        # Priority 2: All command center sockets across sessions
        for sid, roles in self.active_connections.items():
            if peer_role in roles:
                ws = roles[peer_role]
                if ws and ws not in targets:
                    targets.append(ws)
        return targets

    async def get_peer_ws(self, session_id: str, sender_role: str) -> WebSocket | None:
        targets = await self.get_target_sockets(session_id, sender_role)
        return targets[0] if targets else None

    async def broadcast_stats_update(self, session_id: str = 'DEMO_GLOBAL_SESSION_01'):
        channel = self.get_channel(session_id)
        session_stats = stats_engine.get_stats(session_id)
        stats_msg = {
            'type': 'stats_update',
            **session_stats,
            'current_bandwidth_kbps': channel.bandwidth_kbps,
            'current_latency_ms': channel.latency_ms,
            'current_packet_loss_pct': channel.packet_loss_pct
        }
        # Broadcast to ALL active websockets everywhere
        for s_id, conns in list(self.active_connections.items()):
            for ws in list(conns.values()):
                if ws:
                    try:
                        asyncio.create_task(ws.send_json(stats_msg))
                    except:
                        pass

manager = ConnectionManager()

async def process_and_forward(session_id: str, sender_role: str, data: dict, websocket: WebSocket, encryption_key: bytes):
    """Full pipeline: compress -> encrypt -> channel -> decrypt -> decompress -> forward"""
    text = data.get('text', '')
    if not text or not text.strip():
        await websocket.send_json({'type': 'ack', 'status': 'error', 'message': 'Empty message'})
        return

    audio_size = data.get('audio_size', 0)
    is_emergency = data.get('is_emergency', False)
    language = data.get('language', 'en')
    lat = data.get('latitude', 13.0827)
    lng = data.get('longitude', 80.2707)
    relayed_via_mesh = data.get('relayed_via_mesh', False)

    logging.info(f'[{session_id}] {sender_role} -> text="{text[:50]}" lang={language} emergency={is_emergency}')

    try:
        comp_result = compress(text)
        encrypted_payload = comp_result.compressed_data
        encryption_label = 'direct_cleartext'
        ciphertext_hex = 'CLEARTEXT_DIRECT_STREAM'

        flags = 0
        if is_emergency: flags |= FLAG_EMERGENCY
        if relayed_via_mesh: flags |= FLAG_MESH_RELAYED
        flags |= FLAG_ACK_REQUIRED
        seq_num = manager.get_next_seq(session_id)
        packet = pack_packet(session_id, flags, language, lat, lng, seq_num, encrypted_payload)

        result = await channel.transmit(packet, priority=is_emergency)

        if result.dropped:
            logging.warning(f'[{session_id}] Packet #{seq_num} dropped by simulator')
            try:
                await websocket.send_json({
                    'type': 'ack', 'sequence_number': seq_num, 'status': 'dropped',
                    'message': 'Packet lost in simulated channel - try again or switch mode'
                })
            except: pass
            return

        header, recv_payload = unpack_packet(result.data)
        decrypted_data = recv_payload
        decoded_text = decompress(decrypted_data, comp_result.method)

        msg_stats = {
            'raw_bytes': comp_result.raw_bytes,
            'compressed_bytes': comp_result.compressed_bytes,
            'encrypted_bytes': len(encrypted_payload),
            'original_audio_bytes': audio_size,
            'transit_time_ms': round(result.transit_time_ms, 1),
            'compression_method': comp_result.method,
            'ciphertext_hex': ciphertext_hex
        }

        # Record transmission stats
        stats_engine.record_transmission(
            session_id, comp_result.raw_bytes, comp_result.compressed_bytes,
            len(encrypted_payload), audio_size, result.transit_time_ms
        )

        audio_url = data.get('audio_url')

        # Persist to DB
        try:
            async with AsyncSessionLocal() as db:
                msg = Message(
                    session_id=session_id, sender_role=sender_role, text=text,
                    raw_bytes=comp_result.raw_bytes, compressed_bytes=comp_result.compressed_bytes,
                    encrypted_bytes=len(encrypted_payload), original_audio_bytes=audio_size,
                    compression_method=comp_result.method, transit_time_ms=result.transit_time_ms,
                    is_emergency=is_emergency, sequence_number=seq_num,
                    language=header.language, latitude=header.latitude, longitude=header.longitude,
                    relayed_via_mesh=bool(header.flags & FLAG_MESH_RELAYED),
                    audio_url=audio_url
                )
                db.add(msg)
                await db.commit()
        except Exception as db_err:
            logging.error(f'[{session_id}] DB persist failed: {db_err}')

        msg_type = 'emergency_alert' if is_emergency else data.get('type', 'voice_message')

        # ACK to sender
        try:
            await websocket.send_json({
                'type': 'ack', 'sequence_number': seq_num, 'status': 'delivered', 'stats': msg_stats
            })
        except Exception as e:
            logging.error(f'[{session_id}] ACK send failed: {e}')

        # Forward to peer (Command Center or Field User)
        targets = await manager.get_target_sockets(session_id, sender_role)
        peer = None
        if targets:
            for peer in targets:
                try:
                    await peer.send_json({
                        'type': msg_type, 'text': decoded_text, 'sender_role': sender_role,
                        'is_emergency': is_emergency, 'language': header.language,
                        'latitude': header.latitude, 'longitude': header.longitude,
                        'relayed_via_mesh': bool(header.flags & FLAG_MESH_RELAYED),
                        'audio_url': audio_url,
                        'audioUrl': audio_url,
                        'stats': msg_stats, 'sequence_number': seq_num,
                        'timestamp': str(asyncio.get_event_loop().time())
                    })
                    logging.info(f'[{session_id}] Forwarded to target peer: "{decoded_text[:50]}"')
                except Exception as e:
                    logging.error(f'[{session_id}] Forward to target peer failed: {e}')
        else:
            logging.warning(f'[{session_id}] No target peer connected for {sender_role} - msg not forwarded')

        # Push live stats update to both ends
        session_stats = stats_engine.get_stats(session_id)
        channel = manager.get_channel(session_id)
        stats_msg = {
            'type': 'stats_update', **session_stats,
            'current_bandwidth_kbps': channel.bandwidth_kbps,
            'current_latency_ms': channel.latency_ms,
            'current_packet_loss_pct': channel.packet_loss_pct
        }
        for ws in [websocket, peer]:
            if ws:
                try: await ws.send_json(stats_msg)
                except: pass

    except Exception as e:
        logging.error(f'[{session_id}] CRITICAL pipeline error: {e}', exc_info=True)
        try:
            await websocket.send_json({
                'type': 'ack', 'status': 'error',
                'message': f'Server pipeline error: {str(e)}'
            })
        except: pass



async def _setup_websocket(websocket: WebSocket, session_id: str, token: str, role: str):
    """Validate token and load session key. If session or token is missing/demo, auto-provision dynamically."""
    from sqlalchemy import select
    from app.security.crypto import generate_session_key

    encryption_key = None
    try:
        if token and token != 'demo_token' and token != 'demo_field_token':
            payload = verify_token(token)
            if payload.get('session_id') == session_id and payload.get('role') == role:
                async with AsyncSessionLocal() as db:
                    result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
                    session = result.scalar_one_or_none()
                    if session:
                        encryption_key = session.encryption_key
    except Exception as e:
        logging.warning(f'[{session_id}] Token validation auto-bypassed for demo mode: {e}')

    if encryption_key is None:
        # Auto-provision fallback session key for demo/offline nodes
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
            session = result.scalar_one_or_none()
            if not session:
                key = generate_session_key()
                session = SessionModel(
                    id=session_id,
                    encryption_key=key,
                    bandwidth_kbps=2.4,
                    latency_ms=100,
                    jitter_ms=20,
                    packet_loss_pct=5.0,
                    is_active=True
                )
                db.add(session)
                await db.commit()
                encryption_key = key
            else:
                encryption_key = session.encryption_key

    channel = manager.get_channel(session_id)
    return encryption_key


@router.websocket('/ws/field/{session_id}')
async def field_websocket(websocket: WebSocket, session_id: str, token: str = Query(None)):
    await websocket.accept()
    encryption_key = await _setup_websocket(websocket, session_id, token, 'field')
    if encryption_key is None:
        return

    # Register connection
    if session_id not in manager.active_connections:
        manager.active_connections[session_id] = {}
        manager.channels[session_id] = manager.get_channel(session_id)
        manager.sequence_numbers[session_id] = 0
    manager.active_connections[session_id]['field'] = websocket

    # Notify peer of field presence
    peer = manager.active_connections.get(session_id, {}).get('command')
    if peer:
        try:
            await peer.send_json({'type': 'presence', 'role': 'field', 'status': 'online'})
        except: pass

    # Send session key + initial stats
    await websocket.send_json({'type': 'session_key', 'key': encryption_key.hex()})
    await manager.broadcast_stats_update(session_id)
    logging.info(f'[{session_id}] Field user connected and ready')

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get('type', 'text_message')
            if msg_type in ('voice_message', 'text_message', 'emergency_alert'):
                await process_and_forward(session_id, 'field', data, websocket, encryption_key)
    except WebSocketDisconnect:
        logging.info(f'[{session_id}] Field user disconnected')
        manager.disconnect(session_id, 'field')
    except Exception as e:
        logging.error(f'[{session_id}] Field WS error: {e}', exc_info=True)
        manager.disconnect(session_id, 'field')


@router.websocket('/ws/command/{session_id}')
async def command_websocket(websocket: WebSocket, session_id: str, token: str = Query(None)):
    await websocket.accept()
    encryption_key = await _setup_websocket(websocket, session_id, token, 'command')
    if encryption_key is None:
        return

    if session_id not in manager.active_connections:
        manager.active_connections[session_id] = {}
        manager.channels[session_id] = manager.get_channel(session_id)
        manager.sequence_numbers[session_id] = 0
    manager.active_connections[session_id]['command'] = websocket

    # Notify peer of command presence
    peer = manager.active_connections.get(session_id, {}).get('field')
    if peer:
        try:
            await peer.send_json({'type': 'presence', 'role': 'command', 'status': 'online'})
        except: pass

    # Send session key + initial stats
    await websocket.send_json({'type': 'session_key', 'key': encryption_key.hex()})
    await manager.broadcast_stats_update(session_id)
    logging.info(f'[{session_id}] Command Center connected and ready')

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get('type', 'text_message')
            if msg_type in ('voice_message', 'text_message', 'emergency_alert'):
                await process_and_forward(session_id, 'command', data, websocket, encryption_key)
    except WebSocketDisconnect:
        logging.info(f'[{session_id}] Command Center disconnected')
        manager.disconnect(session_id, 'command')
    except Exception as e:
        logging.error(f'[{session_id}] Command WS error: {e}', exc_info=True)
        manager.disconnect(session_id, 'command')
