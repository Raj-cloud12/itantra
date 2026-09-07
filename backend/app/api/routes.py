import os, sys, tempfile, base64, asyncio, logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from app.stats.engine import stats_engine
from app.ws.handler import manager
from app.database import AsyncSessionLocal
from app.models import Message, Session as SessionModel, User
from app.ai.compression import compress

router = APIRouter(prefix='/api')

recent_mesh_messages: list[dict] = []

# Pre-load Whisper Tiny Model locally
whisper_model = None

def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        try:
            from faster_whisper import WhisperModel
            import os
            
            local_model_path = os.path.expanduser(r"~/.cache/huggingface/hub/models--Systran--faster-whisper-tiny/snapshots/d90ca5fe260221311c53c58e660288d3deb8d356")
            if os.path.exists(local_model_path):
                whisper_model = WhisperModel(local_model_path, device='cpu', compute_type='int8', local_files_only=True)
            else:
                whisper_model = WhisperModel('tiny', device='cpu', compute_type='int8')
            print("[Whisper] Neural STT Model loaded and ready from local cache!", flush=True)
        except Exception as e:
            print(f"[Whisper] Failed to load model: {e}", flush=True)
    return whisper_model

# Initialize model at startup
try:
    get_whisper_model()
except:
    pass

class SimulatorConfig(BaseModel):
    session_id: str
    bandwidth_kbps: float | None = None
    latency_ms: int | None = None
    jitter_ms: int | None = None
    packet_loss_pct: float | None = None

class UsernameClaim(BaseModel):
    username: str

@router.get('/users/check-username')
async def check_username(username: str):
    normalized = username.strip().lower()
    if not normalized.startswith('@'):
        normalized = f"@{normalized}"
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == normalized))
        existing = result.scalar_one_or_none()
        return {
            'username': normalized,
            'available': existing is None,
            'message': 'Username is available' if existing is None else 'Username is already taken'
        }

@router.post('/users/claim-username')
async def claim_username(claim: UsernameClaim):
    normalized = claim.username.strip().lower()
    if not normalized.startswith('@'):
        normalized = f"@{normalized}"
        
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == normalized))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail=f"Username '{normalized}' is already taken.")
        
        user = User(username=normalized, role='field')
        db.add(user)
        await db.commit()
        return {'status': 'ok', 'username': normalized, 'message': 'Username successfully claimed and locked'}

class MessageCreatePayload(BaseModel):
    model_config = {'extra': 'allow'}
    session_id: str = "DEMO_GLOBAL_SESSION_01"
    sender_role: str = 'field'
    text: str = ""
    is_emergency: bool = False
    language: str = "ta"
    latitude: float = 12.8718
    longitude: float = 80.2185
    audio_url: str | None = None
    audio_size: int = 0
    type: str = 'voice_message'
    network_mode: str = 'mode-3-ai-mesh'
    cipher_code: str | None = None
    gateway_node: str | None = None
    hop_count: int = 1
    address_name: str | None = None

def transcribe_audio_base64(audio_base64: str) -> tuple[str, str]:
    """Transcribes audio using local faster-whisper neural model."""
    try:
        model = get_whisper_model()
        if not model:
            return "", ""

        suffix = '.webm'
        if 'audio/mp4' in audio_base64 or 'audio/m4a' in audio_base64 or 'audio/aac' in audio_base64:
            suffix = '.m4a'
        elif 'audio/wav' in audio_base64:
            suffix = '.wav'

        raw_data = audio_base64
        if ',' in raw_data:
            raw_data = raw_data.split(',', 1)[1]

        audio_bytes = base64.b64decode(raw_data)
        if len(audio_bytes) < 100:
            return "", ""

        if audio_bytes[:4] == b'RIFF':
            suffix = '.wav'
        elif len(audio_bytes) > 8 and audio_bytes[4:8] == b'ftyp':
            suffix = '.m4a'

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            segments, info = model.transcribe(
                tmp_path,
                beam_size=1,
                best_of=1,
                temperature=0.0,
                vad_filter=True,
                condition_on_previous_text=False,
                without_timestamps=True
            )
            transcription = ' '.join([seg.text for seg in segments]).strip()
            detected_lang = info.language or 'ta'
            print(f"[Whisper STT Fast Decoded]: '{transcription}' (Lang: {detected_lang})", flush=True)
            return transcription, detected_lang
        finally:
            if os.path.exists(tmp_path):
                try: os.unlink(tmp_path)
                except: pass
    except Exception as e:
        print(f"[Whisper STT Error]: {e}", flush=True)
        return "", ""

class STTBase64Payload(BaseModel):
    audio_base64: str
    language: str | None = None

@router.post('/stt/base64')
async def speech_to_text_base64(payload: STTBase64Payload):
    text, lang = transcribe_audio_base64(payload.audio_base64)
    return {'text': text, 'language': lang}

@router.get('/messages/mesh')
async def get_mesh_messages():
    global recent_mesh_messages
    return recent_mesh_messages[-50:]

@router.post('/messages/send')
async def post_message(msg: MessageCreatePayload):
    global recent_mesh_messages
    final_audio = msg.audio_url.strip() if isinstance(msg.audio_url, str) and msg.audio_url.strip() else None
    
    # 🧠 Neural Whisper Auto-Transcription if audio is present (Mode 1 & 2 only, Mode 3 backend STT removed)
    if msg.network_mode != 'mode-3-ai-mesh' and final_audio and (not msg.text or msg.text.startswith("குரல் செய்தி") or "Spoken Voice" in msg.text or "Transcribing" in msg.text):
        whisper_text, detected_lang = transcribe_audio_base64(final_audio)
        if whisper_text:
            msg.text = whisper_text
            if detected_lang:
                msg.language = detected_lang

    comp_result = compress(msg.text)

    # Build full mesh message object
    sender_user = getattr(msg, 'sender_username', None) or (f"@{msg.sender_role}" if msg.sender_role else '@user')
    target_user = getattr(msg, 'target_username', None) or '@all_friends'
    is_private_mesh = getattr(msg, 'is_local_mesh_private', False) or getattr(msg, 'session_id', '') == 'LOCAL_MESH_PRIVATE'
    local_m = getattr(msg, 'local_mode', msg.network_mode)
    node_id_val = getattr(msg, 'node_id', None)
    cipher_tok = getattr(msg, 'cipher_code', None) or 'LOCK#KEY-7A4B'

    mesh_msg_item = {
        'id': getattr(msg, 'id', None) or str(asyncio.get_event_loop().time()),
        'session_id': msg.session_id,
        'sender_role': msg.sender_role,
        'sender_username': sender_user,
        'target_username': target_user,
        'is_local_mesh_private': is_private_mesh,
        'local_mode': local_m,
        'node_id': node_id_val,
        'type': 'voice_message' if final_audio else 'text_message',
        'text': msg.text,
        'audio_size': msg.audio_size or (45000 if final_audio else 0),
        'audio_url': final_audio,
        'audioUrl': final_audio,
        'cipher_code': cipher_tok,
        'timestamp': str(asyncio.get_event_loop().time())
    }

    # Store in fast in-memory buffer
    recent_mesh_messages.append(mesh_msg_item)
    if len(recent_mesh_messages) > 100:
        recent_mesh_messages = recent_mesh_messages[-100:]

    # Broadcast live payload to active websocket connections
    for sess_id, conns in list(manager.active_connections.items()):
        for role, ws in list(conns.items()):
            if ws:
                if is_private_mesh and role == 'command':
                    continue
                try:
                    asyncio.create_task(ws.send_json(mesh_msg_item))
                except:
                    pass

    return {'status': 'delivered', 'text': msg.text, 'id': mesh_msg_item['id']}

@router.get('/stats/{session_id}')
async def get_stats(session_id: str):
    channel = manager.get_channel(session_id)
    stats = stats_engine.get_stats(session_id)
    return {
        **stats,
        'current_bandwidth_kbps': channel.bandwidth_kbps,
        'current_latency_ms': channel.latency_ms,
        'current_jitter_ms': channel.jitter_ms,
        'current_packet_loss_pct': channel.packet_loss_pct
    }

@router.get('/simulator/current')
async def get_current_simulator():
    channel = manager.get_channel('DEMO_GLOBAL_SESSION_01')
    return {
        'status': 'ok',
        'current': {
            'bandwidth_kbps': channel.bandwidth_kbps,
            'latency_ms': channel.latency_ms,
            'jitter_ms': channel.jitter_ms,
            'packet_loss_pct': channel.packet_loss_pct
        }
    }

@router.post('/simulator/config')
async def update_simulator_config(config: SimulatorConfig):
    updates = {}
    if config.bandwidth_kbps is not None: updates['bandwidth_kbps'] = config.bandwidth_kbps
    if config.latency_ms is not None: updates['latency_ms'] = config.latency_ms
    if config.jitter_ms is not None: updates['jitter_ms'] = config.jitter_ms
    if config.packet_loss_pct is not None: updates['packet_loss_pct'] = config.packet_loss_pct

    channel = manager.get_channel(config.session_id)
    channel.configure(**updates)

    demo_channel = manager.get_channel('DEMO_GLOBAL_SESSION_01')
    demo_channel.configure(**updates)

    for ch in manager.channels.values():
        ch.configure(**updates)
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(SessionModel).where(SessionModel.id == config.session_id))
        session = result.scalar_one_or_none()
        if session:
            if config.bandwidth_kbps is not None: session.bandwidth_kbps = config.bandwidth_kbps
            if config.latency_ms is not None: session.latency_ms = config.latency_ms
            if config.jitter_ms is not None: session.jitter_ms = config.jitter_ms
            if config.packet_loss_pct is not None: session.packet_loss_pct = config.packet_loss_pct
            await db.commit()
    
    for active_session_id in list(manager.active_connections):
        await manager.broadcast_stats_update(active_session_id)

    return {'status': 'ok', 'current': {
        'bandwidth_kbps': demo_channel.bandwidth_kbps,
        'latency_ms': demo_channel.latency_ms,
        'jitter_ms': demo_channel.jitter_ms,
        'packet_loss_pct': demo_channel.packet_loss_pct
    }}

@router.get('/messages/all')
async def get_all_messages():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Message).order_by(Message.id.desc()).limit(25))
        messages = list(reversed(result.scalars().all()))
        return [{
            'id': m.id,
            'sender_role': m.sender_role,
            'text': m.text,
            'raw_bytes': m.raw_bytes,
            'compressed_bytes': m.compressed_bytes,
            'encrypted_bytes': m.encrypted_bytes,
            'original_audio_bytes': m.original_audio_bytes,
            'compression_method': m.compression_method,
            'transit_time_ms': m.transit_time_ms,
            'is_emergency': m.is_emergency,
            'sequence_number': m.sequence_number,
            'language': m.language,
            'latitude': m.latitude,
            'longitude': m.longitude,
            'audio_url': m.audio_url,
            'audioUrl': m.audio_url,
            'created_at': str(m.created_at)
        } for m in messages]

@router.get('/messages/{session_id}')
async def get_messages(session_id: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Message).where(Message.session_id == session_id).order_by(Message.created_at)
        )
        messages = result.scalars().all()
        return [{
            'id': m.id,
            'sender_role': m.sender_role,
            'text': m.text,
            'raw_bytes': m.raw_bytes,
            'compressed_bytes': m.compressed_bytes,
            'encrypted_bytes': m.encrypted_bytes,
            'original_audio_bytes': m.original_audio_bytes,
            'compression_method': m.compression_method,
            'transit_time_ms': m.transit_time_ms,
            'is_emergency': m.is_emergency,
            'sequence_number': m.sequence_number,
            'language': m.language,
            'audio_url': m.audio_url,
            'audioUrl': m.audio_url,
            'created_at': str(m.created_at)
        } for m in messages]

import socket

@router.get("/system/ip")
async def get_system_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return {"ip": ip}

@router.post('/stt')
async def speech_to_text(file: UploadFile = File(...), language: str = Form(None)):
    """STT fallback using faster-whisper. Returns transcript in detected or requested language."""
    try:
        model = get_whisper_model()
        if not model:
            raise HTTPException(status_code=500, detail="Whisper model unavailable")
            
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            segments, info = model.transcribe(tmp_path, language=language if language else None)
            text = ' '.join([seg.text for seg in segments])
            return {'text': text.strip(), 'language': info.language}
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
