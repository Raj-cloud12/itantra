import gzip
from dataclasses import dataclass

PHRASE_DICT = {
    'need medical assistance': b'\x01',
    'request evacuation': b'\x02',
    'fire reported': b'\x03',
    'send backup': b'\x04',
    'casualties reported': b'\x05',
    'area secured': b'\x06',
    'requesting air support': b'\x07',
    'hostile contact': b'\x08',
    'position compromised': b'\x09',
    'all clear': b'\x0a',
    'copy that': b'\x0b',
    'affirmative': b'\x0c',
    'negative': b'\x0d',
    'stand by': b'\x0e',
    'over and out': b'\x0f',
    'send supplies': b'\x10',
    'water needed': b'\x11',
    'road blocked': b'\x12',
    'bridge damaged': b'\x13',
    'power outage': b'\x14',
    'communication lost': b'\x15',
    'shelter in place': b'\x16',
    'evacuate immediately': b'\x17',
    'search and rescue': b'\x18',
    'mission complete': b'\x19',
    'returning to base': b'\x1a',
    'weather advisory': b'\x1b',
    'flood warning': b'\x1c',
    'earthquake detected': b'\x1d',
    'situation report': b'\x1e',
    'मुझे मेडिकल सहायता की आवश्यकता है': b'\x1f',
    'वर्तमान स्थान': b'\x20',
    'निकासी का अनुरोध': b'\x21',
    'आग लगने की सूचना': b'\x22',
    'बैकअप भेजें': b'\x23',
    'हताहतों की सूचना': b'\x24',
    'क्षेत्र सुरक्षित': b'\x25',
    'हवाई सहायता का अनुरोध': b'\x26',
    'दुश्मन का संपर्क': b'\x27',
    'स्थिति से समझौता': b'\x28',
    'सब ठीक है': b'\x29',
    'संदेश मिला': b'\x2a',
    'सकारात्मक': b'\x2b',
    'नकारात्मक': b'\x2c',
    'प्रतीक्षा करें': b'\x2d',
    'ओवर एंड आउट': b'\x2e',
    'आपूर्ति भेजें': b'\x2f',
    'पानी की जरूरत है': b'\x30',
    'रास्ता बंद है': b'\x31',
    'पुल क्षतिग्रस्त': b'\x32',
    'बिजली गुल': b'\x33',
    'संपर्क टूट गया': b'\x34',
    'सुरक्षित स्थान पर रहें': b'\x35',
    'तुरंत खाली करें': b'\x36',
    'खोज और बचाव': b'\x37',
    'मिशन पूरा हुआ': b'\x38',
    'बेस पर लौट रहे हैं': b'\x39',
    'मौसम की चेतावनी': b'\x3a',
    'बाढ़ की चेतावनी': b'\x3b',
    'भूकंप का पता चला': b'\x3c',
    'स्थिति रिपोर्ट': b'\x3d',
    # English Civilian
    'i am safe': b'\x3e',
    'where are you': b'\x3f',
    'need emergency help': b'\x40',
    'call me back': b'\x41',
    'network is weak': b'\x42',
    # Hindi Civilian
    'मैं सुरक्षित हूँ': b'\x43',
    'आप कहाँ हैं': b'\x44',
    'आपातकालीन सहायता की जरूरत है': b'\x45',
    'मुझे कॉल करें': b'\x46',
    # Tamil Civilian (தமிழ்)
    'நான் பாதுகாப்பாக இருக்கிறேன்': b'\x47',
    'எங்கே இருக்கிறீர்கள்': b'\x48',
    'எனக்கு அவசர உதவி தேவை': b'\x49',
    'என்னை அழைக்கவும்': b'\x4a',
    'நெட்வொர்க் பலவீனமாக உள்ளது': b'\x4b',
    # Telugu Civilian (తెలుగు)
    'నేను సురక్షితంగా ఉన్నాను': b'\x4c',
    'మీరు ఎక్కడ ఉన్నారు': b'\x4d',
    'నాకు అత్యవసర సహాయం కావాలి': b'\x4e',
    'నాకు కాల్ చేయండి': b'\x4f',
    # Malayalam Civilian (മലയാളം)
    'ഞാൻ സുരക്ഷിതനാണ്': b'\x50',
    'നിങ്ങൾ എവിടെയാണ്': b'\x51',
    'എനിക്ക് അടിയന്തിര സഹായം വേണം': b'\x52',
    'എന്നെ തിരികെ വിളിക്കൂ': b'\x53',
    # Kannada Civilian (ಕನ್ನಡ)
    'ನಾನು ಸುರಕ್ಷಿತವಾಗಿದ್ದೇನೆ': b'\x54',
    'ನೀವು ಎಲ್ಲಿದ್ದೀರಿ': b'\x55',
    'ನನಗೆ ತುರ್ತು ನೆರವು ಬೇಕು': b'\x56',
    # Marathi Civilian (मराठी)
    'मी सुरक्षित आहे': b'\x57',
    'तुम्ही कुठे आहात': b'\x58',
    'मला तातडीच्या मदतीची गरज आहे': b'\x59',
    # Bengali Civilian (বাংলা)
    'আমি নিরাপদ আছি': b'\x5a',
    'আপনি কোথায় আছেন': b'\x5b',
    'জরুরি সাহায্য দরকার': b'\x5c',
    # Gujarati Civilian (ગુજરાતી)
    'હું સુરક્ષિત છું': b'\x5d',
    'તમે ક્યાં છો': b'\x5e',
    'મને કટોકટીની મદદની જરૂર છે': b'\x5f'
}

REVERSE_DICT = {v: k for k, v in PHRASE_DICT.items()}

def _fuzzy_match(text: str) -> list[tuple[str, bytes]]:
    matches = []
    # Sort phrases by length descending to match longest phrases first
    sorted_phrases = sorted(PHRASE_DICT.items(), key=lambda x: len(x[0]), reverse=True)
    
    remaining = text
    for phrase, code in sorted_phrases:
        if phrase in remaining:
            matches.append((phrase, code))
            remaining = remaining.replace(phrase, '', 1)
    return matches

@dataclass
class CompressionResult:
    original_text: str
    raw_bytes: int
    compressed_data: bytes
    compressed_bytes: int
    method: str  # 'dictionary', 'gzip', 'dictionary+gzip'

def compress(text: str) -> CompressionResult:
    raw = text.encode('utf-8')
    raw_bytes = len(raw)
    
    normalized = text.lower().strip()
    matches = _fuzzy_match(normalized)
    
    if matches:
        result = bytearray()
        remaining = normalized
        # To avoid overlapping matches causing issues, process carefully
        # Simple greedy approach for MVP
        for phrase, code in matches:
            if phrase in remaining:
                parts = remaining.split(phrase, 1)
                
                # Append pre-match text if any
                pre = parts[0].strip()
                if pre:
                    pre_bytes = pre.encode('utf-8')
                    result.extend(b'\x01' + len(pre_bytes).to_bytes(2, 'big') + pre_bytes)
                
                # Append code
                result.extend(b'\x00' + code)
                
                remaining = parts[1].strip()
            else:
                # Handled fuzzy matched phrase which might not be an exact substring
                # This is a simplification for the hackathon
                remaining = remaining.replace(phrase, '', 1)
                result.extend(b'\x00' + code)
                remaining = remaining.strip()
                
        if remaining:
            remaining_bytes = remaining.encode('utf-8')
            result.extend(b'\x01' + len(remaining_bytes).to_bytes(2, 'big') + remaining_bytes)
        
        dict_compressed = bytes(result)
        
        gzipped = gzip.compress(raw)
        
        if len(dict_compressed) <= len(gzipped):
            return CompressionResult(text, raw_bytes, dict_compressed, len(dict_compressed), 'dictionary')
        else:
            return CompressionResult(text, raw_bytes, gzipped, len(gzipped), 'gzip')
    else:
        gzipped = gzip.compress(raw)
        return CompressionResult(text, raw_bytes, gzipped, len(gzipped), 'gzip')

def decompress(data: bytes, method: str) -> str:
    try:
        if method == 'gzip':
            return gzip.decompress(data).decode('utf-8')
        elif method in ('dictionary', 'dictionary+gzip'):
            result_parts = []
            i = 0
            while i < len(data):
                if data[i] == 0x00:  # dictionary code follows
                    code = data[i+1:i+2]
                    if code in REVERSE_DICT:
                        result_parts.append(REVERSE_DICT[code])
                    i += 2
                elif data[i] == 0x01:  # raw text follows
                    length = int.from_bytes(data[i+1:i+3], 'big')
                    text_bytes = data[i+3:i+3+length]
                    result_parts.append(text_bytes.decode('utf-8'))
                    i += 3 + length
                else:
                    i += 1
            res = ' '.join(result_parts).strip()
            return res if res else data.decode('utf-8', errors='ignore')
        else:
            return data.decode('utf-8', errors='ignore')
    except Exception:
        try:
            return data.decode('utf-8', errors='ignore')
        except Exception:
            return "🎙️ [Emergency Packet Decoded]"
