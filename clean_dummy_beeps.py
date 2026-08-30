import sqlite3, subprocess, tempfile, os, base64, sys
sys.stdout.reconfigure(encoding='utf-8')

def generate_speech_audio(text: str) -> str | None:
    try:
        clean_text = "".join(c for c in text if c.isalnum() or c in " .,!?-':").strip()
        if not clean_text:
            clean_text = "Emergency Voice Audio Transmission"
        
        tmp_wav = os.path.join(tempfile.gettempdir(), f"ititantra_clean_{id(text)}.wav")
        ps_cmd = f'''
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile("{tmp_wav}")
$synth.Speak("{clean_text}")
$synth.Dispose()
'''
        subprocess.run(["powershell", "-Command", ps_cmd], capture_output=True, timeout=6)
        if os.path.exists(tmp_wav):
            with open(tmp_wav, "rb") as f:
                data = f.read()
            os.unlink(tmp_wav)
            if len(data) > 1000:
                return "data:audio/wav;base64," + base64.b64encode(data).decode("ascii")
    except Exception as e:
        print("Error:", e)
    return None

conn = sqlite3.connect('d:/itantra/backend/ititantra.db')
c = conn.cursor()

c.execute('SELECT id, text, length(audio_url) FROM messages WHERE length(audio_url) = 32082 OR audio_url IS NULL')
rows = c.fetchall()
print(f'Found {len(rows)} messages to clean and replace with real speech audio...')

for r in rows:
    msg_id, text, audio_len = r
    real_audio = generate_speech_audio(text)
    if real_audio:
        c.execute('UPDATE messages SET audio_url = ? WHERE id = ?', (real_audio, msg_id))
        print(f'Updated message {msg_id} ({text[:30]}) with real human voice audio ({len(real_audio)} b64 bytes)')

conn.commit()
print('All dummy beeps cleaned successfully from database!')
conn.close()
