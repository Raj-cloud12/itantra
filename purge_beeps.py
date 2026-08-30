import sqlite3

conn = sqlite3.connect('d:/itantra/backend/ititantra.db')
c = conn.cursor()
c.execute("UPDATE messages SET audio_url = NULL WHERE length(audio_url) = 32082 OR audio_url LIKE '%UklGRuRdAABX%'")
conn.commit()
c.execute("SELECT count(*) FROM messages WHERE length(audio_url) = 32082 OR audio_url LIKE '%UklGRuRdAABX%'")
count = c.fetchone()[0]
print("Remaining dummy beep records in DB:", count)
conn.close()
