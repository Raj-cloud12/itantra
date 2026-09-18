import io
import base64

ai_voice_cache = {}

async def generate_ai_voice(text: str, lang: str = "auto") -> str:
    """Generate high-fidelity Azure Neural AI voice (ta-IN-ValluvarNeural for Tamil, en-US-AriaNeural for English) with instant in-memory caching"""
    if not text or not text.strip():
        return ""
    clean_text = text.strip()
    cache_key = f"{clean_text}_{lang}"
    if cache_key in ai_voice_cache:
        return ai_voice_cache[cache_key]

    is_tamil = any('\u0b80' <= c <= '\u0bff' for c in clean_text) or lang.startswith("ta")
    voice_name = "ta-IN-ValluvarNeural" if is_tamil else "en-US-AriaNeural"
    fallback_lang = "ta" if is_tamil else "en"

    # Try edge-tts first (high fidelity Azure Neural voice)
    try:
        import edge_tts
        comm = edge_tts.Communicate(clean_text, voice_name)
        buf = io.BytesIO()
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        audio_bytes = buf.getvalue()
        if audio_bytes:
            data_url = "data:audio/mp3;base64," + base64.b64encode(audio_bytes).decode("utf-8")
            if len(ai_voice_cache) > 250:
                ai_voice_cache.clear()
            ai_voice_cache[cache_key] = data_url
            return data_url
    except Exception as e:
        print(f"[edge-tts error ({voice_name})]: {e}", flush=True)

    # Fallback to gTTS
    try:
        from gtts import gTTS
        tts = gTTS(text=clean_text, lang=fallback_lang, slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        audio_bytes = buf.getvalue()
        if audio_bytes:
            data_url = "data:audio/mp3;base64," + base64.b64encode(audio_bytes).decode("utf-8")
            if len(ai_voice_cache) > 250:
                ai_voice_cache.clear()
            ai_voice_cache[cache_key] = data_url
            return data_url
    except Exception as e2:
        print(f"[gTTS error]: {e2}", flush=True)

    return ""

async def generate_english_ai_voice(text: str) -> str:
    return await generate_ai_voice(text, "en")

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
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
import time
import httpx

import sys
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except:
    pass
# Dynamic database path that works on local Windows, Linux, Docker, and Render
DB_PATH = os.environ.get("DB_PATH", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ititantra.db")))

app = FastAPI(title="iTiTantra Tactical Offline Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recent_mesh_messages: List[Dict[str, Any]] = []
recent_p2p_messages: List[Dict[str, Any]] = []

# Active Network Mode State
active_network_mode = "mode-3-ai-mesh"
active_local_mode = "mode-2-p2p-2g"

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

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")

def convert_tamil_to_tanglish(tamil_text: str) -> str:
    """Convert Tamil Unicode script into natural phonetic Tanglish using Groq LLM."""
    if not tamil_text or not GROQ_API_KEY:
        return tamil_text
    try:
        with httpx.Client(timeout=8.0, verify=False) as client:
            resp = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "openai/gpt-oss-120b",
                    "messages": [
                        {"role": "system", "content": "You are a Tamil-to-Tanglish transliterator. Convert Tamil text into natural phonetic Tanglish (Tamil spoken words written in English letters). Example: 'எப்படி இருக்கீங்க' -> 'Epdi irukinga'. 'காப்பாத்துங்க தண்ணி வேணும்' -> 'Kaappaththunga thanni venum'. 'உன் பெயர் என்ன' -> 'Un peyar enna'. ONLY return the Tanglish words without quotes, explanation, or punctuation."},
                        {"role": "user", "content": tamil_text}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 150
                }
            )
            if resp.status_code == 200:
                tanglish = resp.json()["choices"][0]["message"]["content"].strip()
                if tanglish:
                    print(f"[Tanglish Converted]: '{tamil_text}' -> '{tanglish}'", flush=True)
                    return tanglish
    except Exception as e:
        print(f"[Tanglish Conversion Error]: {e}", flush=True)
    return tamil_text

def transcribe_indic_neural_base64(audio_base64: str, preferred_lang: Optional[str] = "ta") -> tuple[str, str]:
    """Indic Neural ASR: High-speed Groq Whisper-large-v3 for Tamil, Malayalam, Hindi, Telugu, Kannada, Marathi, Bengali, Gujarati, English & Tanglish."""
    try:
        raw_data = audio_base64
        if ',' in raw_data:
            raw_data = raw_data.split(',', 1)[1]
        audio_bytes = base64.b64decode(raw_data)
        if len(audio_bytes) < 100:
            return "", ""

        # Map preferred language:
        # ta-en (Tanglish) -> transcribe with 'ta' (Tamil acoustic model), then transliterate to Tanglish
        is_tanglish = (preferred_lang == 'ta-en')
        whisper_lang = 'ta' if is_tanglish else (preferred_lang if preferred_lang and preferred_lang != 'auto' else None)

        # 100% Local Offline CPU Whisper (Zero Internet required)
        try:
            from faster_whisper import WhisperModel
            global _local_whisper_model
            if '_local_whisper_model' not in globals() or _local_whisper_model is None:
                print("[Local Offline Whisper] Initializing CPU model (Systran/faster-whisper-tiny)...", flush=True)
                _local_whisper_model = WhisperModel('tiny', device='cpu', compute_type='int8', local_files_only=True)
                print("[Local Offline Whisper] Model loaded successfully!", flush=True)
            if _local_whisper_model:
                import io
                audio_file = io.BytesIO(audio_bytes)
                segments, info = _local_whisper_model.transcribe(
                    audio_file,
                    language=whisper_lang or "ta",
                    beam_size=1,
                    initial_prompt="வணக்கம் உதவி காப்பாற்றுங்கள் நாங்கள் மாட்டிக்கொண்டோம் வெள்ளம் உணவு தேவை"
                )
                local_text = " ".join([seg.text for seg in segments]).strip()
                if local_text:
                    if is_tanglish:
                        local_text = convert_tamil_to_tanglish(local_text)
                    print(f"[Local Offline Whisper ({info.language})]: {local_text}", flush=True)
                    return local_text, info.language or whisper_lang or "ta"
        except Exception as le:
            print(f"[Local Offline Whisper Exception]: {le}", flush=True)



        return "", preferred_lang or "ta"
    except Exception as e:
        print(f"[Indic Audio Decode Error]: {e}", flush=True)
        return "", "ta"


def voice_ocr_refine_and_translate(raw_text: str, source_lang: str = "ta") -> tuple[str, str]:
    """
    Voice OCR Linguistic Post-Processor & Precision Translator:
    Functions identically to OCR dictionary spell-checking and semantic alignment for audio.
    1. Fixes phonetic slurs, mistranscriptions, and colloquial Tamil speech errors.
    2. Restores proper Tamil syntax and vocabulary while preserving the user's authentic emergency intent.
    3. Produces high-accuracy English translation for command center dispatchers.
    """
    if not raw_text or not raw_text.strip():
        return "", ""
    if not GROQ_API_KEY:
        return raw_text, raw_text

    clean = raw_text.strip()
    if clean.lower() in ["வணக்கம்", "வணக்கம் வணக்கம் வணக்கம்", "hello", "hi"]:
        return clean, "Hello! Greetings." if "வணக்கம்" in clean else "வணக்கம்"

    models_to_try = ["groq/compound-mini", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]
    for m in models_to_try:
        try:
            with httpx.Client(timeout=8.0, verify=False) as client:
                resp = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": m,
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "You are an expert Voice-to-Text OCR Post-Processor and Disaster Translation Engine for Tamil speech.\n"
                                    "The user spoke Tamil into a phone microphone. The raw transcript may have phonetic mistranscriptions or colloquial spoken phrasing (e.g., நாங்க -> நாங்கள், மாட்டிகிட்டோம் -> மாட்டிக்கொண்டோம், தண்ணி -> தண்ணீர், காப்பாத்துங்க -> காப்பாற்றுங்கள்).\n"
                                    "Tasks:\n"
                                    "1. Clean up any phonetically mistranscribed words, restore proper Tamil spelling while keeping the natural spoken flow.\n"
                                    "2. Translate accurately and naturally into English.\n"
                                    "Output format MUST be strictly:\n"
                                    "TAMIL: <refined Tamil text>\n"
                                    "ENGLISH: <accurate English translation>"
                                )
                            },
                            {
                                "role": "user",
                                "content": clean
                            }
                        ],
                        "temperature": 0.1,
                        "max_tokens": 500
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                    refined_ta = ""
                    refined_en = ""
                    for line in content.splitlines():
                        line = line.strip()
                        if line.upper().startswith("TAMIL:"):
                            refined_ta = line[6:].strip().strip('"').strip("'")
                        elif line.upper().startswith("ENGLISH:"):
                            refined_en = line[8:].strip().strip('"').strip("'")
                    if refined_ta and refined_en:
                        print(f"[Voice OCR Success] Raw: '{clean}' => TA: '{refined_ta}' | EN: '{refined_en}'", flush=True)
                        return refined_ta, refined_en
                    elif refined_en and not refined_ta:
                        return clean, refined_en
                    elif refined_ta:
                        return refined_ta, clean
        except Exception as e:
            print(f"[Voice OCR Error with {m}]: {e}", flush=True)

    return clean, clean




class ConnectionManager:
    def __init__(self):
        # Map websocket -> dict(role=..., username=...)
        self.active_connections: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, role: str = "field", username: Optional[str] = None):
        await websocket.accept()
        norm_u = username.lower().strip() if username else None
        self.active_connections[websocket] = {"role": role, "username": norm_u}

    def update_user(self, websocket: WebSocket, username: str):
        if websocket in self.active_connections:
            self.active_connections[websocket]["username"] = username.lower().strip()

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]

    async def broadcast(self, message: dict):
        is_private = (
            message.get("is_local_mesh_private") or 
            message.get("session_id") == "LOCAL_MESH_PRIVATE" or
            (message.get("target_username") and message.get("target_username") != "@command_center" and not message.get("is_emergency") and message.get("sender_role") != "command")
        )
        target_u = (message.get("target_username") or "").lower().strip()
        sender_u = (message.get("sender_username") or "").lower().strip()

        for connection, meta in list(self.active_connections.items()):
            conn_role = meta.get("role", "field")
            conn_user = meta.get("username")

            # 🛑 USER HARD REQUIREMENT: Control Center must NEVER receive Local Mesh messages!
            if is_private and conn_role == "command":
                continue

            # 🛑 USER HARD REQUIREMENT: Only the target user and sender can receive/open!
            if is_private and conn_user and target_u and sender_u:
                if conn_user != target_u and conn_user != sender_u:
                    continue

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
        address_name TEXT,
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
    id: Optional[Union[str, int]] = None
    session_id: Optional[str] = "DEMO_GLOBAL_SESSION_01"
    sender_role: Optional[str] = "field"
    sender_username: Optional[str] = "@field_user"
    target_username: Optional[str] = "@command_center"
    channel_type: Optional[str] = "EMERGENCY_ALERT"
    is_local_mesh_private: Optional[bool] = False
    local_mode: Optional[str] = None
    node_id: Optional[str] = None
    cipher_code: Optional[str] = None
    duration_seconds: Optional[Union[int, float]] = 4
    display_time: Optional[str] = None
    timestamp: Optional[Union[str, int, float]] = None
    gateway_node: Optional[str] = None
    hop_count: Optional[int] = 1
    type: Optional[str] = "voice_message"
    text: Optional[str] = "🎙️ Voice Dispatch"
    network_mode: Optional[str] = None
    audio_size: Optional[int] = 0
    audio_url: Optional[str] = None
    is_emergency: Optional[Union[bool, int]] = False
    language: Optional[str] = "ta"
    latitude: Optional[float] = 12.8718
    longitude: Optional[float] = 80.2185
    address_name: Optional[str] = None 
    is_locked: Optional[bool] = False
    encrypted_text: Optional[str] = None
    lock_key: Optional[str] = None

class ModeUpdatePayload(BaseModel):
    network_mode: Optional[str] = None
    local_mode: Optional[str] = None

@app.get("/api/status")
def status_info():
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
@app.post("/api/stt/transcribe")
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
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")

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

@app.post("/api/tts/ai-read")
async def tts_ai_read(payload: TtsPayload):
    """Generate crystal clear Neural AI voice (Tamil or English) from text"""
    audio_url = await generate_ai_voice(payload.text)
    return {"status": "success", "audio_url": audio_url}

@app.post("/api/translate/groq")
async def groq_translate(payload: GroqTranslatePayload):
    """Translate any Indic language text to English using Groq Cloud LLM or Neural Translate"""
    if not payload.text or not payload.text.strip():
        return {"status": "error", "error": "Empty text"}

    from urllib.parse import quote

    # 1. Fast, Reliable Google Neural Translate Fallback
    try:
        g_url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={payload.target_lang or 'en'}&dt=t&q={quote(payload.text.strip())}"
        with httpx.Client(timeout=5.0, verify=False) as client:
            g_resp = client.get(g_url)
            if g_resp.status_code == 200:
                g_data = g_resp.json()
                if g_data and g_data[0]:
                    g_trans = "".join([item[0] for item in g_data[0] if item and item[0]]).strip()
                    if g_trans and g_trans.lower() != payload.text.strip().lower():
                        audio_voice = await generate_english_ai_voice(g_trans)
                        return {
                            "status": "success",
                            "original": payload.text,
                            "translated": g_trans,
                            "audio_url": audio_voice,
                            "engine": "Neural Translation Engine"
                        }
    except Exception as ge:
        print(f"[Neural Translate Error]: {ge}", flush=True)

    api_key = GROQ_API_KEY
    lang_names = {
        "ta": "Tamil", "hi": "Hindi", "te": "Telugu", "ml": "Malayalam",
        "kn": "Kannada", "bn": "Bengali", "mr": "Marathi", "gu": "Gujarati", "en": "English"
    }
    src_name = lang_names.get(payload.source_lang or "ta", "Tamil")
    tgt_name = lang_names.get(payload.target_lang or "en", "English")

    prompt = f"""You are a precise translator. Translate the following {src_name} text to {tgt_name}.
ONLY output the translated text, nothing else. No explanations, no quotes.

Text: {payload.text.strip()}"""

    if api_key and api_key != "gsk_placeholder_set_your_key":
        try:
            with httpx.Client(timeout=10.0, verify=False) as client:
                resp = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.1,
                        "max_tokens": 500
                    }
                )
            if resp.status_code == 200:
                data = resp.json()
                translated = data["choices"][0]["message"]["content"].strip()
                audio_voice = await generate_english_ai_voice(translated)
                return {
                    "status": "success",
                    "original": payload.text,
                    "translated": translated,
                    "audio_url": audio_voice,
                    "engine": "Groq LLM (Llama 3.3 70B)"
                }
        except Exception as e:
            print(f"[Groq Translate Error]: {e}", flush=True)

    translations = translate_indic_9(payload.text, payload.source_lang or "ta")
    return {
        "status": "success",
        "original": payload.text,
        "translated": translations.get("en", payload.text),
        "translations": translations,
        "engine": "Local Indic Dictionary"
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
# 🧠 GROQ & HEURISTIC INTEGRITY LEVEL ANALYSIS — Emergency Priority Scorer
# ============================================================
class IntegrityPayload(BaseModel):
    messages: list  # list of {id, text, language, sender_username, timestamp}

def evaluate_urgency_heuristics(text: str, is_emergency: bool = False) -> tuple[int, str, str, str]:
    """Offline emergency heuristic NLP scorer (runs 100% locally when LLM is unavailable)"""
    t = text.lower()
    if is_emergency or any(k in t for k in ["sos", "drown", "மூழ்க", "flood", "வெள்ளம்", "trapped", "மாட்டி", "fire", "தீ", "heart", "bleed", "collapse", "மரண", "இறக்க"]):
        return (10, "Critical life-threatening hazard requiring immediate rescue dispatch", "P1 - CRITICAL", "Deploy NDRF Inflatable Boats & Paramedics")
    elif any(k in t for k in ["injur", "wound", "pregnant", "baby", "child", "elderly", "burn", "காயம்", "மருத்துவம்", "அவசரம்", "குழந்தை", "முதியவர்", "கர்ப்பிணி"]):
        return (8, "Severe injury or vulnerable citizen in distress", "P2 - HIGH", "Dispatch Ambulance & First Aid Unit")
    elif any(k in t for k in ["food", "water", "medicine", "road", "block", "electric", "power", "battery", "supply", "உணவு", "தண்ணீர்", "மின்சாரம்", "சாலை"]):
        return (6, "Essential relief supply shortage or road obstruction", "P3 - MEDIUM", "Dispatch Relief Food & Route Clearance Crew")
    else:
        return (3, "Routine field report / informational status update", "P4 - LOW", "Log to Incident Registry")

@app.post("/api/groq/analyze-integrity")
def analyze_integrity(payload: IntegrityPayload):
    """Analyze message urgency/priority using Groq LLM with instant offline fallback. Returns ranked messages (1, 2, 3...)."""
    if not payload.messages:
        return {"status": "error", "error": "No messages"}

    api_key = GROQ_API_KEY
    scored = []
    
    # Try Groq Cloud LLM if key is available
    if api_key and len(api_key) > 10:
        try:
            msgs_text = ""
            for i, m in enumerate(payload.messages):
                msgs_text += f"[MSG {i+1}] From: {m.get('sender_username','Unknown')} | Text: {m.get('text','')[:200]}\n"

            system_prompt = """You are an emergency dispatch AI for disaster relief. 
Analyze each message and assign an INTEGRITY LEVEL (urgency score) from 1 to 10:
- 10: Immediate life-threatening (murder, drowning, cardiac arrest, building collapse on people, flood trapping)
- 8-9: Critical (severe injury, trapped vulnerable citizens, fire spreading)
- 6-7: Urgent (medical need, rescue needed soon, stranded, food/water shortage)
- 4-5: Important (supply shortage, infrastructure damage, road blocked)
- 1-3: Non-urgent (status update, information)

Respond ONLY with a JSON array like this:
[{"msg_index": 1, "score": 10, "priority_label": "P1 - CRITICAL", "reason": "Drowning in flood - immediate boat required", "english_summary": "Citizen trapped in floodwater", "action": "Deploy Rescue Boat"},
 {"msg_index": 2, "score": 7, "priority_label": "P2 - HIGH", "reason": "Severe injury - needs medical help", "english_summary": "Person injured, medical aid needed", "action": "Dispatch Paramedics"}]
Do NOT include any other text, just the JSON array."""

            with __import__('httpx').Client(timeout=10.0, verify=False) as client:
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
                start = raw.find('[')
                end = raw.rfind(']') + 1
                if start >= 0 and end > start:
                    scores = _json.loads(raw[start:end])
                    for s in scores:
                        idx = s.get("msg_index", 0) - 1
                        if 0 <= idx < len(payload.messages):
                            m = dict(payload.messages[idx])
                            m["integrity_score"] = s.get("score", 5)
                            m["priority_label"] = s.get("priority_label", "P2 - HIGH" if m["integrity_score"] >= 7 else "P3 - MEDIUM")
                            m["integrity_reason"] = s.get("reason", "")
                            m["recommended_action"] = s.get("action", "Evaluate Emergency Response")
                            m["english_summary"] = s.get("english_summary", m.get("text", ""))
                            scored.append(m)
        except Exception as e:
            print(f"[Groq Integrity Error]: {e}", flush=True)

    # Fallback to local heuristic scorer if Groq LLM didn't produce complete scores
    if len(scored) < len(payload.messages):
        scored = []
        for m in payload.messages:
            m2 = dict(m)
            score, reason, label, action = evaluate_urgency_heuristics(m2.get("text", ""), bool(m2.get("is_emergency")))
            m2["integrity_score"] = score
            m2["integrity_reason"] = reason
            m2["priority_label"] = label
            m2["recommended_action"] = action
            m2["english_summary"] = m2.get("text", "")
            scored.append(m2)

    # Sort strictly by integrity score descending (Rank 1 = Highest Priority)
    scored.sort(key=lambda x: x.get("integrity_score", 1), reverse=True)
    for rank, m in enumerate(scored, 1):
        m["rank"] = rank

    top_user = scored[0].get("sender_username", "@field") if scored else ""
    top_reason = scored[0].get("integrity_reason", "Emergency") if scored else ""
    distinct_users = len(set(m.get("sender_username") for m in scored))
    cluster_summary = f"🚨 AI Multi-System Surge Triage: {len(scored)} reports prioritized across {distinct_users} field users. 🥇 1st Priority: {top_user} ({top_reason})"

    return {
        "status": "success", 
        "burst_detected": True,
        "cluster_summary": cluster_summary,
        "scored_messages": scored, 
        "engine": "Groq Llama-3 / Offline Neural Heuristic Triage"
    }

# 🎙️ Transcribe audio URL from Mode 1/2 for translation
class AudioTranscribePayload(BaseModel):
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None
    language: Optional[str] = "ta"

@app.post("/api/stt/transcribe-for-translate")
async def transcribe_for_translate(payload: AudioTranscribePayload):
    """Transcribe audio and then translate to English using Groq"""
    audio_data = payload.audio_base64 or payload.audio_url or ""
    if not audio_data:
        return {"status": "error", "text": "", "translated": ""}

    # Extract base64 from data URL if needed
    if "base64," in audio_data:
        audio_data = audio_data.split("base64,")[1]

    raw_text, lang = transcribe_indic_neural_base64(audio_data, payload.language or "ta")

    if not raw_text:
        return {"status": "error", "text": "", "translated": ""}

    # Voice OCR: Acoustic spell repair for pure Tamil (No English translation)
    refined_text, _ = voice_ocr_refine_and_translate(raw_text, lang or "ta")

    return {
        "status": "success",
        "text": refined_text or raw_text,
        "raw_text": raw_text,
        "translated": "",
        "audio_url": "",
        "language": lang
    }

@app.get("/download-apk")
def download_apk():
    candidates = [
        r"D:\itantra\iTiTantra_Latest.apk",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ititantra-latest.apk")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "iTiTantra_Latest.apk")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ititantra-latest.apk")),
    ]
    for c in candidates:
        if os.path.exists(c):
            return FileResponse(
                path=c,
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
    c.execute("""
    SELECT * FROM messages 
    WHERE (session_id IS NULL OR session_id != 'LOCAL_MESH_PRIVATE')
      AND (is_emergency = 1 OR target_username = '@command_center' OR sender_role = 'command' OR target_username = '@all_citizens')
    ORDER BY id DESC LIMIT 500
    """)
    rows = c.fetchall()
    messages = [dict(r) for r in rows]
    conn.close()
    recent_lookup = {m.get("db_id"): m for m in recent_mesh_messages if m.get("db_id")}
    recent_by_text = {m.get("text"): m for m in recent_mesh_messages if m.get("text")}
    for m in messages:
        m["channel_type"] = "EMERGENCY_ALERT"
        matched = recent_lookup.get(m.get("id")) or recent_by_text.get(m.get("text"))
        if matched and matched.get("id"):
            m["db_id"] = m["id"]
            m["id"] = matched["id"]
        if m.get("created_at"):
            ca_str = str(m["created_at"]).strip()
            if " " in ca_str and not ca_str.endswith("Z"):
                m["created_at"] = ca_str.replace(" ", "T") + "Z"
    return messages

@app.get("/api/messages/mesh")
def get_mesh_messages():
    global recent_mesh_messages
    return recent_mesh_messages[-50:]

@app.get("/api/mesh/p2p/all")
def get_p2p_messages():
    global recent_p2p_messages
    return recent_p2p_messages[-50:]

@app.post("/api/mesh/p2p/send")
async def send_p2p_message(payload: MessagePayload):
    global recent_p2p_messages
    msg_uuid = payload.id or str(uuid.uuid4())
    sender_name = payload.sender_username or "@citizen"
    target_name = payload.target_username or "@friend"
    final_text = (payload.text or "").strip()
    
    p2p_data = {
        "id": msg_uuid,
        "channel_type": "CIVILIAN_P2P",
        "session_id": "LOCAL_MESH_PRIVATE",
        "sender_role": "field",
        "sender_username": sender_name,
        "target_username": target_name,
        "is_local_mesh_private": True,
        "local_mode": payload.local_mode or "mode-1-p2p-hd",
        "node_id": payload.node_id,
        "cipher_code": payload.cipher_code or f"LOCK#{target_name.replace('@', '')}",
        "type": payload.type or "p2p_message",
        "text": final_text,
        "network_mode": payload.network_mode or "mode-3-ai-mesh",
        "audio_size": payload.audio_size or 0,
        "audio_url": payload.audio_url,
        "audioUrl": payload.audio_url,
        "duration_seconds": payload.duration_seconds or 3,
        "display_time": payload.display_time or datetime.now().strftime("%I:%M %p"),
        "gateway_node": payload.gateway_node or "📱 P2P Mesh Direct",
        "hop_count": payload.hop_count or 1,
        "is_emergency": False,
        "language": payload.language or "ta",
        "is_locked": bool(payload.is_locked),
        "encrypted_text": payload.encrypted_text,
        "lock_key": payload.lock_key,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    recent_p2p_messages.append(p2p_data)
    if len(recent_p2p_messages) > 100:
        recent_p2p_messages = recent_p2p_messages[-100:]
        
    await manager.broadcast(p2p_data)
    return {"status": "delivered", "id": msg_uuid, "packet": p2p_data}

@app.post("/api/mesh/air-broadcast")
async def air_broadcast_mesh(payload: dict):
    """
    Mode 3 Air Broadcast: Mobile 1 broadcasts packet into local air radius (BLE/Wi-Fi/UDP).
    Broadcasts directly to peer listening devices (e.g. Phone 2) via WebSockets.
    """
    is_relayed = bool(payload.get("gateway_node") or (payload.get("hop_count") and payload.get("hop_count") > 1) or payload.get("status") == "relayed")
    status = "relayed" if is_relayed else "broadcasted_to_air"
    air_packet = {
        "type": payload.get("type") or "air_mesh_packet",
        "channel_type": payload.get("channel_type") or "EMERGENCY_ALERT",
        "is_air_broadcast": True,
        "id": payload.get("id") or str(uuid.uuid4()),
        "sender_username": payload.get("sender_username", "@victim_1"),
        "target_username": payload.get("target_username", "@command_center"),
        "cipher_code": payload.get("cipher_code") or "KEY#ENC-4954-015F",
        "text": payload.get("text", ""),
        "network_mode": payload.get("network_mode") or "mode-3-ai-mesh",
        "hop_count": payload.get("hop_count") or 1,
        "gateway_node": payload.get("gateway_node"),
        "status": status,
        "timestamp": payload.get("timestamp") or datetime.utcnow().isoformat(),
        "display_time": payload.get("display_time") or datetime.now().strftime("%I:%M %p")
    }
    await manager.broadcast(air_packet)
    return {"status": status, "packet": air_packet}

# In-Memory Message Deduplication Cache (Ensures single delivery)
processed_message_ids = set()
recent_message_dedup = {}

@app.post("/api/messages/send")
async def send_message(payload: MessagePayload):
    global recent_mesh_messages, processed_message_ids, recent_message_dedup
    import re
    
    # 1. IMMEDIATE ID DEDUPLICATION
    msg_key = str(payload.id).strip() if payload.id else ""
    if msg_key and msg_key in processed_message_ids:
        print(f"[DEDUP] Exact ID duplicate suppressed ({msg_key})", flush=True)
        return {"status": "delivered", "deduplicated": True, "id": msg_key}
    if msg_key:
        processed_message_ids.add(msg_key)
        if len(processed_message_ids) > 2000:
            processed_message_ids.clear()
    
    # 2. CONTENT-BASED SLIDING WINDOW DEDUPLICATION (15s Window)
    now = time.time()
    raw_text = (payload.text or "").strip()
    norm_text = re.sub(r'[\s\W]+', ' ', raw_text).strip().lower()
    content_sig = norm_text[:70] if norm_text else (payload.cipher_code or "")
    if content_sig:
        last_seen = recent_message_dedup.get(content_sig, 0.0)
        if now - last_seen < 12.0:
            print(f"[DEDUP] Duplicate content flood suppressed ({content_sig[:30]}) within 12s", flush=True)
            return {"status": "delivered", "deduplicated": True, "id": payload.id or content_sig}
        recent_message_dedup[content_sig] = now
    
    if len(recent_message_dedup) > 300:
        cutoff = now - 25.0
        recent_message_dedup = {k: v for k, v in recent_message_dedup.items() if v > cutoff}

    final_text = payload.text or ""
    final_lang = payload.language or "ta"
    
    # Auto-expand ONLY if text was specifically the satellite beacon token from BLE
    is_satellite_token = (
        final_text.strip() in ("🚨 SATELL", "SATELL", "🚨 SATELLITE", "SATELLITE BEACON")
        or (payload.network_mode == 'mode-4-satellite-beacon' and "SATELL" in final_text.upper() and len(final_text) < 30)
    )
    if is_satellite_token:
        lat = payload.latitude or 12.8718
        lng = payload.longitude or 80.2185
        addr = payload.address_name or f"GPS: {lat:.4f}°N, {lng:.4f}°E"
        final_text = f"🚨 SOS: I am in emergency, kindly help me! [GPS: {lat:.4f}°N, {lng:.4f}°E]"
        payload.is_emergency = True
        payload.latitude = lat
        payload.longitude = lng
        payload.address_name = addr
    
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

    # Guaranteed Audio for Mode 1 & Mode 2: If audio_url is missing, generate AI Voice Note
    if mode in ('mode-1-hd-call', 'mode-2-compressed-voice'):
        if not payload.audio_url or not str(payload.audio_url).strip():
            try:
                spoken = final_text or ("4G HD Voice Note" if mode == 'mode-1-hd-call' else "2G Compressed Voice Note")
                generated_audio = await generate_ai_voice(spoken, payload.language or "ta")
                if generated_audio:
                    payload.audio_url = generated_audio
            except Exception as e:
                print(f"[Mode 1/2 voice generation error]: {e}", flush=True)

    msg_uuid = payload.id or str(datetime.utcnow().timestamp())
    sender_name = payload.sender_username or f"@{payload.sender_role}"
    target_name = payload.target_username or "@command_center"
    is_private_mesh = (
        bool(payload.is_local_mesh_private) or 
        payload.session_id == "LOCAL_MESH_PRIVATE" or
        (target_name not in ("@command_center", "@all_citizens", "@all_users") and not payload.is_emergency and payload.sender_role != "command")
    )
    if is_private_mesh and target_name in ("@command_center", "@all_citizens"):
        target_name = "@all_friends"

    msg_id = int(datetime.utcnow().timestamp() * 1000) % 1000000
    if not is_private_mesh:
        try:
            conn = sqlite3.connect(DB_PATH, timeout=10.0)
            c = conn.cursor()
            # Strict DB-level duplicate protection: suppress insert if identical text arrived within 12 seconds
            c.execute("""
            SELECT id FROM messages 
            WHERE text = ? 
              AND (created_at >= datetime('now', '-12 seconds') OR strftime('%s','now') - strftime('%s', created_at) < 12)
            LIMIT 1
            """, (final_text,))
            existing_row = c.fetchone()
            if existing_row:
                conn.close()
                print(f"[DEDUP] SQLite duplicate insert suppressed for: {final_text[:40]} (id={existing_row[0]})", flush=True)
                return {"status": "delivered", "deduplicated": True, "id": str(existing_row[0])}

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
                payload.gateway_node or "🏢 Government Control Centre",
                payload.hop_count or 2,
                payload.display_time or datetime.now().strftime("%I:%M %p")
            ))
            msg_id = c.lastrowid
            conn.commit()
            conn.close()
        except Exception as e:
            pass

    translations = translate_indic_9(final_text, final_lang)
    
    msg_data = {
        "id": msg_uuid,
        "translations": translations,
        "db_id": msg_id,
        "channel_type": "CIVILIAN_P2P" if is_private_mesh else "EMERGENCY_ALERT",
        "session_id": payload.session_id,
        "sender_role": payload.sender_role,
        "sender_username": sender_name,
        "target_username": target_name,
        "is_local_mesh_private": is_private_mesh,
        "local_mode": payload.local_mode if is_private_mesh else None,
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
        "is_locked": bool(payload.is_locked),
        "encrypted_text": payload.encrypted_text,
        "lock_key": payload.lock_key,
        "timestamp": datetime.utcnow().isoformat()
    }

    # Store in memory for instant fast polling
    if is_private_mesh:
        recent_p2p_messages.append(msg_data)
        if len(recent_p2p_messages) > 100:
            recent_p2p_messages = recent_p2p_messages[-100:]
    else:
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
    await manager.connect(websocket, role="command")
    try:
        while True:
            await websocket.receive_text()
    except (WebSocketDisconnect, Exception):
        manager.disconnect(websocket)

@app.websocket("/ws/field/{session_id}")
async def ws_field(websocket: WebSocket, session_id: str):
    user_param = websocket.query_params.get("username")
    await manager.connect(websocket, role="field", username=user_param)
    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                data = json.loads(data_str)
                if data.get("type") == "register_user" and data.get("username"):
                    manager.update_user(websocket, data.get("username"))
                elif data.get("sender_username"):
                    manager.update_user(websocket, data.get("sender_username"))
                if data.get("text") or data.get("audio_url") or data.get("type") == "voice":
                    await manager.broadcast(data)
            except Exception:
                pass
    except (WebSocketDisconnect, Exception):
        manager.disconnect(websocket)

# 🌐 Serve Built Frontend directly on port 8000 / Cloud (Single-Page App fallback)
CANDIDATE_DIST_DIRS = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
]
DIST_DIR = next((d for d in CANDIDATE_DIST_DIRS if os.path.exists(d)), None)

if DIST_DIR and os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa_frontend(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("ws/") or full_path == "docs" or full_path == "openapi.json":
            return {"error": "Endpoint not found"}
        target = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    async def root_fallback():
        return {
            "status": "online",
            "service": "iTiTantra Tactical Offline Backend",
            "health": "/api/health",
            "docs": "/docs",
            "version": "2.0.0"
        }


