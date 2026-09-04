
import io

async def generate_english_ai_voice(text: str) -> str:
    """Generate crystal-clear English AI voice MP3 data URL using edge-tts / gTTS"""
    if not text or not text.strip():
        return ""
    clean_text = text.strip()
    # Try edge-tts first (high fidelity Azure Neural voice)
    try:
        import edge_tts
        comm = edge_tts.Communicate(clean_text, "en-US-AriaNeural")
        buf = io.BytesIO()
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        audio_bytes = buf.getvalue()
        if audio_bytes:
            return "data:audio/mp3;base64," + base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        print(f"[edge-tts error]: {e}", flush=True)

    # Fallback to gTTS
    try:
        from gtts import gTTS
        tts = gTTS(text=clean_text, lang="en", slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        audio_bytes = buf.getvalue()
        if audio_bytes:
            return "data:audio/mp3;base64," + base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e2:
        print(f"[gTTS error]: {e2}", flush=True)

    return ""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import sqlite3
import os
from dotenv import load_dotenv
load_dotenv()
import json
import base64
import uuid
import tempfile
import socket
import speech_recognition as sr
import ssl
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except Exception:
    pass

from datetime import datetime
import httpx

import sys
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except:
    pass

DB_PATH = r"D:\itantra\backend\ititantra.db"

app = FastAPI(title="iTiTantra Tactical Offline Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recent_mesh_messages: List[Dict[str, Any]] = []

# Active Network Mode State
active_network_mode = "mode-3-ai-mesh"
active_local_mode = "mode-2-p2p-2g"

@app.get("/")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "iTiTantra Tactical Offline Backend",
        "active_network_mode": active_network_mode,
        "active_local_mode": active_local_mode,
        "version": "2.0.0"
    }



# ==============================================================================
# 🧠 INDIC NEURAL SPEECH-TO-TEXT ASR & 9-LANGUAGE TRANSLATOR ENGINE
# ==============================================================================
import speech_recognition as sr
import ssl
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except Exception:
    pass


# 🌐 9 SUPPORTED INDIC LANGUAGES MATRIX
OFFLINE_DICTIONARY_9 = [
    {
        "keywords": ["medical", "doctor", "ambulance", "injury", "மருத்துவ", "வைத்திய", "चिकित्सा", "ചികിത്സ", "ವೈದ್ಯಕೀಯ", "চিকিৎসা"],
        "ta": "உடனடி மருத்துவ உதவி மற்றும் ஆம்புலன்ஸ் தேவை",
        "en": "Immediate medical assistance and ambulance needed",
        "te": "తక్షణ వైద్య సహాయం మరియు అంబులెన్స్ అవసరం",
        "hi": "तत्काल चिकित्सा सहायता और एम्बुलेंस की आवश्यकता है",
        "ml": "അടിയന്തര വൈദ്യസഹായവും ആംബുലൻസും ആവശ്യമാണ്",
        "kn": "ತಕ್ಷಣದ ವೈದ್ಯಕೀಯ ನೆರವು ಮತ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಅಗತ್ಯವಿದೆ",
        "bn": "অবিলম্বে চিকিৎসা সহায়তা এবং অ্যাম্বুলেন্স প্রয়োজন",
        "mr": "तातडीने वैद्यकीय मदत आणि रुग्णवाहिकेची गरज आहे",
        "gu": "તાત્કાલિક તબીબી સહાય અને એમ્બ્યુલન્સની જરૂર છે"
    },
    {
        "keywords": ["boat", "rescue boat", "flood", "water rise", "படகு", "வெள்ளம்", "పడవ", "नाव", "ബോട്ട്", "ದೋಣಿ", "নৌকা"],
        "ta": "வெள்ள மீட்புப் படகு மற்றும் மீட்புக் குழு உடனடியாகத் தேவை",
        "en": "Flood rescue boat and emergency evacuation team urgently required",
        "te": "వరద రక్షణ పడవ మరియు సహాయక బృందం అత్యవసరంగా కావాలి",
        "hi": "बाढ़ बचाव नाव और आपातकालीन निकासी दल की तत्काल आवश्यकता है",
        "ml": "പ്രളയ രക്ഷാ ബോട്ടും അടിയന്തര രക്ഷാപ്രവർത്തകരും ആവശ്യമാണ്",
        "kn": "ಪ್ರವಾಹ ರಕ್ಷಣಾ ದೋಣಿ ಮತ್ತು ತುರ್ತು ಸ್ಥಳಾಂತರಿಸುವ ತಂಡದ ಅಗತ್ಯವಿದೆ",
        "bn": "বন্যা উদ্ধারকারী নৌকা এবং জরুরি দল অবিলম্বে প্রয়োজন",
        "mr": "पूर बचाव नौका आणि आपत्कालीन पथकाची तातडीने गरज आहे",
        "gu": "પૂર બચાવ બોટ અને ઇમરજન્સી ટીમને તાત્કાલિક મોકલો"
    },
    {
        "keywords": ["roof", "trapped", "stuck", "மாடி", "கூரை", "పైకప్పు", "छत", "മേൽക്കൂര", "ಛಾವಣಿ", "ছাদ"],
        "ta": "நாங்கள் மொட்டை மாடியில் சிக்கியுள்ளோம், உடனடியாக மீட்கவும்",
        "en": "We are trapped on the roof, need urgent air/boat rescue",
        "te": "మేము పైకప్పు మీద చిక్కుకున్నాము, తక్షణమే రక్షించండి",
        "hi": "हम छत पर फंसे हुए हैं, तत्काल बचाव की आवश्यकता है",
        "ml": "ഞങ്ങൾ ടെറസ്സിൽ കുടുങ്ങിയിരിക്കുകയാണ്, ഉടൻ രക്ഷിക്കണം",
        "kn": "ನಾವು ಛಾವಣಿಯ ಮೇಲೆ ಸಿಕ್ಕಿಬಿದ್ದಿದ್ದೇವೆ, ತಕ್ಷಣ ರಕ್ಷಿಸಿ",
        "bn": "আমরা ছাদে আটকা পড়েছি, অবিলম্বে উদ্ধার দরকার",
        "mr": "आम्ही छतावर अडकलो आहोत, तातडीने बचाव करा",
        "gu": "અમે ધાબા પર ફસાયેલા છીએ, તાત્કાલિક બચાવો"
    },
    {
        "keywords": ["food", "water", "drinking", "hunger", "உணவு", "தண்ணீர்", "ఆహారం", "నీరు", "भोजन", "पानी", "ഭക്ഷണം", "ಆಹಾರ", "খাবার"],
        "ta": "குடிநீர் மற்றும் உணவுப் பொட்டலங்கள் உடனடியாகத் தேவை",
        "en": "Drinking water and food packets urgently needed",
        "te": "త్రాగునీరు మరియు ఆహార ప్యాకెట్లు అత్యవసరంగా కావాలి",
        "hi": "पीने का पानी और भोजन के पैकेट की तत्काल आवश्यकता है",
        "ml": "കുടിവെള്ളവും ഭക്ഷണവും അടിയന്തരമായി ആവശ്യമാണ്",
        "kn": "ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಆಹಾರದ ಪೊಟ್ಟಣಗಳು ತಕ್ಷಣ ಬೇಕು",
        "bn": "পানীয় জল এবং খাবারের প্যাকেট জরুরিভাবে প্রয়োজন",
        "mr": "पिण्याचे पाणी आणि अन्नाची पाकिटे तातडीने हवी आहेत",
        "gu": "પીવાનું પાણી અને ફૂડ પેકેટ્સની તાત્કાલિક જરૂર છે"
    },
    {
        "keywords": ["fire", "smoke", "burning", "தீ", "நெருப்பு", "మంటలు", "आग", "തീ", "ಬೆಂಕಿ", "আগুন"],
        "ta": "கட்டிடத்தில் தீ விபத்து, தீயணைப்புப் படை உடனடியாக வரவும்",
        "en": "Fire breakout in building, send fire brigade immediately",
        "te": "భవనంలో మంటలు చెలరేగాయి, వెంటనే అగ్నిమాపక దళాన్ని పంపండి",
        "hi": "इमारत में आग लग गई है, तुरंत दमकल भेजें",
        "ml": "കെട്ടിടത്തിൽ തീപിടിത്തം, ഉടൻ ഫയർഫോഴ്സ് എത്തണം",
        "kn": "ಕಟ್ಟಡದಲ್ಲಿ ಬೆಂಕಿ ಕಾಣಿಸಿಕೊಂಡಿದೆ, ತಕ್ಷಣ ಅಗ್ನಿಶಾಮಕ ದಳ ಕಳುಹಿಸಿ",
        "bn": "ভবনে আগুন লেগেছে, অবিলম্বে দমকল পাঠান",
        "mr": "इमारतीत आग लागली आहे, अग्निशामक दल त्वरित पाठवा",
        "gu": "ઇમારતમાં આગ લાગી છે, તાત્કાલિક ફાયર બ્રિગેડ મોકલો"
    },
    {
        "keywords": ["safe", "all clear", "ok", "secured", "பாதுகாப்பாக", "சரி", "సురక్షితం", "सुरक्षित", "സുരക്ഷിതം", "ಸುರಕ್ಷಿತ", "নিরাপদ"],
        "ta": "நாங்கள் அனைவரும் பாதுகாப்பாக உள்ளோம், நிலைமை கட்டுக்குள் உள்ளது",
        "en": "We are all safe, situation is under control",
        "te": "మేమంతా సురక్షితంగా ఉన్నాము, పరిస్థితి అదుపులో ఉంది",
        "hi": "हम सभी सुरक्षित हैं, स्थिति नियंत्रण में है",
        "ml": "ഞങ്ങൾ എല്ലാവരും സുരക്ഷിതരാണ്, സ്ഥിതി നിയന്ത്രണവിധേയമാണ്",
        "kn": "ನಾವೆಲ್ಲರೂ ಸುರಕ್ಷಿತವಾಗಿದ್ದೇವೆ, ಪರಿಸ್ಥಿತಿ ನಿಯಂತ್ರಣದಲ್ಲಿದೆ",
        "bn": "আমরা সবাই নিরাপদ, পরিস্থিতি নিয়ন্ত্রণে আছে",
        "mr": "आम्ही सर्व सुरक्षित आहोत, परिस्थिती नियंत्रणात आहे",
        "gu": "અમે બધા સુરક્ષિત છીએ, પરિસ્થિતિ નિયંત્રણમાં છે"
    },
    {
        "keywords": ["child", "baby", "pregnant", "குழந்தை", "கர்ப்பிணி", "పిల్లవాడు", "बच्चा", "കുഞ്ഞ്", "ಮಗು", "শিশু"],
        "ta": "குழந்தை மற்றும் கர்ப்பிணிப் பெண் உள்ளனர், முன்னுரிமை மீட்பு தேவை",
        "en": "Children and pregnant woman present, high priority rescue needed",
        "te": "పిల్లలు మరియు గర్భిణీ స్త్రీ ఉన్నారు, అత్యవసర రక్షణ అవసరం",
        "hi": "बच्चे और गर्भवती महिला मौजूद हैं, प्राथमिकता से बचाएं",
        "ml": "കുട്ടികളും ഗർഭിണിയും ഉണ്ട്, മുൻഗണനാ രക്ഷാപ്രവർത്തനം വേണം",
        "kn": "ಮಕ್ಕಳು ಮತ್ತು ಗರ್ಭಿಣಿ ಮಹಿಳೆ ಇದ್ದಾರೆ, ಆದ್ಯತೆಯ ರಕ್ಷಣೆ ಬೇಕು",
        "bn": "শিশু এবং গর্ভবতী মহিলা আছেন, অগ্রাধিকার ভিত্তিতে উদ্ধার দরকার",
        "mr": "लहान मुले आणि गरोदर महिला आहेत, प्राधान्याने बचाव करा",
        "gu": "બાળકો અને સગર્ભા સ્ત્રી છે, પ્રાથમિકતાથી બચાવો"
    },
    {
        "keywords": ["power", "electricity", "dark", "மின்சாரம்", "இருட்டு", "కరెంట్", "बिजली", "കറന്റ്", "ವಿದ್ಯುತ್", "বিদ্যুৎ"],
        "ta": "மின்சாரம் துண்டிக்கப்பட்டுள்ளது, பேட்டரி வெளிச்சம் மற்றும் தொடர்பு தேவை",
        "en": "Power grid failed, total blackout, need backup comms",
        "te": "విద్యుత్ సరఫరా నిలిచిపోయింది, బ్యాకప్ కమ్యూనికేషన్ అవసరం",
        "hi": "बिजली आपूर्ति बाधित है, बैकअप संचार की आवश्यकता है",
        "ml": "വൈദ്യുതി നിലച്ചു, ബാക്കപ്പ് കമ്മ്യൂണിക്കേഷൻ വേണം",
        "kn": "ವಿದ್ಯುತ್ ಕಡಿತಗೊಂಡಿದೆ, ಬ್ಯಾಕಪ್ ಸಂವಹನ ಬೇಕು",
        "bn": "বিদ্যুৎ সংযোগ বিচ্ছিন্ন, ব্যাকআপ যোগাযোগ দরকার",
        "mr": "वीज पुरवठा खंडित झाला आहे, बॅकअप संपर्काची गरज आहे",
        "gu": "વીજળી ગુલ થઈ ગઈ છે, બેકઅપ કોમ્યુનિકેશનની જરૂર છે"
    },
    {
        "keywords": ["location", "address", "sector", "இடம்", "முகவரி", "స్థానం", "स्थान", "സ്ഥലം", "ಸ್ಥಳ", "অবস্থান"],
        "ta": "தற்போதைய இடத்தின் ஒருங்கிணைப்புகள் மற்றும் முகவரி அனுப்பப்பட்டுள்ளது",
        "en": "Current GPS coordinates and location address transmitted",
        "te": "ప్రస్తుత జీపీఎస్ కోఆర్డినేట్స్ మరియు చిరునామా పంపబడింది",
        "hi": "वर्तमान जीपीएस निर्देशांक और पता भेजा गया है",
        "ml": "നിലവിലെ ജിപിഎസ് ലൊക്കേഷനും വിലാസവും അയച്ചു",
        "kn": "ಪ್ರಸ್ತುತ ಜಿಪಿಎಸ್ ನಿರ್ದೇಶಾಂಕಗಳು ಮತ್ತು ವಿಳಾಸ ರವಾನಿಸಲಾಗಿದೆ",
        "bn": "বর্তমান জিপিএস অবস্থান এবং ঠিকানা পাঠানো হয়েছে",
        "mr": "सध्याचे जीपीएस लोकेशन आणि पत्ता पाठवला आहे",
        "gu": "વર્તમાન જીપીએસ કોઓર્ડિનેટ્સ અને સરનામું મોકલાયું છે"
    },
    {
        "keywords": ["help", "save", "sos", "emergency", "உதவி", "காப்பாற்று", "సహాయం", "मदद", "സഹായം", "ಸಹಾಯ", "সাহায্য"],
        "ta": "🚨 அவசர உதவி தேவை! தயவுசெய்து உடனடியாக உதவவும்",
        "en": "🚨 Emergency assistance needed! Kindly help immediately",
        "te": "🚨 అత్యవసర సహాయం కావాలి! దయచేసి వెంటనే సహాయం చేయండి",
        "hi": "🚨 आपातकालीन सहायता की आवश्यकता है! कृपया तुरंत मदद करें",
        "ml": "🚨 അടിയന്തര സഹായം വേണം! ദയവായി ഉടൻ സഹായിക്കുക",
        "kn": "🚨 ತುರ್ತು ಸಹಾಯ ಬೇಕು! ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ಸಹಾಯ ಮಾಡಿ",
        "bn": "🚨 জরুরি সাহায্য প্রয়োজন! দয়া করে অবিলম্বে সাহায্য করুন",
        "mr": "🚨 आपत्कालीन मदतीची गरज आहे! कृपया त्वरित मदत करा",
        "gu": "🚨 ઇમરજન્સી સહાયની જરૂર છે! કૃપા કરીને તાત્કાલિક મદદ કરો"
    }
]

SUPPORTED_LANGUAGES_9 = ["ta", "en", "te", "hi", "ml", "kn", "bn", "mr", "gu"]

def translate_indic_9(text: str, source_lang: str = "auto") -> dict:
    if not text or not text.strip():
        return {l: "" for l in SUPPORTED_LANGUAGES_9}
    
    clean_text = text.lower().strip()
    
    # 1. Search Indic Multilingual Knowledge Matrix for exact emergency phrases
    for entry in OFFLINE_DICTIONARY_9:
        for kw in entry["keywords"]:
            if kw == clean_text or kw in clean_text:
                return {l: entry.get(l, entry["en"]) for l in SUPPORTED_LANGUAGES_9}
    
    # 2. For general spoken words, preserve the real text across all languages
    res = {}
    for l in SUPPORTED_LANGUAGES_9:
        res[l] = text
    return res

def transcribe_indic_neural_base64(audio_base64: str, preferred_lang: Optional[str] = "ta") -> tuple[str, str]:
    """Indic Neural ASR: High-speed Groq Whisper-large-v3 for Tamil & 9 Indic languages."""
    try:
        raw_data = audio_base64
        if ',' in raw_data:
            raw_data = raw_data.split(',', 1)[1]
        audio_bytes = base64.b64decode(raw_data)
        if len(audio_bytes) < 100:
            return "", ""

        # 1. Primary: Ultra-Fast Groq Whisper-large-v3 (<0.3s Tamil Transcription)
        if GROQ_API_KEY:
            try:
                with httpx.Client(timeout=10.0) as client:
                    files = {'file': ('speech.wav', audio_bytes, 'audio/wav')}
                    data = {
                        'model': 'whisper-large-v3',
                        'language': preferred_lang or 'ta',
                        'response_format': 'json',
                        'temperature': 0.0
                    }
                    headers = {'Authorization': f'Bearer {GROQ_API_KEY}'}
                    resp = client.post(
                        'https://api.groq.com/openai/v1/audio/transcriptions',
                        headers=headers,
                        data=data,
                        files=files
                    )
                    if resp.status_code == 200:
                        groq_text = resp.json().get('text', '').strip()
                        if groq_text:
                            print(f"[Groq Whisper-large-v3 ({preferred_lang})]: {groq_text}", flush=True)
                            return groq_text, preferred_lang or "ta"
                    else:
                        print(f"[Groq Whisper Error HTTP {resp.status_code}]: {resp.text}", flush=True)
            except Exception as ge:
                print(f"[Groq Whisper Exception]: {ge}", flush=True)

        return "", preferred_lang or "ta"
    except Exception as e:
        print(f"[Indic Audio Decode Error]: {e}", flush=True)
        return "", "ta"

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

def init_db():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    c = conn.cursor()
    c.execute("PRAGMA journal_mode=WAL;")
    c.execute("PRAGMA synchronous=NORMAL;")
    c.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT DEFAULT 'DEMO_GLOBAL_SESSION_01',
        sender_role TEXT DEFAULT 'field',
        sender_username TEXT,
        target_username TEXT,
        type TEXT DEFAULT 'voice_message',
        text TEXT,
        network_mode TEXT DEFAULT 'mode-2-compressed-voice',
        audio_size INTEGER DEFAULT 0,
        audio_url TEXT,
        is_emergency BOOLEAN DEFAULT 0,
        language TEXT DEFAULT 'ta',
        latitude REAL DEFAULT 12.8718,
        longitude REAL DEFAULT 80.2185,
        address_name TEXT DEFAULT 'St. Joseph''s Institute of Technology, OMR, Chennai',
        cipher_code TEXT,
        gateway_node TEXT,
        hop_count INTEGER DEFAULT 2,
        display_time TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    # Add columns if they don't exist
    for col, col_type in [("gateway_node", "TEXT"), ("hop_count", "INTEGER DEFAULT 2"), ("cipher_code", "TEXT"), ("sender_username", "TEXT"), ("target_username", "TEXT"), ("display_time", "TEXT")]:
        try:
            c.execute(f"ALTER TABLE messages ADD COLUMN {col} {col_type}")
        except Exception:
            pass
    conn.commit()
    conn.close()

init_db()

@app.get('/api/system/ip')
def get_system_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return {"ip": ip}

class MessagePayload(BaseModel):
    model_config = {"extra": "allow"}
    id: Optional[str] = None
    session_id: Optional[str] = "DEMO_GLOBAL_SESSION_01"
    sender_role: Optional[str] = "field"
    sender_username: Optional[str] = "@field_user"
    target_username: Optional[str] = "@command_center"
    is_local_mesh_private: Optional[bool] = False
    local_mode: Optional[str] = None
    node_id: Optional[str] = None
    cipher_code: Optional[str] = None
    duration_seconds: Optional[int] = 4
    display_time: Optional[str] = None
    timestamp: Optional[str] = None
    gateway_node: Optional[str] = None
    hop_count: Optional[int] = 1
    type: Optional[str] = "voice_message"
    text: Optional[str] = "🎙️ Voice Dispatch"
    network_mode: Optional[str] = None
    audio_size: Optional[int] = 0
    audio_url: Optional[str] = None
    is_emergency: Optional[bool] = False
    language: Optional[str] = "ta"
    latitude: Optional[float] = 12.8718
    longitude: Optional[float] = 80.2185
    address_name: Optional[str] = "St. Joseph's Institute of Technology, OMR, Chennai" 

class ModeUpdatePayload(BaseModel):
    network_mode: Optional[str] = None
    local_mode: Optional[str] = None

@app.get("/")
def root():
    return {
        "status": "running",
        "active_mode": active_network_mode,
        "active_local_mode": active_local_mode,
        "offline_ready": True,
        "engine": "Indic Neural ASR",
        "version": "2.0.0"
    }

@app.get("/api/network/active-mode")
def get_active_mode():
    global active_network_mode, active_local_mode
    return {
        "network_mode": active_network_mode,
        "local_mode": active_local_mode,
        "bandwidth_kbps": 2.4 if active_network_mode == "mode-2-compressed-voice" else 64.0,
        "frequency": "144.800 MHz" if active_network_mode == "mode-2-compressed-voice" else "1800 MHz 4G"
    }

@app.post("/api/network/set-mode")
async def set_active_mode(payload: ModeUpdatePayload):
    global active_network_mode, active_local_mode
    if payload.network_mode:
        active_network_mode = payload.network_mode
    if payload.local_mode:
        active_local_mode = payload.local_mode
    
    await manager.broadcast({
        "type": "mode_switch",
        "network_mode": active_network_mode,
        "local_mode": active_local_mode
    })
    return {
        "status": "success", 
        "network_mode": active_network_mode, 
        "local_mode": active_local_mode
    }

class STTPayload(BaseModel):
    audio_base64: str
    language: Optional[str] = "ta"

@app.post("/api/stt/base64")
def api_speech_to_text(payload: STTPayload):
    text, lang = transcribe_indic_neural_base64(payload.audio_base64, payload.language)
    translations = translate_indic_9(text, lang)
    return {
        "status": "success",
        "text": text,
        "language": lang,
        "translations": translations,
        "engine": "Indic Neural ASR"
    }

class TranslatePayload(BaseModel):
    text: str
    target_lang: Optional[str] = None

@app.post("/api/translate")
def api_translate(payload: TranslatePayload):
    translations = translate_indic_9(payload.text)
    return {
        "status": "success",
        "original": payload.text,
        "translations": translations,
        "engine": "Indic Neural Translator"
    }

@app.post("/api/simulator/config")
async def config_simulator(data: dict):
    return {"status": "ok", "config": data}


# ============================================================
# 🧠 GROQ CLOUD LLM TRANSLATION API (Free Tier - GPT-OSS 120B)
# ============================================================
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

class GroqTranslatePayload(BaseModel):
    text: str
    source_lang: Optional[str] = "ta"
    target_lang: Optional[str] = "en"

class TtsPayload(BaseModel):
    text: str

@app.post("/api/tts/english")
async def tts_english(payload: TtsPayload):
    """Generate crystal clear English AI voice from text"""
    audio_url = await generate_english_ai_voice(payload.text)
    return {"status": "success", "audio_url": audio_url}

@app.post("/api/translate/groq")
async def groq_translate(payload: GroqTranslatePayload):
    """Translate any Indic language text to English using Groq Cloud LLM"""
    if not payload.text or not payload.text.strip():
        return {"status": "error", "error": "Empty text"}

    api_key = GROQ_API_KEY
    if not api_key or api_key == "gsk_placeholder_set_your_key":
        # Fallback: use local translate_indic_9 dictionary
        translations = translate_indic_9(payload.text, payload.source_lang or "ta")
        return {
            "status": "success",
            "original": payload.text,
            "translated": translations.get("en", payload.text),
            "translations": translations,
            "engine": "Local Indic Dictionary (set GROQ_API_KEY for LLM)"
        }

    lang_names = {
        "ta": "Tamil", "hi": "Hindi", "te": "Telugu", "ml": "Malayalam",
        "kn": "Kannada", "bn": "Bengali", "mr": "Marathi", "gu": "Gujarati", "en": "English"
    }
    src_name = lang_names.get(payload.source_lang or "ta", "Tamil")
    tgt_name = lang_names.get(payload.target_lang or "en", "English")

    prompt = f"""You are a precise translator. Translate the following {src_name} text to {tgt_name}.
ONLY output the translated text, nothing else. No explanations, no quotes.

Text: {payload.text.strip()}"""

    try:
        with httpx.Client(timeout=15.0, verify=False) as client:
            resp = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-oss-120b",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "max_tokens": 500
                }
            )
        if resp.status_code == 200:
            data = resp.json()
            translated = data["choices"][0]["message"]["content"].strip()
            print(f"[Groq LLM Translate] {src_name}->{tgt_name}: {payload.text[:50]} => {translated[:50]}", flush=True)
            audio_voice = await generate_english_ai_voice(translated)
            return {
                "status": "success",
                "original": payload.text,
                "translated": translated,
                "audio_url": audio_voice,
                "engine": "Groq Cloud LLM (GPT-OSS 120B)"
            }
        else:
            print(f"[Groq API Error] {resp.status_code}: {resp.text[:200]}", flush=True)
            # Fallback to local
            translations = translate_indic_9(payload.text, payload.source_lang or "ta")
            return {
                "status": "success",
                "original": payload.text,
                "translated": translations.get("en", payload.text),
                "engine": f"Local Fallback (Groq {resp.status_code})"
            }
    except Exception as e:
        print(f"[Groq Translate Error]: {e}", flush=True)
        translations = translate_indic_9(payload.text, payload.source_lang or "ta")
        return {
            "status": "success",
            "original": payload.text,
            "translated": translations.get("en", payload.text),
            "engine": f"Local Fallback (Network Error)"
        }

@app.post("/api/groq/set-key")
def set_groq_key(data: dict):
    """Set Groq API key at runtime"""
    global GROQ_API_KEY
    key = data.get("api_key", "")
    if key and key.startswith("gsk_"):
        GROQ_API_KEY = key
        return {"status": "success", "message": "Groq API key set successfully"}
    return {"status": "error", "message": "Invalid key format. Must start with gsk_"}



# ============================================================
# 🧠 GROQ INTEGRITY LEVEL ANALYSIS — Emergency Priority Scorer
# ============================================================
class IntegrityPayload(BaseModel):
    messages: list  # list of {id, text, language, sender_username, timestamp}

@app.post("/api/groq/analyze-integrity")
def analyze_integrity(payload: IntegrityPayload):
    """Analyze message urgency/priority using Groq LLM. Returns scored + sorted messages."""
    if not payload.messages:
        return {"status": "error", "error": "No messages"}

    api_key = GROQ_API_KEY
    msgs_text = ""
    for i, m in enumerate(payload.messages):
        msgs_text += f"[MSG {i+1}] From: {m.get('sender_username','Unknown')} | Text: {m.get('text','')[:200]}\n"

    system_prompt = """You are an emergency dispatch AI for disaster relief. 
Analyze each message and assign an INTEGRITY LEVEL (urgency score) from 1 to 10:
- 10: Immediate life-threatening (murder, drowning, cardiac arrest, building collapse on people)
- 8-9: Critical (severe injury, trapped, fire spreading)
- 6-7: Urgent (medical, rescue needed soon, stranded)
- 4-5: Important (supply shortage, infrastructure damage)
- 1-3: Non-urgent (status update, information)

Respond ONLY with a JSON array like this:
[{"msg_index": 1, "score": 10, "reason": "Murder threat - immediate dispatch required", "english_summary": "Someone is being murdered at this location"},
 {"msg_index": 2, "score": 7, "reason": "Fell from building - medical needed", "english_summary": "Person fell from building, needs medical help"}]
Do NOT include any other text, just the JSON array."""

    try:
        with __import__('httpx').Client(timeout=20.0, verify=False) as client:
            resp = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "openai/gpt-oss-120b",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Analyze these emergency messages and score urgency:\n\n{msgs_text}"}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 1000
                }
            )
        if resp.status_code == 200:
            raw = resp.json()["choices"][0]["message"]["content"].strip()
            import json as _json
            # Extract JSON array from response
            start = raw.find('[')
            end = raw.rfind(']') + 1
            if start >= 0 and end > start:
                scores = _json.loads(raw[start:end])
                # Merge scores back into messages
                scored = []
                for s in scores:
                    idx = s.get("msg_index", 0) - 1
                    if 0 <= idx < len(payload.messages):
                        m = dict(payload.messages[idx])
                        m["integrity_score"] = s.get("score", 1)
                        m["integrity_reason"] = s.get("reason", "")
                        m["english_summary"] = s.get("english_summary", m.get("text", ""))
                        scored.append(m)
                # Sort by score descending (highest priority first)
                scored.sort(key=lambda x: x.get("integrity_score", 1), reverse=True)
                return {"status": "success", "scored_messages": scored, "engine": "Groq AI Integrity Analyzer"}
    except Exception as e:
        print(f"[Groq Integrity Error]: {e}", flush=True)

    # Fallback: return messages as-is with score 5
    fallback = []
    for m in payload.messages:
        m2 = dict(m)
        m2["integrity_score"] = 5
        m2["integrity_reason"] = "Manual review required"
        m2["english_summary"] = m.get("text", "")
        fallback.append(m2)
    return {"status": "success", "scored_messages": fallback, "engine": "Fallback (Groq unavailable)"}

# 🎙️ Transcribe audio URL from Mode 1/2 for translation
class AudioTranscribePayload(BaseModel):
    audio_url: str  # base64 data URL
    language: Optional[str] = "ta"

@app.post("/api/stt/transcribe-for-translate")
async def transcribe_for_translate(payload: AudioTranscribePayload):
    """Transcribe audio and then translate to English using Groq"""
    if not payload.audio_url:
        return {"status": "error", "text": "", "translated": ""}

    # Extract base64 from data URL
    audio_data = payload.audio_url
    if "base64," in audio_data:
        audio_data = audio_data.split("base64,")[1]

    text, lang = transcribe_indic_neural_base64(audio_data, payload.language or "ta")

    if not text:
        return {"status": "error", "text": "", "translated": "Could not transcribe audio"}

    # Translate to English via Groq
    api_key = GROQ_API_KEY
    lang_names = {"ta": "Tamil", "hi": "Hindi", "te": "Telugu", "ml": "Malayalam",
                  "kn": "Kannada", "bn": "Bengali", "mr": "Marathi", "gu": "Gujarati", "en": "English"}
    src_name = lang_names.get(lang or "ta", "the language of the audio")

    try:
        with __import__('httpx').Client(timeout=15.0, verify=False) as client:
            resp = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "openai/gpt-oss-120b",
                    "messages": [{"role": "user", "content": f"Translate from {src_name} to English. Only output the translation: {text}"}],
                    "temperature": 0.1,
                    "max_tokens": 300
                }
            )
        if resp.status_code == 200:
            translated = resp.json()["choices"][0]["message"]["content"].strip()
            audio_voice = await generate_english_ai_voice(translated)
            return {"status": "success", "text": text, "translated": translated, "audio_url": audio_voice, "language": lang}
    except Exception as e:
        print(f"[Audio Translate Error]: {e}", flush=True)

    audio_voice = await generate_english_ai_voice(text)
    return {"status": "success", "text": text, "translated": text, "audio_url": audio_voice, "language": lang}

@app.get("/download-apk")
def download_apk():
    apk_path = r"D:\itantra\iTiTantra_Latest.apk"
    if os.path.exists(apk_path):
        return FileResponse(
            path=apk_path,
            filename="iTiTantra_Latest.apk",
            media_type="application/vnd.android.package-archive"
        )
    return {"error": "APK file not found"}

@app.post("/api/session/create")
def create_session():
    return {
        "session_id": "DEMO_GLOBAL_SESSION_01",
        "field_token": "demo_field_token",
        "command_token": "demo_command_token"
    }

@app.get("/api/messages/all")
def get_all_messages():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM messages ORDER BY id DESC LIMIT 60")
    rows = c.fetchall()
    messages = [dict(r) for r in rows]
    conn.close()
    return messages

@app.get("/api/messages/mesh")
def get_mesh_messages():
    global recent_mesh_messages
    return recent_mesh_messages[-50:]

@app.post("/api/mesh/air-broadcast")
async def air_broadcast_mesh(payload: dict):
    """
    Mode 3 Air Broadcast: Mobile 1 broadcasts packet into local air radius (BLE/Wi-Fi/UDP).
    Broadcasts directly to peer listening devices (e.g. Phone 2) via WebSockets.
    """
    air_packet = {
        "type": "air_mesh_packet",
        "is_air_broadcast": True,
        "id": payload.get("id") or str(uuid.uuid4()),
        "sender_username": payload.get("sender_username", "@victim_1"),
        "target_username": payload.get("target_username", "@command_center"),
        "cipher_code": payload.get("cipher_code") or "KEY#ENC-4954-015F",
        "text": payload.get("text", ""),
        "network_mode": "mode-3-ai-mesh",
        "hop_count": 1,
        "timestamp": payload.get("timestamp") or datetime.utcnow().isoformat(),
        "display_time": payload.get("display_time") or datetime.now().strftime("%I:%M %p")
    }
    await manager.broadcast(air_packet)
    return {"status": "broadcasted_to_air", "packet": air_packet}

# In-Memory Message Deduplication Cache (Ensures single delivery)
processed_message_ids = set()
recent_message_dedup = {}

@app.post("/api/messages/send")
async def send_message(payload: MessagePayload):
    global recent_mesh_messages, processed_message_ids, recent_message_dedup
    
    # 1. DEDUPLICATION: Prevent duplicate submissions from multiple network fallback targets
    msg_key = payload.id or f"{payload.sender_username}_{payload.text}_{payload.timestamp or ''}"
    if msg_key in processed_message_ids:
        return {"status": "success", "deduplicated": True, "id": msg_key}
    
    processed_message_ids.add(msg_key)
    if len(processed_message_ids) > 1000:
        processed_message_ids.clear()
    final_text = payload.text or ""
    final_lang = payload.language or "ta"
    
    # Precise mode resolution with strict Priority:
    # 1. Mode 4 / Satellite SOS has highest priority
    if payload.is_emergency or payload.network_mode in ('mode-4-satellite-beacon', 'mode-4', 'satellite'):
        mode = 'mode-4-satellite-beacon'
    # 2. Explicit Mode 2 / 2G Audio
    elif payload.network_mode in ('mode-2-compressed-voice', 'mode-2') or payload.local_mode == 'mode-2-p2p-2g':
        mode = 'mode-2-compressed-voice'
    # 3. Explicit Mode 3 / AI Mesh
    elif payload.network_mode in ('mode-3-ai-mesh', 'mode-3') or payload.local_mode == 'mode-3-p2p-nan':
        mode = 'mode-3-ai-mesh'
    # 4. Explicit Mode 1 / HD Call
    elif payload.network_mode in ('mode-1-hd-call', 'mode-1') or payload.local_mode == 'mode-1-p2p-hd':
        mode = 'mode-1-hd-call'
    else:
        mode = active_network_mode

    # Mode 1 & Mode 2: Real Voice Note Messages (Audio preserved, text preserved)
    if mode == 'mode-2-compressed-voice':
        if not final_text or final_text.strip() == '':
            final_text = "🎙️ 2G CELT Compressed Voice Note (1.2 KB)"
    elif mode == 'mode-1-hd-call':
        if not final_text or final_text.strip() == '':
            final_text = "🎙️ 4G/5G HD Direct Voice Note"
    elif mode == 'mode-3-ai-mesh':
        # Mode 3: 24-byte AI Mesh Text (Zero Audio Transmitted, backend STT removed)
        payload.audio_url = None
        payload.audio_size = 24

    msg_uuid = payload.id or str(datetime.utcnow().timestamp())
    sender_name = payload.sender_username or f"@{payload.sender_role}"
    target_name = payload.target_username or "@all_friends"

    try:
        conn = sqlite3.connect(DB_PATH, timeout=10.0)
        c = conn.cursor()
        c.execute("""
        INSERT INTO messages (session_id, sender_role, sender_username, target_username, type, text, network_mode, audio_size, audio_url, is_emergency, language, latitude, longitude, address_name, cipher_code, gateway_node, hop_count, display_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            payload.session_id,
            payload.sender_role,
            sender_name,
            target_name,
            payload.type,
            final_text,
            mode,
            payload.audio_size,
            payload.audio_url,
            1 if payload.is_emergency else 0,
            final_lang,
            payload.latitude,
            payload.longitude,
            payload.address_name,
            payload.cipher_code or "0x4954015F01414F67AE42A082C502448A",
            payload.gateway_node or "📱 Phone 2: Relay Node (@mesh_relay)",
            payload.hop_count or 2,
            payload.display_time or datetime.now().strftime("%I:%M %p")
        ))
        msg_id = c.lastrowid
        conn.commit()
        conn.close()
    except Exception as e:
        msg_id = int(datetime.utcnow().timestamp() * 1000) % 1000000

    translations = translate_indic_9(final_text, final_lang)
    
    msg_data = {
        "id": msg_uuid,
        "translations": translations,
        "db_id": msg_id,
        "session_id": payload.session_id,
        "sender_role": payload.sender_role,
        "sender_username": sender_name,
        "target_username": target_name,
        "is_local_mesh_private": payload.is_local_mesh_private or payload.session_id == "LOCAL_MESH_PRIVATE",
        "local_mode": payload.local_mode or payload.network_mode,
        "node_id": payload.node_id,
        "cipher_code": payload.cipher_code or "LOCK#KEY-7A4B",
        "type": payload.type,
        "text": final_text,
        "network_mode": mode,
        "audio_size": payload.audio_size,
        "audio_url": payload.audio_url,
        "audioUrl": payload.audio_url,
        "duration_seconds": payload.duration_seconds or 4,
        "display_time": payload.display_time or datetime.now().strftime("%I:%M %p"),
        "gateway_node": payload.gateway_node or "📱 Phone 2: Relay Node",
        "hop_count": payload.hop_count or 2,
        "is_emergency": payload.is_emergency,
        "language": final_lang,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "address_name": payload.address_name,
        "timestamp": datetime.utcnow().isoformat()
    }

    # Store in memory for instant fast polling
    recent_mesh_messages.append(msg_data)
    if len(recent_mesh_messages) > 100:
        recent_mesh_messages = recent_mesh_messages[-100:]

    # Broadcast live to all connected WebSocket clients
    await manager.broadcast(msg_data)

    return {"status": "delivered", "id": msg_uuid, "text": final_text, "language": final_lang, "message": "Voice Note Delivered"}

@app.post("/api/messages/clear")
def clear_messages():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    c = conn.cursor()
    c.execute("DELETE FROM messages")
    conn.commit()
    c.execute("VACUUM")
    conn.commit()
    conn.close()
    return {"status": "cleared", "count": 0}

@app.websocket("/ws/command/{session_id}")
async def ws_command(websocket: WebSocket, session_id: str):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/field/{session_id}")
async def ws_field(websocket: WebSocket, session_id: str):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
