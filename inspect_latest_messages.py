import json
import sqlite3
from pathlib import Path

path = Path(r"D:\itantra\backend\ititantra.db")
conn = sqlite3.connect(path, timeout=30)
conn.execute("PRAGMA busy_timeout=30000")
rows = conn.execute(
    "SELECT id, text, language, original_audio_bytes, audio_url, created_at "
    "FROM messages WHERE text LIKE 'Hello world - Mode%' ORDER BY id DESC LIMIT 12"
).fetchall()
for row in reversed(rows):
    msg_id, text, language, audio_bytes, audio_url, created_at = row
    print(json.dumps({
        "id": msg_id,
        "text": text,
        "language": language,
        "original_audio_bytes": audio_bytes,
        "audio_present": bool(audio_url),
        "audio_prefix": (audio_url or "")[:32],
        "audio_chars": len(audio_url or ""),
        "created_at": str(created_at),
    }, ensure_ascii=False))
conn.close()
