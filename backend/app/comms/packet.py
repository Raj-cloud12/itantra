import struct, uuid
from dataclasses import dataclass

MAGIC = b'\x49\x54'  # 'IT'
VERSION = 1
HEADER_FORMAT = '!2sB16sBBffII'  # magic(2) + version(1) + session_id(16) + flags(1) + lang(1) + lat(4) + lng(4) + seq_num(4) + payload_len(4)
HEADER_SIZE = struct.calcsize(HEADER_FORMAT)

LANG_MAP = {
    'en': 0, 'hi': 1, 'ta': 2, 'te': 3, 'ml': 4,
    'kn': 5, 'mr': 6, 'bn': 7, 'gu': 8
}
REVERSE_LANG_MAP = {v: k for k, v in LANG_MAP.items()}

@dataclass
class PacketHeader:
    session_id: str
    flags: int  # bit 0 = emergency, bit 1 = ACK, bit 2 = Mesh Relayed
    language: str
    latitude: float
    longitude: float
    sequence_number: int
    payload_length: int

FLAG_EMERGENCY = 0x01
FLAG_ACK_REQUIRED = 0x02
FLAG_MESH_RELAYED = 0x04

def _session_bytes(session_id: str) -> bytes:
    """Return a stable 16-byte transport ID for both UUID and demo session IDs."""
    try:
        return uuid.UUID(session_id).bytes
    except (ValueError, AttributeError, TypeError):
        # The UI intentionally uses a readable shared demo ID. Keep that logical
        # ID at the WebSocket/database layer while using a deterministic UUID on
        # the binary wire format.
        return uuid.uuid5(uuid.NAMESPACE_URL, f"ititantra-session:{session_id}").bytes


def pack_packet(session_id: str, flags: int, language: str, lat: float, lng: float, seq_num: int, payload: bytes) -> bytes:
    session_bytes = _session_bytes(session_id)
    lang_byte = LANG_MAP.get(language, 0)
    header = struct.pack(HEADER_FORMAT, MAGIC, VERSION, session_bytes, flags, lang_byte, float(lat or 0.0), float(lng or 0.0), seq_num, len(payload))
    return header + payload

def unpack_packet(data: bytes) -> tuple[PacketHeader, bytes]:
    magic, version, session_bytes, flags, lang_byte, lat, lng, seq_num, payload_len = struct.unpack(HEADER_FORMAT, data[:HEADER_SIZE])
    assert magic == MAGIC, 'Invalid magic bytes'
    assert version == VERSION, f'Unsupported version {version}'
    session_id = str(uuid.UUID(bytes=session_bytes))
    language = REVERSE_LANG_MAP.get(lang_byte, 'en')
    payload = data[HEADER_SIZE:HEADER_SIZE + payload_len]
    header = PacketHeader(
        session_id=session_id,
        flags=flags,
        language=language,
        latitude=round(lat, 4),
        longitude=round(lng, 4),
        sequence_number=seq_num,
        payload_length=payload_len
    )
    return header, payload
