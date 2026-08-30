from dataclasses import dataclass, field

@dataclass
class SessionStats:
    total_bytes_transmitted: int = 0
    total_raw_audio_bytes: int = 0
    total_compressed_bytes: int = 0
    total_encrypted_bytes: int = 0
    message_count: int = 0
    total_transit_time_ms: float = 0.0

class StatsEngine:
    def __init__(self):
        self._sessions: dict[str, SessionStats] = {}
    
    def _ensure_session(self, session_id: str):
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionStats()
    
    def record_transmission(self, session_id: str, raw_bytes: int, compressed_bytes: int, encrypted_bytes: int, audio_bytes: int, transit_time_ms: float):
        self._ensure_session(session_id)
        s = self._sessions[session_id]
        s.total_bytes_transmitted += encrypted_bytes
        s.total_raw_audio_bytes += audio_bytes
        s.total_compressed_bytes += compressed_bytes
        s.total_encrypted_bytes += encrypted_bytes
        s.message_count += 1
        s.total_transit_time_ms += transit_time_ms
    
    def get_stats(self, session_id: str) -> dict:
        self._ensure_session(session_id)
        s = self._sessions[session_id]
        # bytes_saved_pct: compare actual transmitted bytes vs raw audio bytes
        if s.total_raw_audio_bytes > 0:
            bytes_saved_pct = (1 - s.total_bytes_transmitted / s.total_raw_audio_bytes) * 100
        else:
            # Fall back to text comparison
            bytes_saved_pct = 0.0
        
        avg_transit = s.total_transit_time_ms / s.message_count if s.message_count > 0 else 0
        
        return {
            'total_bytes_transmitted': s.total_bytes_transmitted,
            'total_raw_audio_bytes': s.total_raw_audio_bytes,
            'total_compressed_bytes': s.total_compressed_bytes,
            'message_count': s.message_count,
            'bytes_saved_pct': round(max(0, bytes_saved_pct), 1),
            'avg_transit_time_ms': round(avg_transit, 1),
        }

stats_engine = StatsEngine()
