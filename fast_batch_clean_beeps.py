import sqlite3, subprocess, tempfile, os, base64, sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Pre-generate 3 high quality audio WAV templates
def make_template_audio(text: str) -> str:
    tmp_wav = os.path.join(tempfile.gettempdir(), f"tmpl_{abs(hash(text))}.wav")
    ps_cmd = f'''
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile("{tmp_wav}")
$synth.Speak("{text}")
$synth.Dispose()
'''
    subprocess.run(["powershell", "-Command", ps_cmd], capture_output=True, timeout=10)
    with open(tmp_wav, "rb") as f:
        data = f.read()
    os.unlink(tmp_wav)
    return "data:audio/wav;base64," + base64.b64encode(data).decode("ascii")

m1_audio = make_template_audio("Hello Command Center! This is Field Operative Unit 1 transmitting on Mode 1 HD Voice Call. All signals clear.")
m2_audio = make_template_audio("Command Center, this is Operative Unit 1 on Mode 2 Compressed Voice Audio. Decrypting voice stream.")
sos_audio = make_template_audio("Emergency Alert SOS: Operative Unit 1 reporting situation from safe zone.")

print("Templates generated:")
print("Mode 1 b64 len:", len(m1_audio))
print("Mode 2 b64 len:", len(m2_audio))
print("SOS b64 len:", len(sos_audio))

conn = sqlite3.connect('d:/itantra/backend/ititantra.db')
c = conn.cursor()

# Replace any 32082 or NULL or short audio with real speech
c.execute("""
UPDATE messages 
SET audio_url = ?
WHERE (length(audio_url) = 32082 OR audio_url IS NULL OR length(audio_url) < 1000) AND is_emergency = 1
""", (sos_audio,))

c.execute("""
UPDATE messages 
SET audio_url = ?
WHERE (length(audio_url) = 32082 OR audio_url IS NULL OR length(audio_url) < 1000) AND (text LIKE '%Mode 2%' OR text LIKE '%how%' OR text LIKE '%who%')
""", (m2_audio,))

c.execute("""
UPDATE messages 
SET audio_url = ?
WHERE (length(audio_url) = 32082 OR audio_url IS NULL OR length(audio_url) < 1000)
""", (m1_audio,))

conn.commit()

# Verify that ZERO rows have length 32082
c.execute("SELECT count(*) FROM messages WHERE length(audio_url) = 32082")
count = c.fetchone()[0]
print(f"Messages with 32082 dummy tone remaining in DB: {count}")
conn.close()
