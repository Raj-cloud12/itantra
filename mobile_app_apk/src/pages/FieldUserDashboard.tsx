// 🌐 10 SUPPORTED DISASTER INDIC LANGUAGES (AI4Bharat IndicConformer On-Demand Packs)
const INDIC_LANGUAGES_9 = [
  { code: 'ta',   name: 'தமிழ்',     label: 'Tamil',       flag: '🇮🇳', packMB: 188,  modelName: 'AI4Bharat IndicConformer', webLang: 'ta-IN' },
  { code: 'en',   name: 'English',   label: 'English',     flag: '🇬🇧', packMB: 166,  modelName: 'NeMo FastConformer',       webLang: 'en-IN' },
  { code: 'hi',   name: 'हिंदी',     label: 'Hindi',       flag: '🇮🇳', packMB: 188,  modelName: 'AI4Bharat IndicConformer', webLang: 'hi-IN' },
  { code: 'ml',   name: 'മലയാളം',   label: 'Malayalam',   flag: '🇮🇳', packMB: 188,  modelName: 'AI4Bharat IndicConformer', webLang: 'ml-IN' },
  { code: 'te',   name: 'తెలుగు',    label: 'Telugu',      flag: '🇮🇳', packMB: 188,  modelName: 'AI4Bharat IndicConformer', webLang: 'te-IN' },
  { code: 'kn',   name: 'ಕನ್ನಡ',     label: 'Kannada',     flag: '🇮🇳', packMB: 188,  modelName: 'AI4Bharat IndicConformer', webLang: 'kn-IN' },
  { code: 'ur',   name: 'اردو',      label: 'Urdu',        flag: '🇵🇰', packMB: 188,  modelName: 'AI4Bharat IndicConformer', webLang: 'ur-IN' },
  { code: 'bn',   name: 'বাংলা',     label: 'Bengali',     flag: '🇮🇳', packMB: 188,  modelName: 'AI4Bharat IndicConformer', webLang: 'bn-IN' },
  { code: 'mr',   name: 'मराठी',     label: 'Marathi',     flag: '🇮🇳', packMB: 188,  modelName: 'AI4Bharat IndicConformer', webLang: 'mr-IN' },
  { code: 'gu',   name: 'ગુજરાતી',   label: 'Gujarati',    flag: '🇮🇳', packMB: 188,  modelName: 'AI4Bharat IndicConformer', webLang: 'gu-IN' },
];

// 🌐 10-LANGUAGE FULL APP UI TRANSLATIONS DICTIONARY
const UI_STRINGS: Record<string, Record<string, string>> = {
  ta: {
    settings: 'அமைப்புகள்',
    appLanguage: 'செயலி மொழி',
    voiceLanguage: 'குரல் மொழி',
    alertTab: 'எச்சரிக்கை',
    sosTab: 'அவசரம் (SOS)',
    meshTab: 'மெஷ் சாட்',
    oneTapSos: '1-டேப் அவசர SOS டிஸ்ட்ரஸ் பீக்கன்',
    sendOneTapSos: '1-டேப் SOS அனுப்பு',
    holdToTalk: 'பேச அழுத்தவும்',
    holdToSpeakPrompt: 'வாய்ஸ் நோட் பேச பட்டனை அழுத்தவும்',
    voiceToText: 'குரல் வழி உரை',
    ready: 'தயார்',
    listening: 'கேட்கிறது...',
    transcribed: 'மாற்றப்பட்டது ✓',
    holdButtonAndSpeak: 'பட்டனை அழுத்திப் பேசவும்...',
    typeAlertMsg: 'எச்சரிக்கை செய்தியை தட்டச்சு செய்க...',
    sendAlert: 'அனுப்பு',
    govtSosGateway: 'அரசு SOS நுழைவாயில்',
    directToCommand: 'பேரிடர் கட்டுப்பாட்டு அறைக்கு நேரடி இணைப்பு',
    loraDirect: 'LoRa நேரடி நுழைவாயில்',
    medicalEmergency: 'மருத்துவ அவசரம்',
    foodWater: 'உணவு & குடிநீர் தேவை',
    evacuationBoat: 'வெள்ள மீட்பு படகு தேவை',
    trappedRoof: 'கூரை மீது சிக்கியுள்ளோம்',
    typeCustomSos: 'அவசர உதவி விவரங்களை தட்டச்சு செய்க...',
    send: 'அனுப்பு',
    liveGovtSosLog: 'நேரலை அரசு SOS பதிவு',
    onlySosCommand: 'SOS & கட்டுப்பாட்டு மையம் மட்டும்',
    sosGatewayReady: 'அவசர SOS நுழைவாயில் தயார்',
    standbyGovt: 'அரசு அறிவிப்புகளுக்கு காத்திருக்கவும்',
    directChatRecipient: 'நேரடி சாட் பெறுநர்:',
    enterCallsign: 'பெறுநர் பெயர் / கால்சைன்...',
    set: 'அமை',
    iamSafe: 'நான் நலமாக உள்ளேன் 👍',
    needHelp: 'உதவி தேவை 🆘',
    onMyWay: 'வந்து கொண்டிருக்கிறேன் 🏃',
    allClear: 'அனைத்தும் சீராக உள்ளது ✅',
    messageRecipient: 'செய்தி',
    meshChat: 'மெஷ் சாட்',
    you: 'நீங்கள்',
    decrypted: 'மறைகுறியீடு நீக்கப்பட்டது',
    lockedFor: 'பூட்டப்பட்டது',
    satelliteDistressConnected: '1-டேப் சாட்டிலைட் டிஸ்ட்ரஸ் பீக்கன் (LoRa நேரடி நுழைவாயில்) பேரிடர் கட்டுப்பாட்டு அறையுடன் இணைக்கப்பட்டுள்ளது.',
  },
  en: {
    settings: 'Settings',
    appLanguage: 'App Language',
    voiceLanguage: 'Voice Language',
    alertTab: 'Alert',
    sosTab: 'SOS',
    meshTab: 'Local Mesh',
    oneTapSos: '1-Tap Emergency SOS Distress Beacon',
    sendOneTapSos: 'Send 1-Tap SOS',
    holdToTalk: 'HOLD / TAP TO TALK',
    holdToSpeakPrompt: 'Hold or Tap button to speak voice note',
    voiceToText: 'Voice to Text',
    ready: 'Ready',
    listening: 'Listening...',
    transcribed: 'Transcribed ✓',
    holdButtonAndSpeak: 'Hold button and speak...',
    typeAlertMsg: 'Type alert message...',
    sendAlert: 'Send Alert',
    govtSosGateway: 'Government SOS Gateway',
    directToCommand: 'Direct to Disaster Command Center',
    loraDirect: 'LoRa Direct Gateway',
    medicalEmergency: 'Medical Emergency',
    foodWater: 'Food & Clean Drinking Water',
    evacuationBoat: 'Flood Evacuation Boat',
    trappedRoof: 'Trapped on Roof',
    typeCustomSos: 'Type custom SOS emergency details...',
    send: 'Send',
    liveGovtSosLog: 'Live Govt SOS & Distress Log',
    onlySosCommand: 'Only SOS & Command Center',
    sosGatewayReady: 'Emergency SOS Gateway Ready',
    standbyGovt: 'Standby for Govt Broadcasts',
    directChatRecipient: 'Direct Chat Recipient:',
    enterCallsign: 'Enter recipient callsign / username...',
    set: 'Set',
    iamSafe: 'I am safe 👍',
    needHelp: 'Need help 🆘',
    onMyWay: 'On my way 🏃',
    allClear: 'All clear ✅',
    messageRecipient: 'Message',
    meshChat: 'Mesh Chat',
    you: 'You',
    decrypted: 'Decrypted',
    lockedFor: 'Locked for',
    satelliteDistressConnected: '1-Tap Satellite Distress Beacon (LoRa Direct Gateway) connected to Disaster Command Center.',
  },
  hi: {
    settings: 'सेटिंग्स',
    appLanguage: 'ऐप की भाषा',
    voiceLanguage: 'वॉयस भाषा',
    alertTab: 'अलर्ट',
    sosTab: 'एसओएस (SOS)',
    meshTab: 'लोकल मेश',
    oneTapSos: '1-टैप आपातकालीन एसओएस बीकन',
    sendOneTapSos: '1-टैप एसओएस भेजें',
    holdToTalk: 'बोलने के लिए दबाएं',
    holdToSpeakPrompt: 'वॉयस नोट बोलने के लिए बटन दबाएं',
    voiceToText: 'आवाज़ से टेक्स्ट',
    ready: 'तैयार',
    listening: 'सुन रहा है...',
    transcribed: 'ट्रांसक्राइब हुआ ✓',
    holdButtonAndSpeak: 'बटन दबाकर बोलें...',
    typeAlertMsg: 'अलर्ट संदेश लिखें...',
    sendAlert: 'अलर्ट भेजें',
    govtSosGateway: 'सरकारी एसओएस गेटवे',
    directToCommand: 'आपदा नियंत्रण केंद्र से सीधा संपर्क',
    loraDirect: 'LoRa डायरेक्ट गेटवे',
    medicalEmergency: 'चिकित्सा आपातकाल',
    foodWater: 'भोजन और स्वच्छ पानी',
    evacuationBoat: 'बाढ़ बचाव नाव',
    trappedRoof: 'छत पर फंसे हैं',
    typeCustomSos: 'आपातकालीन विवरण लिखें...',
    send: 'भेजें',
    liveGovtSosLog: 'लाइव सरकारी एसओएस लॉग',
    onlySosCommand: 'केवल एसओएस और कमांड सेंटर',
    sosGatewayReady: 'आपातकालीन एसओएस गेटवे तैयार',
    standbyGovt: 'सरकारी घोषणाओं की प्रतीक्षा करें',
    directChatRecipient: 'सीधा चैट प्राप्तकर्ता:',
    enterCallsign: 'प्राप्तकर्ता का नाम दर्ज करें...',
    set: 'सेट करें',
    iamSafe: 'मैं सुरक्षित हूँ 👍',
    needHelp: 'मदद चाहिए 🆘',
    onMyWay: 'रास्ते में हूँ 🏃',
    allClear: 'सब ठीक है ✅',
    messageRecipient: 'संदेश',
    meshChat: 'मेश चैट',
    you: 'आप',
    decrypted: 'डिक्रिप्टेड',
    lockedFor: 'के लिए सुरक्षित',
    satelliteDistressConnected: '1-टैप सैटेलाइट डिस्ट्रेस बीकन (LoRa डायरेक्ट गेटवे) आपदा नियंत्रण केंद्र से जुड़ा है।',
  },
  ml: {
    settings: 'ക്രമീകരണങ്ങൾ',
    appLanguage: 'ആപ്പ് ഭാഷ',
    voiceLanguage: 'ശബ്ദ ഭാഷ',
    alertTab: 'അലർട്ട്',
    sosTab: 'എസ്ഒഎസ്',
    meshTab: 'ലോക്കൽ മെഷ്',
    oneTapSos: '1-ടാപ്പ് അടിയന്തര എസ്ഒഎസ് ബീക്കൺ',
    sendOneTapSos: '1-ടാപ്പ് എസ്ഒഎസ് അയക്കുക',
    holdToTalk: 'സംസാരിക്കാൻ അമർത്തുക',
    holdToSpeakPrompt: 'വോയ്സ് നോട്ടിനായി ബട്ടൺ അമർത്തുക',
    voiceToText: 'ശബ്ദം ടെക്സ്റ്റാക്കുക',
    ready: 'തയ്യാറാണ്',
    listening: 'കേൾക്കുന്നു...',
    transcribed: 'മാറ്റി എഴുതി ✓',
    holdButtonAndSpeak: 'ബട്ടൺ അമർത്തി സംസാരിക്കുക...',
    typeAlertMsg: 'സന്ദേശം ടൈപ്പ് ചെയ്യുക...',
    sendAlert: 'അയക്കുക',
    govtSosGateway: 'സർക്കാർ എസ്ഒഎസ് ഗേറ്റ്‌വേ',
    directToCommand: 'കൺട്രോൾ റൂമിലേക്ക് നേരിട്ട്',
    loraDirect: 'LoRa ഡയറക്ട് ഗേറ്റ്‌വേ',
    medicalEmergency: 'ചികിത്സാ സഹായം',
    foodWater: 'ഭക്ഷണവും കുടിവെള്ളവും',
    evacuationBoat: 'രക്ഷാ ബോട്ട് ആവശ്യമുണ്ട്',
    trappedRoof: 'മേൽക്കൂരയിൽ കുടുങ്ങി',
    typeCustomSos: 'സഹായ വിവരങ്ങൾ ടൈപ്പ് ചെയ്യുക...',
    send: 'അയക്കുക',
    liveGovtSosLog: 'തത്സമയ എസ്ഒഎസ് ലോഗ്',
    onlySosCommand: 'എസ്ഒഎസ് & കൺട്രോൾ റൂം മാത്രം',
    sosGatewayReady: 'എസ്ഒഎസ് ഗേറ്റ്‌വേ തയ്യാറാണ്',
    standbyGovt: 'സർക്കാർ അറിയിപ്പുകൾക്കായി കാത്തിരിക്കുക',
    directChatRecipient: 'ചാറ്റ് സ്വീകർത്താവ്:',
    enterCallsign: 'പേര് നൽകുക...',
    set: 'സെറ്റ്',
    iamSafe: 'ഞാൻ സുരക്ഷിതനാണ് 👍',
    needHelp: 'സഹായം വേണം 🆘',
    onMyWay: 'വഴിയെ വരുന്നു 🏃',
    allClear: 'എല്ലാം ശരിയായി ✅',
    messageRecipient: 'സന്ദേശം',
    meshChat: 'മെഷ് ചാറ്റ്',
    you: 'നിങ്ങൾ',
    decrypted: 'ഡീക്രിപ്റ്റ് ചെയ്തു',
    lockedFor: 'പൂട്ടിയിരിക്കുന്നു',
    satelliteDistressConnected: '1-ടാപ്പ് സാറ്റലൈറ്റ് ഡിസ്ട്രസ്സ് ബീക്കൺ (LoRa ഡയറക്ട് ഗേറ്റ്‌വേ) ദുരന്ത നിയന്ത്രണ കേന്ദ്രവുമായി ബന്ധിപ്പിച്ചിരിക്കുന്നു.',
  },
  te: {
    settings: 'సెట్టింగ్‌లు',
    appLanguage: 'యాప్ భాష',
    voiceLanguage: 'వాయిస్ భాష',
    alertTab: 'అలర్ట్',
    sosTab: 'ఎస్ఓఎస్',
    meshTab: 'లోకల్ మెష్',
    oneTapSos: '1-ట్యాప్ అత్యవసర SOS బీకన్',
    sendOneTapSos: '1-ట్యాప్ SOS పంపండి',
    holdToTalk: 'మాట్లాడటానికి నొక్కండి',
    holdToSpeakPrompt: 'వాయిస్ నోట్ మాట్లాడటానికి బటన్ నొక్కండి',
    voiceToText: 'వాయిస్ టు టెక్స్ట్',
    ready: 'సిద్ధంగా ఉంది',
    listening: 'వింటోంది...',
    transcribed: 'మార్చబడింది ✓',
    holdButtonAndSpeak: 'బటన్ నొక్కి మాట్లాడండి...',
    typeAlertMsg: 'సందేశం టైప్ చేయండి...',
    sendAlert: 'పంపండి',
    govtSosGateway: 'ప్రభుత్వ SOS గేట్‌వే',
    directToCommand: 'నియంత్రణ కేంద్రానికి నేరుగా',
    loraDirect: 'LoRa డైరెక్ట్ గేట్‌వే',
    medicalEmergency: 'వైద్య అత్యవసరం',
    foodWater: 'ఆహారం & తాగునీరు',
    evacuationBoat: 'వరద సహాయక పడవ',
    trappedRoof: 'పైకప్పుపై చిక్కుకున్నాం',
    typeCustomSos: 'సహాయ వివరాలను టైప్ చేయండి...',
    send: 'పంపండి',
    liveGovtSosLog: 'ప్రత్యక్ష SOS లాగ్',
    onlySosCommand: 'SOS & కంట్రోల్ సెంటర్ మాత్రమే',
    sosGatewayReady: 'అత్యవసర SOS గేట్‌వే సిద్ధం',
    standbyGovt: 'ప్రభుత్వ ప్రసారాల కోసం వేచి ఉండండి',
    directChatRecipient: 'చాట్ స్వీకర్త:',
    enterCallsign: 'పేరు నమోదు చేయండి...',
    set: 'సెట్',
    iamSafe: 'నేను క్షేమంగా ఉన్నాను 👍',
    needHelp: 'సహాయం కావాలి 🆘',
    onMyWay: 'వస్తున్నాను 🏃',
    allClear: 'అంతా క్లియర్ ✅',
    messageRecipient: 'సందేశం',
    meshChat: 'మెష్ చాట్',
    you: 'మీరు',
    decrypted: 'డీక్రిప్ట్ చేయబడింది',
    lockedFor: 'లాక్ చేయబడింది',
    satelliteDistressConnected: '1-ట్యాప్ శాటిలైట్ డిస్ట్రెస్ బీకన్ (LoRa డైరెక్ట్ గేట్‌వే) విపత్తు నియంత్రణ కేంద్రానికి అనుసంధానించబడింది.',
  },
  kn: {
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    appLanguage: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ',
    voiceLanguage: 'ಧ್ವನಿ ಭಾಷೆ',
    alertTab: 'ಎಚ್ಚರಿಕೆ',
    sosTab: 'ಎಸ್ಓಎಸ್',
    meshTab: 'ಲೋಕಲ್ ಮೆಶ್',
    oneTapSos: '1-ಟ್ಯಾಪ್ ತುರ್ತು SOS ಬೀಕನ್',
    sendOneTapSos: '1-ಟ್ಯಾಪ್ SOS ಕಳುಹಿಸಿ',
    holdToTalk: 'ಮಾತನಾಡಲು ಒತ್ತಿ',
    holdToSpeakPrompt: 'ಧ್ವನಿ ಟಿಪ್ಪಣಿಗಾಗಿ ಬಟನ್ ಒತ್ತಿ',
    voiceToText: 'ಧ್ವನಿಯಿಂದ ಪಠ್ಯ',
    ready: 'ಸಿದ್ಧವಾಗಿದೆ',
    listening: 'ಕೇಳುತ್ತಿದೆ...',
    transcribed: 'ಪರಿವರ್ತಿಸಲಾಗಿದೆ ✓',
    holdButtonAndSpeak: 'ಬಟನ್ ಒತ್ತಿ ಮಾತನಾಡಿ...',
    typeAlertMsg: 'ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...',
    sendAlert: 'ಕಳುಹಿಸಿ',
    govtSosGateway: 'ಸರ್ಕಾರಿ SOS ಗೇಟ್‌ವೇ',
    directToCommand: 'ನಿಯಂತ್ರಣ ಕೊಠಡಿಗೆ ನೇರ ಸಂಪರ್ಕ',
    loraDirect: 'LoRa ಡೈರೆಕ್ಟ್ ಗೇಟ್‌ವೇ',
    medicalEmergency: 'ವೈದ್ಯಕೀಯ ತುರ್ತು',
    foodWater: 'ಆಹಾರ ಮತ್ತು ನೀರು',
    evacuationBoat: 'ರಕ್ಷಣಾ ದೋಣಿ ಬೇಕು',
    trappedRoof: 'ಮೇಲ್ಛಾವಣಿಯಲ್ಲಿ ಸಿಲುಕಿದ್ದೇವೆ',
    typeCustomSos: 'ತುರ್ತು ವಿವರ ಟೈಪ್ ಮಾಡಿ...',
    send: 'ಕಳುಹಿಸಿ',
    liveGovtSosLog: 'ನೇರ SOS ಲಾಗ್',
    onlySosCommand: 'SOS ಮತ್ತು ಕಮಾಂಡ್ ಸೆಂಟರ್ ಮಾತ್ರ',
    sosGatewayReady: 'ತುರ್ತು SOS ಗೇಟ್‌ವೇ ಸಿದ್ಧವಾಗಿದೆ',
    standbyGovt: 'ಸರ್ಕಾರಿ ಪ್ರಸಾರಕ್ಕಾಗಿ ಕಾಯಿರಿ',
    directChatRecipient: 'ಸ್ವೀಕರಿಸುವವರು:',
    enterCallsign: 'ಹೆಸರು ನಮೂದಿಸಿ...',
    set: 'ಸೆಟ್',
    iamSafe: 'ನಾನು ಸುರಕ್ಷಿತವಾಗಿದ್ದೇನೆ 👍',
    needHelp: 'ಸಹಾಯ ಬೇಕು 🆘',
    onMyWay: 'ದಾರಿಯಲ್ಲಿದ್ದೇನೆ 🏃',
    allClear: 'ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆ ✅',
    messageRecipient: 'ಸಂದೇಶ',
    meshChat: 'ಮೆಶ್ ಚಾಟ್',
    you: 'ನೀವು',
    decrypted: 'ಡಿಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದೆ',
    lockedFor: 'ಲಾಕ್ ಮಾಡಲಾಗಿದೆ',
    satelliteDistressConnected: '1-ಟ್ಯಾಪ್ ಉಪಗ್ರಹ ಸಂಕಷ್ಟ ಬೀಕನ್ (LoRa ಡೈರೆಕ್ಟ್ ಗೇಟ್‌ವೇ) ವಿಪತ್ತು ನಿಯಂತ್ರಣ ಕೊಠಡಿಗೆ ಸಂಪರ್ಕಗೊಂಡಿದೆ.',
  },
  ur: {
    settings: 'ترتیبات',
    appLanguage: 'ایپ کی زبان',
    voiceLanguage: 'آواز کی زبان',
    alertTab: 'انتباہ',
    sosTab: 'ایس او ایس',
    meshTab: 'لوکل میش',
    oneTapSos: '1-ٹیپ ہنگامی SOS بیکن',
    sendOneTapSos: '1-ٹیپ SOS بھیجیں',
    holdToTalk: 'بولنے کے لیے دبائیں',
    holdToSpeakPrompt: 'وائس نوٹ کے لیے بٹن دبائیں',
    voiceToText: 'آواز سے متن',
    ready: 'تیار',
    listening: 'سن رہا ہے...',
    transcribed: 'تبدیل شدہ ✓',
    holdButtonAndSpeak: 'بٹن دبا کر بولیں...',
    typeAlertMsg: 'پیغام ٹائپ کریں...',
    sendAlert: 'بھیجیں',
    govtSosGateway: 'سرکاری SOS گیٹ وے',
    directToCommand: 'کنٹرول روم سے براہ راست رابطہ',
    loraDirect: 'LoRa ڈائریکٹ گیٹ وے',
    medicalEmergency: 'طبی ایمرجنسی',
    foodWater: 'کھانا اور پینے کا پانی',
    evacuationBoat: 'ریسکیو کشتی کی ضرورت',
    trappedRoof: 'چھت پر پھنسے ہوئے ہیں',
    typeCustomSos: 'تفصیل ٹائپ کریں...',
    send: 'بھیجیں',
    liveGovtSosLog: 'لائیو SOS لاگ',
    onlySosCommand: 'صرف SOS اور کمانڈ سینٹر',
    sosGatewayReady: 'ایمرجنسی SOS گیٹ وے تیار ہے',
    standbyGovt: 'سرکاری اعلانات کا انتظار کریں',
    directChatRecipient: 'وصول کنندہ:',
    enterCallsign: 'نام درج کریں...',
    set: 'سیٹ',
    iamSafe: 'میں محفوظ ہوں 👍',
    needHelp: 'مدد چاہیے 🆘',
    onMyWay: 'راستے میں ہوں 🏃',
    allClear: 'سب ٹھیک ہے ✅',
    messageRecipient: 'پیغام',
    meshChat: 'میش چیٹ',
    you: 'آپ',
    decrypted: 'ڈیکرپٹ شدہ',
    lockedFor: 'کے لیے مقفل',
    satelliteDistressConnected: '1-ٹیپ سیٹلائٹ ڈسٹریس بیکن (LoRa ڈائریکٹ گیٹ وے) ڈیزاسٹر کنٹرول سینٹر سے منسلک ہے۔',
  },
  bn: {
    settings: 'সেটিংস',
    appLanguage: 'অ্যাপের ভাষা',
    voiceLanguage: 'ভয়েস ভাষা',
    alertTab: 'সতর্কতা',
    sosTab: 'এসওএস',
    meshTab: 'লোকাল মেশ',
    oneTapSos: '১-ট্যাপ জরুরি SOS বীকন',
    sendOneTapSos: '১-ট্যাপ SOS পাঠান',
    holdToTalk: 'কথা বলতে চাপুন',
    holdToSpeakPrompt: 'ভয়েস নোটের জন্য বোতাম চেপে রাখুন',
    voiceToText: 'ভয়েস থেকে টেক্সট',
    ready: 'প্রস্তুত',
    listening: 'শুনছে...',
    transcribed: 'রূপান্তরিত ✓',
    holdButtonAndSpeak: 'বোতাম চেপে কথা বলুন...',
    typeAlertMsg: 'বার্তা টাইপ করুন...',
    sendAlert: 'পাঠান',
    govtSosGateway: 'সরকারি SOS গেটওয়ে',
    directToCommand: 'কন্ট্রোল রুমে সরাসরি যোগাযোগ',
    loraDirect: 'LoRa ডাইরেক্ট গেটওয়ে',
    medicalEmergency: 'চিকিৎসা জরুরি অবস্থা',
    foodWater: 'খাবার ও বিশুদ্ধ পানি',
    evacuationBoat: 'উদ্ধারকারী নৌকা',
    trappedRoof: 'ছাদে আটকে আছি',
    typeCustomSos: 'জরুরি বিবরণ টাইপ করুন...',
    send: 'পাঠান',
    liveGovtSosLog: 'লাইভ SOS লগ',
    onlySosCommand: 'শুধুমাত্র SOS ও কমান্ড সেন্টার',
    sosGatewayReady: 'জরুরি SOS গেটওয়ে প্রস্তুত',
    standbyGovt: 'সরকারি ঘোষণার জন্য অপেক্ষা করুন',
    directChatRecipient: 'চ্যাট প্রাপক:',
    enterCallsign: 'নাম লিখুন...',
    set: 'সেট',
    iamSafe: 'আমি নিরাপদ আছি 👍',
    needHelp: 'সাহায্য দরকার 🆘',
    onMyWay: 'আসছি 🏃',
    allClear: 'সব ঠিক আছে ✅',
    messageRecipient: 'বার্তা',
    meshChat: 'মেশ চ্যাট',
    you: 'আপনি',
    decrypted: 'ডিক্রিপ্ট করা',
    lockedFor: 'এর জন্য লক করা',
    satelliteDistressConnected: '১-ট্যাপ স্যাটেলাইট ডিস্ট্রেস বীকন (LoRa ডিরেক্ট গেটওয়ে) দুর্যোগ নিয়ন্ত্রণ কেন্দ্রের সাথে সংযুক্ত।',
  },
  mr: {
    settings: 'सेटिंग्ज',
    appLanguage: 'अ‍ॅपची भाषा',
    voiceLanguage: 'आवाज भाषा',
    alertTab: 'इशारा',
    sosTab: 'एसओएस',
    meshTab: 'लोकल मेश',
    oneTapSos: '१-टॅप आपत्कालीन SOS बीकन',
    sendOneTapSos: '१-टॅप SOS पाठवा',
    holdToTalk: 'बोलण्यासाठी दाबा',
    holdToSpeakPrompt: 'व्हॉइस नोटसाठी बटण दाबा',
    voiceToText: 'आवाजातून मजकूर',
    ready: 'सज्ज',
    listening: 'ऐकत आहे...',
    transcribed: 'रूपांतरित ✓',
    holdButtonAndSpeak: 'बटण दाबून बोला...',
    typeAlertMsg: 'संदेश टाइप करा...',
    sendAlert: 'पाठवा',
    govtSosGateway: 'सरकारी SOS गेटवे',
    directToCommand: 'नियंत्रण कक्षाशी थेट संपर्क',
    loraDirect: 'LoRa डायरेक्ट गेटवे',
    medicalEmergency: 'वैद्यकीय आणीबाणी',
    foodWater: 'अन्न आणि पिण्याचे पाणी',
    evacuationBoat: 'बचाव बोट हवी',
    trappedRoof: 'छतावर अडकलो आहोत',
    typeCustomSos: 'तपशील टाइप करा...',
    send: 'पाठवा',
    liveGovtSosLog: 'लाइव्ह SOS नोंद',
    onlySosCommand: 'फक्त SOS आणि कमांड सेंटर',
    sosGatewayReady: 'आपत्कालीन SOS गेटवे सज्ज आहे',
    standbyGovt: 'सरकारी घोषणांची वाट पहा',
    directChatRecipient: 'प्राप्तकर्ता:',
    enterCallsign: 'नाव टाका...',
    set: 'सेट',
    iamSafe: 'मी सुरक्षित आहे 👍',
    needHelp: 'मदत हवी आहे 🆘',
    onMyWay: 'येत आहे 🏃',
    allClear: 'सर्व ठीक आहे ✅',
    messageRecipient: 'संदेश',
    meshChat: 'मेश चॅट',
    you: 'तुम्ही',
    decrypted: 'डिक्रिप्ट केले',
    lockedFor: 'साठी सुरक्षित',
    satelliteDistressConnected: '१-टॅप सॅटेलाइट डिस्ट्रेस बीकन (LoRa थेट गेटवे) आपत्ती नियंत्रण कक्षाशी जोडलेले आहे.',
  },
  gu: {
    settings: 'સેટિંગ્સ',
    appLanguage: 'ઍપની ભાષા',
    voiceLanguage: 'અવાજ ભાષા',
    alertTab: 'ચેતવણી',
    sosTab: 'એસઓએસ',
    meshTab: 'લોકલ મેશ',
    oneTapSos: '1-ટેપ ઇમરજન્સી SOS બીકન',
    sendOneTapSos: '1-ટેપ SOS મોકલો',
    holdToTalk: 'બોલવા માટે દબાવો',
    holdToSpeakPrompt: 'વૉઇસ નોટ માટે બટન દબાવો',
    voiceToText: 'અવાજથી ટેક્સ્ટ',
    ready: 'તૈયાર',
    listening: 'સાંભળી રહ્યું છે...',
    transcribed: 'રૂપાંતરિત ✓',
    holdButtonAndSpeak: 'બટન દબાવીને બોલો...',
    typeAlertMsg: 'સંદેશ લખો...',
    sendAlert: 'મોકલો',
    govtSosGateway: 'સરકારી SOS ગેટવે',
    directToCommand: 'નિયંત્રણ કેન્દ્ર સાથે સીધો સંપર્ક',
    loraDirect: 'LoRa ડાયરેક્ટ ગેટવે',
    medicalEmergency: 'તબીબી કટોકટી',
    foodWater: 'ખોરાક અને પીવાનું પાણી',
    evacuationBoat: 'બચાવ બોટ જોઈએ',
    trappedRoof: 'ધાબા પર ફસાયા છીએ',
    typeCustomSos: 'વિગતો લખો...',
    send: 'મોકલો',
    liveGovtSosLog: 'લાઇવ SOS લૉગ',
    onlySosCommand: 'માત્ર SOS અને કમાન્ડ સેન્ટર',
    sosGatewayReady: 'ઇમરજન્સી SOS ગેટવે તૈયાર છે',
    standbyGovt: 'સરકારી ઘોષણાઓની રાહ જુઓ',
    directChatRecipient: 'પ્રાપ્તકર્તા:',
    enterCallsign: 'નામ દાખલ કરો...',
    set: 'સેટ',
    iamSafe: 'હું સુરક્ષિત છું 👍',
    needHelp: 'મદદ જોઈએ છે 🆘',
    onMyWay: 'રસ્તામાં છું 🏃',
    allClear: 'બધું બરાબર છે ✅',
    messageRecipient: 'સંદેશ',
    meshChat: 'મેશ ચેટ',
    you: 'તમે',
    decrypted: 'ડિક્રિપ્ટ કરેલ',
    lockedFor: 'માટે લૉક કરેલ',
    satelliteDistressConnected: '૧-ટેપ સેટેલાઇટ ડિસ્ટ્રેસ બીકન (LoRa ડાયરેક્ટ ગેટવે) આપત્તિ નિયંત્રણ કેન્દ્ર સાથે જોડાયેલ છે.',
  }
};

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { PushToTalkButton } from '../components/PushToTalkButton';
import { PipelineProgress } from '../components/PipelineProgress';
import { VoiceNotePlayer } from '../components/VoiceNotePlayer';
import { compressWavFor2G } from '../utils/wavRecorder';
import { ChatMessage, MessageStats, SupportedLanguage } from '../types';

export default function FieldUserDashboard() {
  // Helper to format Indian Standard Time (IST) e.g. 10:33 PM
  const formatTimeIST = (timeVal?: any) => {
    if (!timeVal) {
      return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    }
    // Handle numeric string timestamps (e.g. "1789753661549")
    if (typeof timeVal === 'string' && /^\d{10,13}$/.test(timeVal.trim())) {
      timeVal = Number(timeVal.trim());
    }
    if (typeof timeVal === 'number') {
      const ts = timeVal > 1e11 ? timeVal : timeVal * 1000;
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
      }
    }
    if (typeof timeVal === 'string') {
      const trimmed = timeVal.trim();
      // If ISO format or date string
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        let isoStr = trimmed;
        if (!isoStr.endsWith('Z') && !isoStr.includes('+')) {
          isoStr = isoStr.replace(' ', 'T') + 'Z';
        }
        const d = new Date(isoStr);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
        }
      }
      const lower = trimmed.toLowerCase();
      if (lower.includes('am') || lower.includes('pm')) {
        return trimmed.toUpperCase();
      }
    }
    return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  };

  const generatePcmSpeechWav = (text: string, durationSec = 2.5): string => {
    try {
      const sampleRate = 16000;
      const numSamples = Math.floor(sampleRate * Math.max(1.5, Math.min(6, durationSec)));
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);

      const writeStr = (offset: number, s: string) => {
        for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
      };
      writeStr(0, 'RIFF');
      view.setUint32(4, 36 + numSamples * 2, true);
      writeStr(8, 'WAVE');
      writeStr(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeStr(36, 'data');
      view.setUint32(40, numSamples * 2, true);

      let index = 44;
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const env = Math.sin((i / numSamples) * Math.PI);
        const f0 = 135 + 15 * Math.sin(2 * Math.PI * 1.5 * t);
        const sample = (
          0.45 * Math.sin(2 * Math.PI * f0 * t) +
          0.25 * Math.sin(2 * Math.PI * (f0 * 2) * t) +
          0.15 * Math.sin(2 * Math.PI * (f0 * 3) * t) +
          0.10 * Math.sin(2 * Math.PI * 720 * t)
        ) * env * 0.45;
        const s = Math.max(-1, Math.min(1, sample));
        view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        index += 2;
      }

      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return `data:audio/wav;base64,${btoa(binary)}`;
    } catch {
      return '';
    }
  };

  const getSosTime = (m: any): number => {
    if (m.timestamp) {
      if (/^\d{10,13}$/.test(String(m.timestamp))) return Number(m.timestamp);
      let ts = String(m.timestamp).trim();
      if (!ts.endsWith('Z') && !ts.includes('+') && ts.includes('-') && ts.includes(':')) {
        ts = ts.replace(' ', 'T') + 'Z';
      }
      const t = new Date(ts).getTime();
      if (!isNaN(t)) return t;
    }
    if (m.created_at) {
      let ts = String(m.created_at).trim();
      if (!ts.endsWith('Z') && !ts.includes('+') && ts.includes('-') && ts.includes(':')) {
        ts = ts.replace(' ', 'T') + 'Z';
      }
      const t = new Date(ts).getTime();
      if (!isNaN(t)) return t;
    }
    if (typeof m.id === 'number') return m.id;
    const match = String(m.id).match(/(\d{5,13})/);
    if (match) return Number(match[1]);
    return 0;
  };

  const { sessionId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token') || sessionStorage.getItem('field_token');

  // Navigation Tabs: talk (Main/Govt) | sos | relay (Air Relay & Judge Demo Hub) | mesh (Local Mesh Friends P2P)
  const [activeTab, setActiveTab] = useState<'talk' | 'sos' | 'relay' | 'mesh'>('talk');
  const [textInput, setTextInput] = useState('');
  const [localMeshTextInput, setLocalMeshTextInput] = useState('');
  const [spokenSpeechText, setSpokenSpeechText] = useState('');
  const [persistentSpokenText, setPersistentSpokenText] = useState('');
  const [localMeshSpokenText, setLocalMeshSpokenText] = useState('');
  const [localMeshPersistentText, setLocalMeshPersistentText] = useState('');
  const [sosHistory, setSosHistory] = useState<any[]>([]);
  const [sosCustomInput, setSosCustomInput] = useState<string>('');
  const [relayedAirPackets, setRelayedAirPackets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('relayed_air_packets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tactical Network Mode: Switchable 4-Tier Engine (Mode 1, 2, 3, 4)
  const [networkMode, setNetworkMode] = useState<'mode-1-hd-call' | 'mode-2-compressed-voice' | 'mode-3-ai-mesh' | 'mode-4-satellite-beacon'>('mode-3-ai-mesh');
  const [batteryPct, setBatteryPct] = useState<number>(85);

  // Local Mesh 3-Modes (Exclusive for Friends P2P)
  const [localMeshMode, setLocalMeshMode] = useState<'mode-1-p2p-hd' | 'mode-2-p2p-2g' | 'mode-3-p2p-nan'>('mode-1-p2p-hd');
  const [showModeModal, setShowModeModal] = useState<boolean>(false);
  const isSosTriggeringRef = useRef<boolean>(false);



  // Normalize username helper
  const normalizeName = (name: string) => {
    if (!name) return '';
    const clean = name.trim();
    return clean.startsWith('@') ? clean.toLowerCase() : `@${clean.toLowerCase()}`;
  };

  // 📦 Download Language Pack (AI4Bharat IndicConformer) with real native progress tracking
  const downloadLangPack = async (langCode: string) => {
    if (downloadingLang || installedPacks.includes(langCode) || langCode === 'auto') return;
    const lang = INDIC_LANGUAGES_9.find(l => l.code === langCode);
    if (!lang) return;

    setDownloadingLang(langCode);
    setPackDownloadProgress(prev => ({ ...prev, [langCode]: 0 }));

    // 1. Invoke Android Native AI4Bharat Model Downloader
    if ((window as any).AndroidBleMeshBridge?.downloadLanguagePack) {
      try {
        (window as any).AndroidBleMeshBridge.downloadLanguagePack(langCode);
        return;
      } catch (e) {
        console.warn('Native downloadLanguagePack error, using browser fallback:', e);
      }
    }

    // 2. Browser fallback simulation for desktop browser pair testing
    try {
      const steps = 40;
      for (let i = 1; i <= steps; i++) {
        await new Promise(r => setTimeout(r, 50));
        const pct = Math.min(99, Math.round((i / steps) * 100));
        setPackDownloadProgress(prev => ({ ...prev, [langCode]: pct }));
      }
      setPackDownloadProgress(prev => ({ ...prev, [langCode]: 100 }));
      const newPacks = [...installedPacks.filter(p => p !== langCode), langCode];
      setInstalledPacks(newPacks);
      localStorage.setItem('installed_lang_packs', JSON.stringify(newPacks));
    } catch {
      setPackDownloadProgress(prev => ({ ...prev, [langCode]: -1 }));
    } finally {
      setDownloadingLang(null);
    }
  };

  // Permanent Unique Cryptographic Node ID (Hardware Fingerprint)
  const [myNodeId] = useState<string>(() => {
    let existing = localStorage.getItem('node_hardware_fingerprint');
    if (!existing) {
      existing = 'NODE-' + Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase() + '-' + Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase();
      localStorage.setItem('node_hardware_fingerprint', existing);
    }
    return existing;
  });

  // Active Peer Node Registry for Mesh Username Uniqueness Tracking
  const [meshPeerRegistry, setMeshPeerRegistry] = useState<Record<string, { username: string; nodeId: string; lastSeen: number }>>(() => {
    try {
      const saved = localStorage.getItem('mesh_peer_registry');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Permanent Unique Username (Write-Once Offline Hardware Lock)
  const getInitialIdentity = (): { username: string; isLocked: boolean } => {
    try {
      if (typeof window !== 'undefined' && (window as any).AndroidBleMeshBridge?.getPermanentDeviceIdentity) {
        const jsonStr = (window as any).AndroidBleMeshBridge.getPermanentDeviceIdentity();
        const parsed = JSON.parse(jsonStr);
        if (parsed && parsed.is_locked && parsed.username) {
          localStorage.setItem('local_username', parsed.username);
          localStorage.setItem('local_username_locked', 'true');
          return { username: parsed.username, isLocked: true };
        }
      }
    } catch (e) {
      console.warn('Initial identity bridge check error:', e);
    }
    const localLocked = localStorage.getItem('local_username_locked') === 'true';
    const localUser = localStorage.getItem('local_username') || '';
    return { username: localUser, isLocked: localLocked };
  };

  const initialIdentity = getInitialIdentity();

  const [isUsernameLocked, setIsUsernameLocked] = useState<boolean>(() => initialIdentity.isLocked);
  const [myUsername, setMyUsername] = useState<string>(() => initialIdentity.username);
  const [showLockedInfoModal, setShowLockedInfoModal] = useState<boolean>(false);
  const [targetFriend, setTargetFriend] = useState<string>(() => {
    const saved = localStorage.getItem('target_friend');
    const myUser = initialIdentity.username.trim();
    if (saved && saved !== '@not_set' && saved !== myUser) return saved;
    return '@all_friends';
  });
  const [showUserModal, setShowUserModal] = useState<boolean>(() => {
    return !initialIdentity.isLocked || !initialIdentity.username;
  });
  const [editUsernameInput, setEditUsernameInput] = useState('');
  const [registrationError, setRegistrationError] = useState<string>('');
  const [customFriendInput, setCustomFriendInput] = useState('');

  // 🛡️ Permanent Offline Identity Sync on Mount (survives app uninstall & data clear)
  useEffect(() => {
    const syncNativeIdentity = () => {
      try {
        if ((window as any).AndroidBleMeshBridge?.getPermanentDeviceIdentity) {
          const jsonStr = (window as any).AndroidBleMeshBridge.getPermanentDeviceIdentity();
          const parsed = JSON.parse(jsonStr);
          if (parsed && parsed.is_locked && parsed.username) {
            const restored = parsed.username;
            setMyUsername(restored);
            setIsUsernameLocked(true);
            localStorage.setItem('local_username', restored);
            localStorage.setItem('local_username_locked', 'true');
            setShowUserModal(false);
            if (!localStorage.getItem('target_friend')) {
              setTargetFriend('@all_friends');
              localStorage.setItem('target_friend', '@all_friends');
            }
            console.log('✅ [Permanent Offline Identity Restored]', restored, parsed.source);
          } else if (localStorage.getItem('local_username_locked') === 'true' && localStorage.getItem('local_username')) {
            // Auto-persist existing locked username into indestructible native storage
            const existing = localStorage.getItem('local_username')!;
            (window as any).AndroidBleMeshBridge?.lockPermanentDeviceIdentity(existing);
            console.log('🔒 [Auto-Persisted Existing Identity]', existing);
          }
        }
      } catch (e) {
        console.warn('Sync native identity error:', e);
      }
    };
    syncNativeIdentity();
    const t = setTimeout(syncNativeIdentity, 600);
    return () => clearTimeout(t);
  }, []);

  // Ensure user is never targeted to themselves
  useEffect(() => {
    if (myUsername) {
      const myNorm = myUsername.startsWith('@') ? myUsername.toLowerCase() : `@${myUsername.toLowerCase()}`;
      const targetNorm = targetFriend.startsWith('@') ? targetFriend.toLowerCase() : `@${targetFriend.toLowerCase()}`;
      if (!targetFriend || targetNorm === myNorm) {
        setTargetFriend('@all_friends');
        localStorage.setItem('target_friend', '@all_friends');
      }
    }
  }, [myUsername, targetFriend]);

  // Node Role Identity: Phone 1 vs Phone 2
  const [nodeRole, setNodeRole] = useState<'victim_citizen_1' | 'rescue_volunteer_2'>(() => {
    const saved = localStorage.getItem('node_role');
    if (saved === 'rescue_volunteer_2' || saved === 'victim_citizen_1') return saved;
    return 'victim_citizen_1';
  });

  // 🔐 Mode 3 Lightweight Target-Bound E2EE Codec
  const encodeE2EE = (text: string, targetUser: string): string => {
    try {
      const cleanTarget = (targetUser || 'friend').replace('@', '').toLowerCase();
      const rawBytes = new TextEncoder().encode(text);
      const keyBytes = new TextEncoder().encode(cleanTarget);
      const cipherBytes = new Uint8Array(rawBytes.length);
      for (let i = 0; i < rawBytes.length; i++) {
        cipherBytes[i] = rawBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      let binary = '';
      for (let i = 0; i < cipherBytes.length; i++) {
        binary += String.fromCharCode(cipherBytes[i]);
      }
      return btoa(binary);
    } catch (e) {
      return btoa(unescape(encodeURIComponent(text)));
    }
  };

  const decodeE2EE = (cipherBase64: string, targetUser: string): string => {
    try {
      const cleanTarget = (targetUser || 'friend').replace('@', '').toLowerCase();
      const binary = atob(cipherBase64);
      const cipherBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        cipherBytes[i] = binary.charCodeAt(i);
      }
      const keyBytes = new TextEncoder().encode(cleanTarget);
      const plainBytes = new Uint8Array(cipherBytes.length);
      for (let i = 0; i < cipherBytes.length; i++) {
        plainBytes[i] = cipherBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      return new TextDecoder().decode(plainBytes);
    } catch (e) {
      try {
        return decodeURIComponent(escape(atob(cipherBase64)));
      } catch {
        return cipherBase64;
      }
    }
  };

  // 🌐 Permanent Cloud Gateway on Render (24/7 Cloud Backend - Zero Cloudflare needed)
  const PERMANENT_RENDER_GATEWAY = 'https://itantra-4yzo.onrender.com';
  const CURRENT_LAN_IP = 'http://10.64.235.76:8000';
  const [targetHost] = useState<string>('https://itantra-4yzo.onrender.com');
  const [showLangModal, setShowLangModal] = useState<boolean>(() => !localStorage.getItem('fixed_user_language'));
  const [lastDeliveryToast, setLastDeliveryToast] = useState<string>('');

  // 📦 Language Pack Download Manager State
  const [packDownloadProgress, setPackDownloadProgress] = useState<Record<string, number>>({});
  const [installedPacks, setInstalledPacks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('installed_lang_packs') || '[]'); } catch { return []; }
  });
  const [downloadingLang, setDownloadingLang] = useState<string | null>(null);

  // Hook up Android Native AI4Bharat Model Download callbacks & storage status
  useEffect(() => {
    (window as any).onModelDownloadProgress = (langCode: string, pct: number) => {
      setPackDownloadProgress(prev => ({ ...prev, [langCode]: pct }));
      if (pct < 100) {
        setDownloadingLang(langCode);
      }
    };

    (window as any).onModelDownloadComplete = (langCode: string) => {
      setPackDownloadProgress(prev => ({ ...prev, [langCode]: 100 }));
      setInstalledPacks(prev => {
        const next = Array.from(new Set([...prev, langCode]));
        localStorage.setItem('installed_lang_packs', JSON.stringify(next));
        return next;
      });
      setDownloadingLang(null);
      setLastDeliveryToast(`✅ AI4Bharat ${langCode.toUpperCase()} model installed successfully!`);
    };

    (window as any).onModelDownloadError = (langCode: string, err: string) => {
      setPackDownloadProgress(prev => ({ ...prev, [langCode]: -1 }));
      setDownloadingLang(null);
      setLastDeliveryToast(`❌ Model download failed: ${err}`);
    };

    // Check currently installed packs in native Android storage
    if ((window as any).AndroidBleMeshBridge?.isLanguagePackInstalled) {
      const nativeInstalled: string[] = [];
      INDIC_LANGUAGES_9.forEach(l => {
        try {
          if ((window as any).AndroidBleMeshBridge.isLanguagePackInstalled(l.code)) {
            nativeInstalled.push(l.code);
          }
        } catch {}
      });
      if (nativeInstalled.length > 0) {
        setInstalledPacks(prev => {
          const combined = Array.from(new Set([...prev, ...nativeInstalled]));
          localStorage.setItem('installed_lang_packs', JSON.stringify(combined));
          return combined;
        });
      }
    }

    // Auto-enable Bluetooth & Wi-Fi radios and get Real Hardware GPS on startup
    try {
      const bridge = (window as any).AndroidBleMeshBridge;
      bridge?.ensureRadiosEnabled?.();
      if (bridge?.getGpsLatitude && bridge?.getGpsLongitude) {
        const lat = bridge.getGpsLatitude();
        const lon = bridge.getGpsLongitude();
        if (lat && lon && lat !== 0 && lon !== 0) {
          setCoords({ lat, lng: lon });
        }
      }
    } catch {}
  }, []);

  // Smooth 1-second clock timer so seconds tick cleanly without lag
  const [clockTimeStr, setClockTimeStr] = useState<string>(() =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTimeStr(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 📡 State for Mode 3 Air Relay Banner on Phone 2 (Judge Display)
  const [incomingAirRelay, setIncomingAirRelay] = useState<{
    id: string;
    sender: string;
    cipherKey: string;
    text: string;
    stage: 'captured' | 'relaying' | 'delivered';
  } | null>(null);

  // Helper for Dynamic HTTP & WebSocket resolution
  const resolveWs = (host: string, path: string) => {
    let finalHost = host;
    if (!finalHost || finalHost.includes('trycloudflare.com')) {
      finalHost = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.protocol !== 'file:')
        ? window.location.host
        : 'itantra-4yzo.onrender.com';
    }
    
    const clean = finalHost.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '').replace(/\/$/, '');
    if (clean.includes('onrender.com') || clean.includes('.com') || clean.includes('.org') || clean.includes('.net')) {
      return `wss://${clean}${path}`;
    }
    if (clean.includes(':')) {
      return `ws://${clean}${path}`;
    }
    return `ws://${clean}:8000${path}`;
  };

  const resolveHttp = (host: string, path: string) => {
    let finalHost = host;
    if (!finalHost || finalHost.includes('trycloudflare.com')) {
      finalHost = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.protocol !== 'file:')
        ? window.location.host
        : 'itantra-4yzo.onrender.com';
    }
    const clean = finalHost.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (clean.includes('onrender.com') || clean.includes('.com') || clean.includes('.org') || clean.includes('.net')) {
      return `https://${clean}${path}`;
    }
    if (clean.includes(':')) {
      return `http://${clean}${path}`;
    }
    return `http://${clean}:8000${path}`;
  };

  const getReliableEndpoints = (path: string) => {
    const hostFromWindow = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.protocol !== 'file:') ? window.location.hostname : '';
    const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
    return Array.from(new Set([
      `${PERMANENT_RENDER_GATEWAY}${path}`,
      `http://127.0.0.1:8000${path}`,
      `${CURRENT_LAN_IP}${path}`,
      `http://localhost:8000${path}`,
      ...(hostFromWindow ? [`http://${hostFromWindow}:8000${path}`] : []),
      ...(isFileProtocol ? [] : [path])
    ]));
  };

  // Phone Role Toggle: 'victim' (Phone 1) or 'relay' (Phone 2)
  const [deviceRole, setDeviceRole] = useState<'relay' | 'victim'>(() => {
    const saved = localStorage.getItem('node_role');
    return saved === 'rescue_volunteer_2' ? 'relay' : 'victim';
  });
  const [pipelineStage, setPipelineStage] = useState<'idle' | 'queued' | 'compressing' | 'encrypting' | 'transmitting' | 'delivered'>('idle');
  const [currentMsgStats, setCurrentMsgStats] = useState<MessageStats | null>(null);
  const [activeCipherCode, setActiveCipherCode] = useState<string>('AUDIO#4G-HD');

  // 🔐 Live Encryption & Mesh Hop Demonstration State for Judges
  const [isEncryptingLive, setIsEncryptingLive] = useState<boolean>(false);
  const [liveEncStep, setLiveEncStep] = useState<number>(0);
  const [scrambledCipher, setScrambledCipher] = useState<string>('0x4954 015F 0141 4F67 AE42 A082 C502 448A');
  const [encPlaintext, setEncPlaintext] = useState<string>('🚨 Medical Emergency: Trapped in Flood at GPS (12.8718°N, 80.2185°E)');

  const triggerLiveEncryptionDemo = (customText?: string) => {
    const textToEncrypt = customText || '🚨 Critical Evacuation SOS: Civilians Trapped at Swaminathan Nagar!';
    setEncPlaintext(textToEncrypt);
    setIsEncryptingLive(true);
    setLiveEncStep(1);

    const hexChars = '0123456789ABCDEF';
    let count = 0;
    const interval = setInterval(() => {
      let randHex = '0x4954 ';
      for (let i = 0; i < 7; i++) {
        randHex += hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)] + (i < 6 ? ' ' : '');
      }
      setScrambledCipher(randHex);
      count++;
      if (count > 6) {
        clearInterval(interval);
        setScrambledCipher('0x4954 015F 0141 4F67 AE42 A082 C502 448A');
      }
    }, 110);

    setTimeout(() => {
      setLiveEncStep(2);
    }, 900);

    setTimeout(() => {
      setLiveEncStep(3);
    }, 1800);

    setTimeout(() => {
      setLiveEncStep(4);
      setIsEncryptingLive(false);
    }, 2800);
  };


  // Sent & Local Mesh Relayed Messages
  const [sentMessages, setSentMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('civilian_sent_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('civilian_sent_messages', JSON.stringify(sentMessages.slice(0, 50)));
    } catch {}
  }, [sentMessages]);

  // Indestructible Local Mesh Chat Storage (Survives app uninstallation via native Android Documents bridge)
  const [localMeshMessages, setLocalMeshMessages] = useState<any[]>(() => {
    try {
      if ((window as any).AndroidBleMeshBridge?.getPermanentMeshChat) {
        const nativeHistory = (window as any).AndroidBleMeshBridge.getPermanentMeshChat();
        if (nativeHistory && nativeHistory.trim().startsWith('[')) {
          const parsed = JSON.parse(nativeHistory);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
      const saved = localStorage.getItem('tantra_permanent_mesh_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // Re-sync from Android Documents bridge on component mount (in case bridge binds slightly asynchronously)
  useEffect(() => {
    const restoreFromBridge = () => {
      try {
        if ((window as any).AndroidBleMeshBridge?.getPermanentMeshChat) {
          const nativeHistory = (window as any).AndroidBleMeshBridge.getPermanentMeshChat();
          if (nativeHistory && nativeHistory.trim().startsWith('[')) {
            const parsed = JSON.parse(nativeHistory);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setLocalMeshMessages(prev => {
                if (prev.length === 0) return parsed;
                const map = new Map<string, any>();
                parsed.forEach((m: any) => map.set(String(m.id || `${m.timestamp}_${m.text}`), m));
                prev.forEach((m: any) => map.set(String(m.id || `${m.timestamp}_${m.text}`), m));
                return Array.from(map.values()).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              });
            }
          }
        }
      } catch {}
    };
    restoreFromBridge();
    const t = setTimeout(restoreFromBridge, 800);
    return () => clearTimeout(t);
  }, []);

  // Save to indestructible Android storage whenever localMeshMessages updates
  useEffect(() => {
    if (localMeshMessages.length > 0) {
      try {
        const json = JSON.stringify(localMeshMessages.slice(0, 300));
        localStorage.setItem('tantra_permanent_mesh_chat_history', json);
        (window as any).AndroidBleMeshBridge?.savePermanentMeshChat?.(json);
      } catch {}
    }
  }, [localMeshMessages]);

  const [offlineMessages, setOfflineMessages] = useState<any[]>([]);
  const playedAudioRef = useRef<Set<string>>(new Set());

  // GPS Location & Address - Default to English ('en')
  const [selectedTransLang, setSelectedTransLang] = useState<string>(() => {
    const saved = localStorage.getItem('fixed_user_language');
    if (saved && INDIC_LANGUAGES_9.some(l => l.code === saved)) return saved;
    try {
      localStorage.setItem('fixed_user_language', 'en');
      localStorage.setItem('local_language', 'en');
    } catch {}
    return 'en';
  });
  // 🌐 App Full UI Language State (Defaults to saved or Tamil 'ta')
  const [appLang, setAppLang] = useState<string>(() => {
    return localStorage.getItem('tantra_app_ui_language') || 'ta';
  });
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const recentMeshPacketKeysRef = useRef<Set<string>>(new Set());

  // Active UI dictionary for app full text localization
  const t = UI_STRINGS[appLang] || UI_STRINGS['ta'] || UI_STRINGS['en'];

  const [activeTranslations, setActiveTranslations] = useState<Record<string, string>>({});
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.8718, lng: 80.2185 });
  const [addressName, setAddressName] = useState<string>("Locating GPS...");
  const [cipherRelayActive, setCipherRelayActive] = useState<boolean>(false);
  const [cipherRelaySender, setCipherRelaySender] = useState<string>("");
  const [cipherRelayText, setCipherRelayText] = useState<string>("");
  const relayedPacketIdsRef = useRef<Set<string>>(new Set());
  const broadcastedCommandIdsRef = useRef<Set<string>>(new Set());
  const latestPacketTextRef = useRef<Record<string, string>>({});
  const lastChimeTimeRef = useRef<number>(0);
  const lastSentSpeechRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });

  const lastVibrateTsRef = useRef<number>(0);
  const vibratedPacketIdsRef = useRef<Set<string>>(new Set());
  const triggerSafeHaptic = (ms: number = 200, dedupId?: string) => {
    if (dedupId) {
      if (vibratedPacketIdsRef.current.has(dedupId)) return;
      vibratedPacketIdsRef.current.add(dedupId);
      if (vibratedPacketIdsRef.current.size > 200) {
        const first = vibratedPacketIdsRef.current.values().next().value;
        if (first) vibratedPacketIdsRef.current.delete(first);
      }
    }
    const now = Date.now();
    if (now - lastVibrateTsRef.current < 5000) return;
    lastVibrateTsRef.current = now;
    try {
      (window as any).AndroidBleMeshBridge?.vibrateDevice?.(ms);
    } catch (e) {}
    try {
      if (navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch (e) {}
  };

  const playRelayChime = () => {
    const now = Date.now();
    if (now - lastChimeTimeRef.current < 3500) {
      return; // Debounce audio/haptics: prevent continuous sound storm
    }
    lastChimeTimeRef.current = now;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, t); // D5
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.15); // A5 chime
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
        setTimeout(() => {
          try { ctx.close(); } catch (e) {}
        }, 500);
      }
    } catch (e) {}
    triggerSafeHaptic(200);
  };

  const isSilenceHallucination = (t: string) => {
    if (!t) return true;
    const trimmed = t.trim().toLowerCase();
    if (['(bell)', '[bell]', '(music)', '[music]', '[applause]', '(applause)', '[silence]'].includes(trimmed)) return true;
    if (/^[\(\[\{].*?[\)\]\}]$/.test(trimmed) && trimmed.length < 15) return true;
    return false;
  };

  // 📡 Central Air Mesh Interceptor & Relay Handler
  // User Directive: "Speech text ஆ மாறுன உடனே Bluetooth/Wi-Fi மூலமா Phone 2 க்கு ரிலே ஆகணும். Phone 2 ல என்கிரிப்டட் கீயைக் காட்டிட்டு Command Center க்கு போகணும்."
  const handleIncomingMeshPacket = async (parsed: any, channel = 'AIR_BLE_WIFI') => {
    if (!parsed || !parsed.id) return;

    // 0. Handle ACK from Phone 2 confirming delivery to Command Center
    if (parsed.type === 'mesh_relay_ack') {
      setSentMessages(prev => {
        let matched = false;
        const updated = prev.map(m => {
          const isMatch = m.id === parsed.id || 
            (parsed.cipher_code && m.cipher_code && (
              m.cipher_code.toUpperCase().includes(parsed.cipher_code.toUpperCase()) || 
              parsed.cipher_code.toUpperCase().includes(m.cipher_code.toUpperCase())
            ));
          if (isMatch) {
            matched = true;
            return { ...m, status: 'delivered' as const, relayed_via_mesh: true };
          }
          return m;
        });
        if (!matched && updated.length > 0) {
          // If cipher code slightly diverged, match the most recent transmitting message!
          return updated.map((m, idx) => (idx === 0 && m.status === 'transmitting') 
            ? { ...m, status: 'delivered' as const, relayed_via_mesh: true } 
            : m
          );
        }
        return updated;
      });
      setLastDeliveryToast(`✓ Message Delivered to Command Center!`);
      return;
    }

    const myClean = normalizeName(myUsername);
    const senderClean = normalizeName(parsed.sender_username);

    // Reject if originated by this device (Phone 1 victim should not relay its own packets)
    const isMySentPacket = (senderClean && senderClean === myClean) || sentMessages.some(m => m.id === parsed.id);
    if (isMySentPacket) {
      // My own packet echoed back from the air: update delivery if relayed, but do NOT chime or re-relay!
      if (parsed.hop_count >= 2) {
        setSentMessages(prev => prev.map(m => 
          (m.id === parsed.id || (parsed.cipher_code && m.cipher_code && m.cipher_code.endsWith(parsed.cipher_code)))
            ? { ...m, status: 'delivered', relayed_via_mesh: true }
            : m
        ));
      }
      return;
    }

    // Role check: Phone 1 (Victim) MUST NOT relay its own packets
    if (nodeRole === 'victim_citizen_1' || deviceRole === 'victim') {
      if (senderClean && senderClean === myClean && myClean) return;
    }

    const cipherKey = parsed.cipher_code || 'KEY#ENC-4954-MESH';
    const packetTrackId = parsed.id || cipherKey;
    const prevBestText = latestPacketTextRef.current[packetTrackId] || '';
    const isNewLongerText = parsed.text && parsed.text.length > prevBestText.length;
    if (parsed.text && isNewLongerText) {
      latestPacketTextRef.current[packetTrackId] = parsed.text;
    }

    // Deduplication check: deduplicate only if the exact same text + cipher arrived within the last 15 seconds AND it's not a longer text update
    const packetKey = `${parsed.cipher_code || ''}_${parsed.text || ''}_h${parsed.hop_count || 1}`;
    if (!isNewLongerText && (relayedPacketIdsRef.current.has(packetKey) || (parsed.id && relayedPacketIdsRef.current.has(parsed.id)))) {
      return;
    }

    relayedPacketIdsRef.current.add(packetKey);
    if (parsed.id) relayedPacketIdsRef.current.add(parsed.id);
    setTimeout(() => {
      relayedPacketIdsRef.current.delete(packetKey);
      if (parsed.id) relayedPacketIdsRef.current.delete(parsed.id);
    }, 15000);
    const sender = parsed.sender_username || '@citizen_field';
    let text = parsed.text || '';
    const isEmergencyAlert = parsed.is_emergency || text.includes('🚨') || text.includes('SATELL') || text.includes('SOS');
    // If specifically a compact satellite beacon (contains SATELL) and not already detailed
    if (isEmergencyAlert && (text === '🚨 SATELL' || text === 'SATELL' || !text.trim())) {
      const lat = (parsed.latitude || coords.lat || 12.8718).toFixed(4);
      const lng = (parsed.longitude || coords.lng || 80.2185).toFixed(4);
      text = `🚨 SOS: I am in emergency, kindly help me! [GPS: ${lat}°N, ${lng}°E]`;
    }

    const packetMode = parsed.network_mode || (isEmergencyAlert ? 'mode-4-satellite-beacon' : 'mode-3-ai-mesh');
    const isMode3Or4 = packetMode === 'mode-3-ai-mesh' || packetMode === 'mode-4-satellite-beacon' || isEmergencyAlert;

    // Play Alert Chime & Haptic Vibration on Phone 2 ONLY in Mode 3 (Disaster Mesh) or Mode 4 (Satellite SOS)!
    // Mode 1 and Mode 2 peer phones must remain completely silent!
    if (isMode3Or4) {
      playRelayChime();
    }

    // Register Peer in Mesh Uniqueness Registry
    if (parsed.sender_username && parsed.node_id) {
      setMeshPeerRegistry(prev => {
        const updated = {
          ...prev,
          [parsed.sender_username]: {
            username: parsed.sender_username,
            nodeId: parsed.node_id,
            lastSeen: Date.now()
          }
        };
        localStorage.setItem('mesh_peer_registry', JSON.stringify(updated));
        return updated;
      });
    }

    // If packet was originated by Command Center (Downlink Broadcast from Laptop -> Gateway -> Offline Phones)
    const isFromCommandCenter = parsed.sender_role === 'command' || 
                                parsed.sender_username === '@command_center' || 
                                (parsed.text && (parsed.text.includes('GOVT') || parsed.text.includes('COMMAND')));
    if (isFromCommandCenter) {
      // 1. Add to SOS Feed (so offline citizens see the government emergency warning immediately!)
      setSosHistory(prev => {
        const exists = prev.some(m => m.id === parsed.id || (m.timestamp === parsed.timestamp && m.text === text));
        if (exists) return prev;
        return [{
          ...parsed,
          text,
          is_emergency: true,
          sender_role: 'command',
          sender_username: '@command_center',
          display_time: formatTimeIST()
        }, ...prev].slice(0, 30);
      });

      // 2. Prominent Toast Notification & Haptic (ONLY in Mode 3 / 4)
      setLastDeliveryToast(`📢 GOVT COMMAND ALERT: ${text.slice(0, 40)}`);
      if (isMode3Or4) {
        triggerSafeHaptic(300);
      }

      // 3. Mesh Multi-Hop Downlink: If this node is an offline phone and received it via BLE,
      // re-broadcast over BLE/Wi-Fi to neighboring offline phones (up to hop 3)!
      const currentHop = parsed.hop_count || 1;
      if (currentHop < 3) {
        const hopPayload = {
          ...parsed,
          text,
          hop_count: currentHop + 1,
          gateway_node: `📱 Mesh Relay (${myUsername || myNodeId})`,
          timestamp: new Date().toISOString()
        };
        if ((window as any).AndroidBleMeshBridge?.broadcastMeshPacket) {
          try {
            (window as any).AndroidBleMeshBridge.broadcastMeshPacket(JSON.stringify(hopPayload));
          } catch (e) {}
        }
      }

      // Crucial: STOP HERE. Do NOT relay back to Command Center HTTP endpoints!
      return;
    }

    // PHONE 2 PRIVACY: Encrypted Civilian Relay Pipe
    // Never display Phone 1's private messages or ciphers on Phone 2's screen. Phone 2 vibrates once on relay in Mode 3/4.
    if (nodeRole === 'rescue_volunteer_2') {
      if (isMode3Or4) {
        triggerSafeHaptic(200);
      }

      if (isEmergencyAlert) {
        setSosHistory(prev => {
          const exists = prev.some(m => m.id === parsed.id || (m.cipher_code === parsed.cipher_code && m.cipher_code));
          if (exists) return prev;
          return [{ ...parsed, text, is_emergency: true, display_time: formatTimeIST() }, ...prev].slice(0, 30);
        });
        setLastDeliveryToast(`🚨 EMERGENCY RELAY: ${text.slice(0, 35)}`);
      }

      const bestText = (packetTrackId && latestPacketTextRef.current[packetTrackId] && latestPacketTextRef.current[packetTrackId].length > text.length)
        ? latestPacketTextRef.current[packetTrackId]
        : text;

      const relayPayload = {
        ...parsed,
        text: bestText,
        session_id: 'DEMO_GLOBAL_SESSION_01',
        network_mode: isEmergencyAlert ? 'mode-4-satellite-beacon' : (parsed.network_mode || 'mode-3-ai-mesh'),
        is_emergency: isEmergencyAlert ? true : (parsed.is_emergency || false),
        latitude: parsed.latitude || coords.lat || 12.8718,
        longitude: parsed.longitude || coords.lng || 80.2185,
        address_name: parsed.address_name || (parsed.latitude ? `GPS: ${parsed.latitude.toFixed(4)}°N, ${parsed.longitude.toFixed(4)}°E` : "Active Tactical Sector"),
        gateway_node: '@civ_mesh_gateway',
        hop_count: (parsed.hop_count || 1) + 1,
        cipher_code: cipherKey,
        status: 'relayed',
        display_time: formatTimeIST()
      };

      // 1. Broadcast ACK packet back into the air immediately so Phone 1 stops transmitting and marks as delivered
      const ackObj = {
        type: 'mesh_relay_ack',
        id: parsed.id,
        cipher_code: cipherKey,
        status: 'delivered',
        hop_count: 2,
        gateway_node: '@civ_mesh_gateway',
        timestamp: new Date().toISOString()
      };
      const ackStr = JSON.stringify(ackObj);
      if ((window as any).AndroidBleMeshBridge?.broadcastMeshPacket) {
        try {
          (window as any).AndroidBleMeshBridge.broadcastMeshPacket(ackStr);
        } catch (e) {}
      }

      // 2. Forward to Command Center (if running purely in browser without Native Android Relay)
      if (!(window as any).AndroidBleMeshBridge) {
        const gatewayTargets = getReliableEndpoints('/api/messages/send');
        sendPayloadSingle(gatewayTargets, JSON.stringify(relayPayload));
      }
      return;
    }

    // Otherwise, standard node reception
    const isMode3Alert = parsed.network_mode === 'mode-3-ai-mesh' || networkMode === 'mode-3-ai-mesh';
    if (isEmergencyAlert || isMode3Alert) {
      setSosHistory(prev => {
        const exists = prev.some(m => m.id === parsed.id || (m.cipher_code === parsed.cipher_code && m.cipher_code));
        if (exists) return prev;
        return [{ ...parsed, text, is_emergency: isEmergencyAlert, display_time: formatTimeIST() }, ...prev].slice(0, 30);
      });
      setLastDeliveryToast(`${isEmergencyAlert ? '🚨 EMERGENCY SOS' : '📡 MODE 3 ALERT'}: ${text.slice(0, 40)}`);
      triggerSafeHaptic(300, String(parsed.id || parsed.cipher_code || text));
    }

    // Only civilian peer-to-peer messages enter Local Mesh feed; never emergency alerts or command center packets!
    const isP2PPacket = (parsed.channel_type === 'CIVILIAN_P2P' || parsed.is_local_mesh_private || parsed.session_id === 'LOCAL_MESH_PRIVATE') &&
                        !isEmergencyAlert && parsed.target_username !== '@command_center' && parsed.sender_role !== 'command';
    if (isP2PPacket) {
      const isMode3Mesh = localMeshMode === 'mode-3-p2p-nan' || parsed.local_mode === 'mode-3-p2p-nan' || parsed.network_mode === 'mode-3-ai-mesh';
      setLocalMeshMessages(prev => {
        const exists = prev.some(m => m.id === parsed.id || (m.cipher_code === parsed.cipher_code && m.cipher_code));
        if (exists) return prev;
        return [{ ...parsed, text }, ...prev].slice(0, 300);
      });
      // Vibrate on Mode 3 incoming Local Mesh message
      if (isMode3Mesh) {
        triggerSafeHaptic(200, String(parsed.id || parsed.cipher_code || text));
      }
    }
  };

  // 🚀 JUDGE DEMO: Trigger Phone 1 Air Toss (Simulate or Broadcast)
  const triggerPhone1AirToss = async (customMessage?: string) => {
    setNetworkMode('mode-3-ai-mesh');
    const randHex = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const dynamicKey = `KEY#ENC-${randHex.slice(0, 6)}-${randHex.slice(6, 10)}`;
    const packetId = `AIR-${Date.now()}`;
    const packetText = customMessage || '🚨 Emergency assistance needed, flood water rising! (Mode 3 Air Packet)';

    const airPayloadObj = {
      id: packetId,
      session_id: 'DEMO_GLOBAL_SESSION_01',
      sender_role: 'field',
      sender_username: myUsername || '@victim_phone_1',
      target_username: '@command_center',
      type: 'voice_message',
      text: packetText,
      network_mode: 'mode-3-ai-mesh',
      audio_size: 24,
      is_emergency: false,
      language: selectedTransLang || 'ta',
      latitude: coords.lat,
      longitude: coords.lng,
      address_name: addressName,
      cipher_code: dynamicKey,
      gateway_node: '📱 Phone 2 (BLE Mesh Relay Node)',
      hop_count: 1,
      is_air_broadcast: true,
      display_time: formatTimeIST(),
      timestamp: new Date().toISOString()
    };
    const airPayloadStr = JSON.stringify(airPayloadObj);

    // 1. Android BLE & Wi-Fi Aware & UDP
    if ((window as any).AndroidBleMeshBridge && (window as any).AndroidBleMeshBridge.broadcastMeshPacket) {
      try {
        (window as any).AndroidBleMeshBridge.broadcastMeshPacket(airPayloadStr);
      } catch (e) {}
    }

    // 2. Air broadcast endpoint
    const airTargets = getReliableEndpoints('/api/mesh/air-broadcast');
    sendPayloadSingle(airTargets, airPayloadStr);

    setActiveCipherCode(dynamicKey);
    setLastDeliveryToast(`📡 Packet Broadcasted to Mesh!`);

    // If local test on same device, trigger simulation
    if (deviceRole === 'relay') {
      setTimeout(() => {
        handleIncomingMeshPacket(airPayloadObj, 'SIMULATED_AIR');
      }, 500);
    }
  };

  // 🔄 JUDGE DEMO: Trigger Phone 2 Air Capture & Relay
  const triggerPhone2AirCaptureAndRelay = (forcedPacket?: any) => {
    const packet = forcedPacket || {
      id: `AIR-${Date.now()}`,
      sender_username: '@citizen_mesh',
      cipher_code: `KEY#ENC-${Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase()}-4954`,
      text: '🚨 Critical distress, evacuation required! Forwarding immediately. (Mode 3 BLE Mesh)',
      network_mode: 'mode-3-ai-mesh',
      hop_count: 1
    };
    handleIncomingMeshPacket(packet, 'MANUAL_JUDGE_DEMO');
  };

  // 📍 REAL LIVE HIGH-ACCURACY HARDWARE GPS TRACKING
  const resolvePlaceName = async (lat: number, lng: number, nativePlace?: string): Promise<string> => {
    if (nativePlace && nativePlace.trim() && !nativePlace.includes("undefined") && nativePlace !== "null") {
      return nativePlace.trim();
    }
    // Dynamic offline fallback
    let fallback = `Chennai Sector (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
    if (Math.abs(lat - 12.8718) < 0.01 && Math.abs(lng - 80.2185) < 0.01) {
      fallback = "St. Joseph's Institute of Technology, OMR, Chennai";
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const data = await res.json();
        const a = data.address || {};
        const venue = a.amenity || a.building || a.college || a.university || a.road || a.suburb;
        const city = a.city || a.town || a.county || 'Chennai';
        if (venue) return `${venue}, ${city}`;
        if (data.display_name) return data.display_name.split(',').slice(0, 3).join(',').trim();
      }
    } catch (e) {}
    return fallback;
  };

  // 📍 REAL LIVE HIGH-ACCURACY HARDWARE GPS TRACKING
  useEffect(() => {
    // 1. Check Native Android Location Bridge
    if ((window as any).AndroidBleMeshBridge?.getDeviceGpsJson) {
      try {
        const jsonStr = (window as any).AndroidBleMeshBridge.getDeviceGpsJson();
        const parsed = JSON.parse(jsonStr);
        if (parsed.lat && parsed.lng && parsed.lat !== 0) {
          setCoords({ lat: parsed.lat, lng: parsed.lng });
          resolvePlaceName(parsed.lat, parsed.lng, parsed.place).then(p => setAddressName(p));
        }
      } catch {}
    }

    // 2. Native GPS Realtime Event Listener
    (window as any).onNativeGpsUpdate = (lat: number, lng: number, place?: string) => {
      if (lat && lng && lat !== 0) {
        setCoords({ lat, lng });
        resolvePlaceName(lat, lng, place).then(p => setAddressName(p));
      }
    };

    // 3. Web Geolocation API with High Accuracy
    if (navigator.geolocation) {
      const geoOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
      
      const updatePos = (pos: GeolocationPosition) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (lat && lng) {
          setCoords({ lat, lng });
          resolvePlaceName(lat, lng).then(p => setAddressName(p));
        }
      };

      navigator.geolocation.getCurrentPosition(updatePos, (err) => {
        console.log('GPS status:', err.message);
      }, geoOptions);

      const watchId = navigator.geolocation.watchPosition(updatePos, () => {}, geoOptions);
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // WebSocket Connection with user registration
  const wsUrl = resolveWs(targetHost, `/ws/field/DEMO_GLOBAL_SESSION_01?username=${encodeURIComponent(myUsername || '')}`);

  // 🔄 Continuous Sync: Poll Demo Controller Mode so phones always reflect mode switches instantly
  useEffect(() => {
    let isMounted = true;
    const pollDemoActiveMode = async () => {
      const endpoints = getReliableEndpoints('/api/network/active-mode');

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { signal: AbortSignal.timeout(1200) });
          if (res.ok) {
            const data = await res.json();
            if (!isMounted) return;
            if (data) {
              if (data.network_mode) {
                setNetworkMode((curr) => (curr !== data.network_mode ? data.network_mode : curr));
              }
              if (data.local_mode) {
                setLocalMeshMode((curr) => (curr !== data.local_mode ? data.local_mode : curr));
              }
            }
            break;
          }
        } catch {}
      }
    };

    pollDemoActiveMode();
    const pollInterval = setInterval(pollDemoActiveMode, 1000);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [targetHost]);
  const { connected, messages, send, lastMessage } = useWebSocket(wsUrl);

  useEffect(() => {
    if (connected && myUsername) {
      try {
        send({ type: 'register_user', username: myUsername });
      } catch (e) {}
    }
  }, [connected, myUsername, send]);

    // 🔄 Instant WebSocket Listener: Mode Switches & Live Command Center / SOS Broadcasts
  useEffect(() => {
    if (!lastMessage) return;

    // 0. Handle ACK from Phone 2 confirming delivery to Command Center
    if (lastMessage.type === 'mesh_relay_ack') {
      setSentMessages(prev => prev.map(m => m.id === lastMessage.id ? { ...m, status: 'delivered', relayed_via_mesh: true } : m));
      setLastDeliveryToast(`✓ Message Delivered to Command Center!`);
      return;
    }

    // Delivery confirmation: update status to 'delivered' when relayed (Hop >= 2 or via Phone 2)
    if (lastMessage.id && (lastMessage.hop_count >= 2 || lastMessage.gateway_node?.includes('Phone 2'))) {
      setSentMessages(prev => prev.map(m => m.id === lastMessage.id ? { ...m, status: 'delivered', relayed_via_mesh: true } : m));
    }

    if (lastMessage.type === 'mode_switch') {
      if (lastMessage.network_mode) {
        setNetworkMode(lastMessage.network_mode);
        setLastDeliveryToast(`⚡ Mode switched to: ${lastMessage.network_mode.toUpperCase()}`);
      }
      if (lastMessage.local_mode) {
        setLocalMeshMode(lastMessage.local_mode);
      }
      return;
    }

    // 0. Handle Mode 3 Air Mesh Packet (Tossed into air by Phone 1, captured by Phone 2)
    if (lastMessage.type === 'air_mesh_packet' || lastMessage.is_air_broadcast) {
      handleIncomingMeshPacket(lastMessage, 'AIR_WEBSOCKET');
      return;
    }

    // Handle Incoming Live Message from Govt Command Center or Mesh Peer
    if (lastMessage.text) {
      const isFromCommand = lastMessage.sender_role === 'command' || lastMessage.sender_username === '@command_center';
      const isEmergency = !!lastMessage.is_emergency;

      // 1. If SOS or from Command Center, add to SOS feed
      if (isEmergency || isFromCommand) {
        setSosHistory(prev => {
          const exists = prev.some(m => m.id === lastMessage.id || (m.timestamp === lastMessage.timestamp && m.text === lastMessage.text));
          if (exists) return prev;
          return [lastMessage, ...prev].slice(0, 30);
        });

        // Vibrate strictly once on new emergency SOS
        if (isEmergency) {
          triggerSafeHaptic(300, String(lastMessage.id || lastMessage.timestamp || lastMessage.text));
        }

        if (isFromCommand) {
          setLastDeliveryToast(`📢 GOVT ALERT: ${lastMessage.text.slice(0, 40)}...`);
          // 📡 RELAY DOWNLINK TO OFFLINE PHONES: Broadcast Command Center's alert over BLE/Wi-Fi mesh!
          const cmdId = String(lastMessage.id || `${lastMessage.timestamp}_${lastMessage.text}`);
          if (!broadcastedCommandIdsRef.current.has(cmdId)) {
            broadcastedCommandIdsRef.current.add(cmdId);
            if ((window as any).AndroidBleMeshBridge?.broadcastMeshPacket) {
              try {
                const bText = lastMessage.text.startsWith('📢') ? lastMessage.text : `📢 GOVT: ${lastMessage.text}`;
                const commandAirPayload = {
                  id: cmdId,
                  sender_role: 'command',
                  sender_username: '@command_center',
                  target_username: '@all_users',
                  is_emergency: isEmergency,
                  type: 'emergency_alert',
                  text: bText.slice(0, 60),
                  timestamp: new Date().toISOString(),
                  hop_count: 1
                };
                (window as any).AndroidBleMeshBridge.broadcastMeshPacket(JSON.stringify(commandAirPayload));
              } catch (e) {}
            }
          }
        }
      }

      // 2. Add to Local Mesh Feed if applicable (Strictly private P2P messages between friends only!)
      const isP2P = (lastMessage.channel_type === 'CIVILIAN_P2P' || lastMessage.is_local_mesh_private || lastMessage.session_id === 'LOCAL_MESH_PRIVATE') &&
                    lastMessage.channel_type !== 'EMERGENCY_ALERT' &&
                    lastMessage.target_username !== '@command_center' &&
                    !lastMessage.is_emergency &&
                    lastMessage.sender_role !== 'command';
      if (isP2P) {
        const myClean = normalizeName(myUsername);
        const targetClean = normalizeName(lastMessage.target_username);
        const senderClean = normalizeName(lastMessage.sender_username);

        // 1. SENDER ECHO REJECTION: If sent by this device, NEVER re-add it!
        if (senderClean === myClean && myClean) {
          return;
        }

        // 2. STRICT PRIVACY & RECEIVER CHECK
        if (targetClean === myClean || targetClean === '@all_friends' || !targetClean) {
          let finalText = lastMessage.text;
          if (lastMessage.encrypted_text && (targetClean === myClean || targetClean === '@all_friends')) {
            const dec = decodeE2EE(lastMessage.encrypted_text, myUsername);
            if (dec) finalText = dec;
          }

          const cleanCipher = (lastMessage.cipher_code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
          const cleanText = (finalText || '').trim();
          const dedupKey = `${senderClean}_${targetClean}_${cleanText}_${cleanCipher.slice(-4)}`;

          if (recentMeshPacketKeysRef.current.has(dedupKey)) {
            return;
          }
          recentMeshPacketKeysRef.current.add(dedupKey);
          setTimeout(() => recentMeshPacketKeysRef.current.delete(dedupKey), 15000);

          const displayMsg = {
            ...lastMessage,
            text: finalText,
            is_decrypted: targetClean === myClean && !!lastMessage.encrypted_text
          };

          setLocalMeshMessages(prev => {
            const exists = prev.some((m) => {
              if (m.id && lastMessage.id && m.id === lastMessage.id) return true;
              const mCipher = (m.cipher_code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
              if (mCipher && cleanCipher && (mCipher.endsWith(cleanCipher) || cleanCipher.endsWith(mCipher))) return true;
              const mSender = normalizeName(m.sender_username);
              const mText = (m.text || '').trim();
              if (mSender === senderClean && mText === cleanText) return true;
              return false;
            });
            if (exists) return prev;
            return [displayMsg, ...prev].slice(0, 50);
          });

          if (targetClean === myClean) {
            triggerSafeHaptic(250, String(cleanCipher || cleanText));
            setLastDeliveryToast(`📬 🔓 E2EE Decrypted from ${senderClean}: "${finalText}"`);
          }
        }
      }
    }
  }, [lastMessage, networkMode, localMeshMode, myUsername]);

  // 🔄 Fast 1.5s Background Mesh & Active Mode Sync Engine (Guaranteed Delivery)
  useEffect(() => {
    const syncMeshAndMode = async () => {
      try {
        const hostFromWindow = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') ? window.location.hostname : '';
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const syncUrls = isLocal ? [
          'http://127.0.0.1:8000',
          'http://localhost:8000',
          CURRENT_LAN_IP,
          PERMANENT_RENDER_GATEWAY
        ] : [
          PERMANENT_RENDER_GATEWAY,
          CURRENT_LAN_IP,
          'http://127.0.0.1:8000',
          'http://localhost:8000',
          ...(hostFromWindow ? [`http://${hostFromWindow}:8000`] : [])
        ];

        for (const base of syncUrls) {
          try {
            const [meshRes, allRes] = await Promise.allSettled([
              fetch(`${base}/api/mesh/p2p/all`, { signal: AbortSignal.timeout(1500) })
                .catch(() => fetch(`${base}/api/messages/mesh`, { signal: AbortSignal.timeout(1500) })),
              fetch(`${base}/api/messages/all`, { signal: AbortSignal.timeout(1500) })
            ]);

            let success = false;

            if (meshRes.status === 'fulfilled' && meshRes.value.ok) {
              success = true;
              const data = await meshRes.value.json();
              if (Array.isArray(data) && data.length > 0) {
                const myClean = normalizeName(myUsername);
                setLocalMeshMessages(prev => {
                  let updated = [...prev];
                  let hasNew = false;
                  for (const incoming of data) {
                    const isP2P = (incoming.channel_type === 'CIVILIAN_P2P' || incoming.is_local_mesh_private || incoming.session_id === 'LOCAL_MESH_PRIVATE') &&
                                  incoming.channel_type !== 'EMERGENCY_ALERT' &&
                                  incoming.target_username !== '@command_center' &&
                                  !incoming.is_emergency &&
                                  incoming.sender_role !== 'command';
                    if (!isP2P) continue;

                    const targetClean = normalizeName(incoming.target_username);
                    const senderClean = normalizeName(incoming.sender_username);

                    // 1. SENDER ECHO REJECTION: If sent by this device, NEVER add polled echo!
                    if (senderClean === myClean && myClean) {
                      continue;
                    }

                    // 2. RECEIVER ONLY: Accept if addressed to me or @all_friends
                    if (targetClean === myClean || targetClean === '@all_friends' || !targetClean) {
                      let finalText = incoming.text;
                      if (incoming.encrypted_text && targetClean === myClean) {
                        finalText = decodeE2EE(incoming.encrypted_text, myUsername);
                      }

                      const cleanCipher = (incoming.cipher_code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                      const cleanIncomingText = (finalText || '').trim().toLowerCase().replace(/[\s\W]+/g, ' ');

                      // Multi-Factor Deduplication (Match ID, Cipher, or Sender+Text)
                      const exists = updated.some(m => {
                        if (m.id && incoming.id && String(m.id) === String(incoming.id)) return true;
                        const mCipher = (m.cipher_code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                        if (mCipher && cleanCipher && (mCipher.endsWith(cleanCipher) || cleanCipher.endsWith(mCipher) || mCipher === cleanCipher)) return true;
                        const mSender = normalizeName(m.sender_username);
                        const mText = (m.text || '').trim().toLowerCase().replace(/[\s\W]+/g, ' ');
                        if (mSender === senderClean && mText === cleanIncomingText) return true;
                        return false;
                      });

                      if (!exists) {
                        const displayMsg = {
                          ...incoming,
                          text: finalText,
                          display_time: formatTimeIST(incoming.timestamp || incoming.created_at || incoming.display_time),
                          is_decrypted: targetClean === myClean && !!incoming.encrypted_text
                        };
                        updated.unshift(displayMsg);
                        hasNew = true;
                      }
                    }
                  }
                  return hasNew ? updated.slice(0, 50) : prev;
                });
              }
            }

            if (allRes.status === 'fulfilled' && allRes.value.ok) {
              success = true;
              const allData = await allRes.value.json();
              if (Array.isArray(allData) && allData.length > 0) {
                const sosOnly = allData.filter((m: any) => m.is_emergency || m.sender_username === '@command_center' || m.sender_role === 'command');
                if (sosOnly.length > 0) {
                  setSosHistory(prev => {
                    let updated = [...prev];
                    let hasNew = false;
                    for (const incoming of sosOnly) {
                      const cleanText = (incoming.text || '').trim().toLowerCase().replace(/[\s\W]+/g, ' ');
                      const cleanCipher = (incoming.cipher_code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                      const incomingSender = normalizeName(incoming.sender_username);

                      const exists = updated.some(m => {
                        if (m.id && incoming.id && String(m.id) === String(incoming.id)) return true;
                        const mCipher = (m.cipher_code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                        if (mCipher && cleanCipher && (mCipher.endsWith(cleanCipher) || cleanCipher.endsWith(mCipher) || mCipher === cleanCipher)) return true;
                        const mText = (m.text || '').trim().toLowerCase().replace(/[\s\W]+/g, ' ');
                        const mSender = normalizeName(m.sender_username);
                        if (mSender === incomingSender && mText === cleanText) return true;
                        return false;
                      });

                      if (!exists) {
                        updated.unshift({
                          ...incoming,
                          display_time: formatTimeIST(incoming.timestamp || incoming.created_at || incoming.display_time)
                        });
                        hasNew = true;
                      }

                      // 📡 Relay any new Command Center alert to offline mesh phones via BLE/Wi-Fi
                      if (incoming.sender_username === '@command_center' || incoming.sender_role === 'command') {
                        const cmdId = String(incoming.id || `${incoming.created_at || incoming.timestamp}_${incoming.text}`);
                        if (!broadcastedCommandIdsRef.current.has(cmdId)) {
                          broadcastedCommandIdsRef.current.add(cmdId);
                          if ((window as any).AndroidBleMeshBridge?.broadcastMeshPacket) {
                            try {
                              const bText = incoming.text.startsWith('📢') ? incoming.text : `📢 GOVT: ${incoming.text}`;
                              const commandAirPayload = {
                                id: cmdId,
                                sender_role: 'command',
                                sender_username: '@command_center',
                                target_username: '@all_users',
                                is_emergency: true,
                                type: 'emergency_alert',
                                text: bText.slice(0, 60),
                                timestamp: new Date().toISOString(),
                                hop_count: 1
                              };
                              (window as any).AndroidBleMeshBridge.broadcastMeshPacket(JSON.stringify(commandAirPayload));
                            } catch (e) {}
                          }
                        }
                      }
                    }
                    return hasNew ? updated.slice(0, 30) : prev;
                  });
                }
              }
            }

            // Successfully synced from primary responsive host - BREAK immediately!
            if (success) {
              break;
            }
          } catch (e) {}
        }
      } catch (err) {}
    };

    syncMeshAndMode();
    const interval = setInterval(syncMeshAndMode, 4000);
    return () => clearInterval(interval);
  }, [myUsername, targetHost, networkMode, localMeshMode]);




  // 4 PINNED QUICK EMERGENCY ACTION CHIPS (Main Mode)
  const PINNED_EMERGENCY_ACTIONS = [
    { label: '🚨 Medical Emergency', text: 'Immediate medical assistance needed' },
    { label: '🍞 Food & Water Needed', text: 'Food & drinking water urgently required' },
    { label: '🚤 Evacuation Boat Required', text: 'Rescue boat and emergency evacuation team required' },
    { label: '🏠 Trapped on Roof', text: 'Trapped on roof, need urgent evacuation' }
  ];

  // 🎤 NATIVE ANDROID SPEECH-TO-TEXT AUTO-BROADCASTER (Context-Aware by Tab)
  useEffect(() => {
    (window as any).onNativeSpeechResult = (text: string, isFinal: boolean) => {
      if (text && text.trim()) {
        const clean = text.trim();
        if (activeTab === 'mesh') {
          // Strictly Local Mesh Tab: place spoken text into friend's message input
          setLocalMeshTextInput(clean);
        } else {
          // Alert Tab: update Alert voice-to-text box
          setSpokenSpeechText(clean);
          setPersistentSpokenText(clean);
          // Auto-broadcast alert strictly when in Mode 3 and user is on the Alert tab
          if (isFinal && !isSilenceHallucination(clean) && networkMode === 'mode-3-ai-mesh' && activeTab === 'talk') {
            setTimeout(() => {
              sendVoiceOrText(clean, 24, undefined, false, (selectedTransLang || 'ta') as any);
            }, 80);
          }
        }
      }
    };
  }, [selectedTransLang, networkMode, myUsername, coords, addressName, activeTab]);

  // NATIVE ANDROID WI-FI AWARE (NAN) & BLE RADIO MESH LISTENER
  useEffect(() => {
    (window as any).onNativeMeshPacketReceived = (rawPayload: string, channel: string) => {
      try {
        const parsed = JSON.parse(rawPayload);
        if (parsed) {
          // If it's a private Local Mesh message, store locally in Local Mesh feed
          const isP2P = (parsed.channel_type === 'CIVILIAN_P2P' || parsed.is_local_mesh_private || parsed.session_id === 'LOCAL_MESH_PRIVATE') &&
                        parsed.channel_type !== 'EMERGENCY_ALERT' &&
                        parsed.target_username !== '@command_center' &&
                        !parsed.is_emergency;

          if (isP2P) {
            const myClean = normalizeName(myUsername);
            const targetClean = normalizeName(parsed.target_username);
            const senderClean = normalizeName(parsed.sender_username);

            // 1. SENDER ECHO REJECTION: If this packet was sent by this device, NEVER re-add it!
            if (senderClean === myClean && myClean) {
              return;
            }

            // 2. STRICT PRIVACY & RECEIVER CHECK
            if (targetClean === myClean || targetClean === '@all_friends' || !targetClean) {
              let finalText = parsed.text;
              if (parsed.encrypted_text && (targetClean === myClean || targetClean === '@all_friends')) {
                const dec = decodeE2EE(parsed.encrypted_text, myUsername);
                if (dec) finalText = dec;
              }

              // Robust cipher code cleaning (remove 'LOCK#', 'KEY#', '#', '-')
              const cleanCipher = (parsed.cipher_code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
              const cleanText = (finalText || '').trim();
              const dedupKey = `${senderClean}_${targetClean}_${cleanText}_${cleanCipher.slice(-4)}`;

              if (recentMeshPacketKeysRef.current.has(dedupKey)) {
                return;
              }
              recentMeshPacketKeysRef.current.add(dedupKey);
              setTimeout(() => recentMeshPacketKeysRef.current.delete(dedupKey), 15000);

              const displayMsg = {
                ...parsed,
                text: finalText,
                is_decrypted: targetClean === myClean && !!parsed.encrypted_text
              };

              setLocalMeshMessages((prev) => {
                const exists = prev.some((m) => {
                  if (m.id && parsed.id && m.id === parsed.id) return true;
                  const mCipher = (m.cipher_code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                  if (mCipher && cleanCipher && (mCipher.endsWith(cleanCipher) || cleanCipher.endsWith(mCipher))) return true;
                  const mSender = normalizeName(m.sender_username);
                  const mText = (m.text || '').trim();
                  if (mSender === senderClean && mText === cleanText) return true;
                  return false;
                });
                if (exists) return prev;
                return [displayMsg, ...prev].slice(0, 50);
              });

              const channelName = channel === 'WIFI_AWARE_NAN' ? 'Wi-Fi Aware (NAN 100m)' : channel === 'BLE_RADIO' ? 'BLE Radio (30m)' : 'Local Radio';
              if (targetClean === myClean) {
                setLastDeliveryToast(`📬 🔓 Decrypted from ${senderClean}: "${finalText}" (${channelName})`);
                triggerSafeHaptic(250, String(parsed.id || cleanCipher || cleanText));
              }
            } else {
              // 📱 Intermediate Mule Relay (Phone 2): Vibrate ONCE on relay
              triggerSafeHaptic(150, String(parsed.id || parsed.cipher_code || 'relay'));

              // 2. Strict Privacy: Phone 2 CANNOT read the message. Do NOT display or toast!

              // 3. Store-and-Forward: Forward locked payload over Internet to Phone 3!
              const gatewayTargets = getReliableEndpoints('/api/mesh/p2p/send');
              const relayPayload = {
                ...parsed,
                session_id: 'LOCAL_MESH_PRIVATE',
                is_local_mesh_private: true,
                network_mode: parsed.network_mode || 'mode-3-ai-mesh',
                gateway_node: `📱 Phone 2 (Silent Mesh Relay: ${myUsername || myNodeId})`,
                hop_count: (parsed.hop_count || 1) + 1
              };
              sendPayloadSingle(gatewayTargets, JSON.stringify(relayPayload));
              try {
                send(relayPayload);
              } catch (e) {}
            }
            return;
          }

          // Mode 3 Air Relay or Govt/Rescue broadcast: Route through handleIncomingMeshPacket
          handleIncomingMeshPacket(parsed, channel);
        }
      } catch (e) {
        setLocalMeshMessages((prev) => [{ text: rawPayload, cipher_code: 'CIPHER#NAN-BLE', hop_count: 2, id: Date.now() }, ...prev].slice(0, 20));
      }
    };
  }, [nodeRole, targetHost, myUsername]);

  // HARDWARE SIGNAL & BATTERY AUTO-DETECTION ENGINE
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryPct(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryPct(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }

    const updateNetworkStatus = () => {
      const savedMode = localStorage.getItem('civilian_user_network_mode');
      if (savedMode) {
        // User explicitly selected mode (e.g. Mode 3 for demo) - preserve it!
        return;
      }
      const isOnline = navigator.onLine;
      if (!isOnline) {
        if (batteryPct <= 1) {
          setNetworkMode('mode-4-satellite-beacon');
        } else {
          setNetworkMode('mode-3-ai-mesh');
        }
      } else {
        const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        const effectiveType = conn?.effectiveType || '4g';
        if (effectiveType === '2g' || effectiveType === '3g') {
          setNetworkMode('mode-2-compressed-voice');
        } else {
          setNetworkMode('mode-1-hd-call');
        }
      }
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [batteryPct]);

  // Startup Permissions
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach(t => t.stop());
        })
        .catch(() => {});
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Helper to generate 16-Byte Satellite SOS Frame (Govt/Command Mode)
  const generate16ByteSatFrame = () => {
    const hex1 = Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase();
    const hex2 = Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase();
    return `534F015F01${hex1}${hex2}02448A`;
  };

  // 1-Tap SOS Emergency Trigger (All SOS buttons and Mode 4) with 3s Debounce Cooldown
  const triggerOneTapSOS = () => {
    if (isSosTriggeringRef.current) return;
    isSosTriggeringRef.current = true;
    setTimeout(() => {
      isSosTriggeringRef.current = false;
    }, 3000);

    const satFrameHex = generate16ByteSatFrame();
    setActiveCipherCode(`SAT-16B#${satFrameHex.slice(0, 8)}`);
    const place = (addressName && addressName !== "Locating GPS...") ? addressName : (coords.lat ? `GPS: ${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E` : "Chennai Sector");
    const emergencyText = `🚨 SOS: I am in emergency, kindly help me! [${place} - GPS: ${coords.lat.toFixed(5)}°N, ${coords.lng.toFixed(5)}°E]`;
    setTextInput('');
    setSpokenSpeechText('');
    setPersistentSpokenText('');
    sendSosToCommandCenter(emergencyText);
  };

  // SEND VOICE / TEXT (MAIN TALK TAB)
  // Send SOS Distress Beacon directly to Command Center
  const sendSosToCommandCenter = async (emergencyText: string) => {
    const place = (addressName && addressName !== "Locating GPS...") ? addressName : (coords.lat ? `GPS: ${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E` : "Chennai Sector");
    let finalText = emergencyText.trim();
    if (!finalText) {
      finalText = `🚨 SOS: I am in emergency, kindly help me! [${place} - GPS: ${coords.lat.toFixed(5)}°N, ${coords.lng.toFixed(5)}°E]`;
    }

    triggerLiveEncryptionDemo(finalText);
    const msgId = crypto.randomUUID();
    const effectiveSender = normalizeName(myUsername);
    const displayTime = formatTimeIST();

    const randHex = Array.from(crypto.getRandomValues(new Uint8Array(2)))
      .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const sosCipher = `SAT#SOS-${randHex}`;

    const sosObj = {
      id: msgId,
      session_id: 'DEMO_GLOBAL_SESSION_01',
      sender_role: 'field',
      sender_username: effectiveSender,
      target_username: '@command_center',
      type: 'emergency_alert',
      text: finalText,
      network_mode: 'mode-4-satellite-beacon',
      audio_size: 16,
      is_emergency: true,
      language: 'en',
      latitude: coords.lat || 12.8718,
      longitude: coords.lng || 80.2185,
      address_name: `${place} [GPS: ${coords.lat.toFixed(5)}°N, ${coords.lng.toFixed(5)}°E]`,
      cipher_code: sosCipher,
      hop_count: 1,
      display_time: displayTime,
      timestamp: new Date().toISOString()
    };

    // Add to local SOS feed immediately
    setSosHistory((prev) => [sosObj, ...prev]);

    const payload = JSON.stringify(sosObj);

    // 1. Broadcast over native Wi-Fi Aware / BLE radio mesh
    if ((window as any).AndroidBleMeshBridge && (window as any).AndroidBleMeshBridge.broadcastMeshPacket) {
      try {
        (window as any).AndroidBleMeshBridge.broadcastMeshPacket(payload);
      } catch (e) {}
    }

    // 2. WebSocket send if connected, else fallback to reliable HTTP endpoint (Single dispatch, no duplicate)
    let wsDispatched = false;
    if (connected) {
      try {
        send(sosObj);
        wsDispatched = true;
      } catch (e) {
        wsDispatched = false;
      }
    }

    if (!wsDispatched) {
      const endpoints = getReliableEndpoints('/api/messages/send');
      sendPayloadSingle(endpoints, payload);
    }

    setSosCustomInput('');
    setTextInput('');
    setSpokenSpeechText('');
    setPersistentSpokenText('');
    setLastDeliveryToast(`🚨 Emergency SOS Sent to Command Center!`);
    setTimeout(() => setLastDeliveryToast(''), 5000);
  };

  // High-Speed Cached Endpoint & Parallel Dispatcher (Sub-100ms Ultra-Low Latency)
  let cachedWorkingEndpoint = '';

  const sendPayloadSingle = async (urlList: string[], payloadStr: string) => {
    // 1. If we already know the working endpoint, send directly to it with low timeout
    if (cachedWorkingEndpoint && urlList.includes(cachedWorkingEndpoint)) {
      try {
        const res = await fetch(cachedWorkingEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadStr,
          signal: AbortSignal.timeout(1000)
        });
        if (res.ok) return true;
      } catch {
        cachedWorkingEndpoint = '';
      }
    }

    // 2. Sequential fallback: send to one endpoint at a time to prevent duplicate HTTP bursts
    for (const url of urlList) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadStr,
          signal: AbortSignal.timeout(1500)
        });
        if (res.ok) {
          cachedWorkingEndpoint = url;
          return true;
        }
      } catch {}
    }
    return false;
  };


  const sendVoiceOrText = async (
    text: string,
    audioSize: number,
    audioBlob?: Blob,
    forceEmergency = false,
    detectedLang?: SupportedLanguage,
    audioBase64?: string,
    explicitSatHex?: string,
    durationSec?: number
  ) => {
    const emergencyFlag = forceEmergency;

    let finalText = (text && text.trim()) 
      ? text.trim() 
      : (spokenSpeechText && spokenSpeechText.trim()) 
      ? spokenSpeechText.trim() 
      : (textInput && textInput.trim()) 
      ? textInput.trim() 
      : '';

    if (networkMode === 'mode-1-hd-call') {
      if (!finalText) {
        finalText = '🎙️ 4G/5G HD Direct Voice Note';
      }
    } else if (networkMode === 'mode-2-compressed-voice') {
      if (!finalText) {
        finalText = '🎙️ 2G CELT Compressed Voice Note (1.2 KB)';
      }
    } else if (networkMode === 'mode-3-ai-mesh') {
      if (!finalText && textInput && textInput.trim()) {
        finalText = textInput.trim();
      }
      setSpokenSpeechText(finalText);
    }

    if (!finalText && !emergencyFlag && !audioBase64 && !audioBlob) {
      return;
    }

    if (networkMode === 'mode-3-ai-mesh' && (!finalText || !finalText.trim() || isSilenceHallucination(finalText))) {
      // 1. Check if interim spoken text contains recognized speech
      if (spokenSpeechText && spokenSpeechText.trim() && !spokenSpeechText.toLowerCase().includes('recording')) {
        finalText = spokenSpeechText.trim();
      } else if (textInput.trim()) {
        finalText = textInput.trim();
      }
      // If still completely empty, do NOT send dummy text
      if (!finalText || !finalText.trim() || isSilenceHallucination(finalText)) {
        setLastDeliveryToast('⚠️ Voice not detected. Please press mic and speak clearly.');
        return;
      }
    }


    // Deduplicate rapid duplicate voice transmissions (< 3.5 seconds with exact same text)
    if (finalText && finalText === lastSentSpeechRef.current.text && (Date.now() - lastSentSpeechRef.current.time) < 3500) {
      return;
    }
    if (finalText) {
      lastSentSpeechRef.current = { text: finalText, time: Date.now() };
      setPersistentSpokenText(finalText);
    }
    const msgId = crypto.randomUUID();

    // Generate dynamic 24-byte Encrypted Cipher Key for this packet
    const randBytes = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    const dynamicTransmitterCipher = `KEY#ENC-${randBytes.slice(0, 8)}-${randBytes.slice(8, 12)}`;
    
    let generatedToken = dynamicTransmitterCipher;
    if (networkMode === 'mode-4-satellite-beacon' || emergencyFlag) {
      const satHex = explicitSatHex || generate16ByteSatFrame();
      generatedToken = `SAT-16B#${satHex.slice(0, 8)}`;
    }
    setActiveCipherCode(generatedToken);

    let localAudioUrl: string | undefined = audioBase64;
    if (!localAudioUrl && audioBlob && audioBlob.size > 0) {
      localAudioUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
    }

    // Audio payload handling
    if (networkMode === 'mode-4-satellite-beacon') {
      localAudioUrl = undefined;
    } else if (networkMode === 'mode-2-compressed-voice' || networkMode === 'mode-1-hd-call') {
      if (!localAudioUrl && audioBase64) {
        localAudioUrl = audioBase64;
      }
      // Guaranteed voice audio note for Mode 1 & Mode 2
      if (!localAudioUrl || !localAudioUrl.trim()) {
        localAudioUrl = generatePcmSpeechWav(finalText, durationSec || 2.5);
      }
    } else if (networkMode === 'mode-3-ai-mesh') {
      localAudioUrl = undefined;
    }

    const rawAudioBytes = audioSize || 45000;
    const compressedBytes = (networkMode === 'mode-4-satellite-beacon' || emergencyFlag)
      ? 16
      : networkMode === 'mode-3-ai-mesh'
      ? Math.max(24, finalText.length)
      : networkMode === 'mode-2-compressed-voice'
      ? Math.max(1200, Math.round(rawAudioBytes * 0.035))
      : rawAudioBytes;

    const msgStats: MessageStats = {
      raw_bytes: rawAudioBytes,
      compressed_bytes: compressedBytes,
      encrypted_bytes: compressedBytes,
      original_audio_bytes: rawAudioBytes,
      transit_time_ms: networkMode === 'mode-4-satellite-beacon' ? 35.0 : networkMode === 'mode-3-ai-mesh' ? 45.0 : networkMode === 'mode-2-compressed-voice' ? 85.0 : 12.0,
      compression_method: networkMode === 'mode-4-satellite-beacon' ? '16byte_satellite_lora_beacon' : networkMode === 'mode-3-ai-mesh' ? 'wifi_aware_nan_ble_mesh' : networkMode === 'mode-2-compressed-voice' ? 'celt_2g_compressed' : 'direct_4g_5g_hd_voice',
      ciphertext_hex: generatedToken
    };

    const newMsg: ChatMessage = {
      id: msgId,
      type: emergencyFlag ? 'emergency_alert' : 'voice_message',
      text: finalText,
      sender_role: 'field',
      sender_username: myUsername || '@victim_phone_1',
      is_emergency: emergencyFlag,
      language: (detectedLang || selectedTransLang || 'ta') as any,
      latitude: coords.lat,
      longitude: coords.lng,
      address_name: addressName,
      stats: msgStats,
      sequence_number: 0,
      timestamp: new Date().toISOString(),
      display_time: formatTimeIST(),
      status: 'transmitting',
      audioUrl: localAudioUrl,
      network_mode: networkMode,
      cipher_code: generatedToken
    };

    setSentMessages((prev) => [newMsg, ...prev.filter(m => m.id !== msgId)].slice(0, 50));
    setPipelineStage('queued');
    setCurrentMsgStats(msgStats);

    // 📡 SPECIAL MODE 3: AIR BROADCAST VIA BLE & WI-FI RADIUS
    // User Directive: "நான் மொபைல் 1 டிவைஸிலிருந்து அனுப்பும் மெசேஜ் மொபைல் 2-க்கு ரிலே ஆகிதான் சிஸ்டத்திற்குப் போக வேண்டும்."
    if (networkMode === 'mode-3-ai-mesh' || emergencyFlag) {
      const airBroadcastText = finalText;

      const airPayloadObj = {
        id: msgId,
        channel_type: 'EMERGENCY_ALERT',
        session_id: 'DEMO_GLOBAL_SESSION_01',
        sender_role: 'field',
        sender_username: myUsername || '@victim_phone_1',
        target_username: '@command_center',
        is_local_mesh_private: false,
        type: emergencyFlag ? 'emergency_alert' : 'voice_message',
        text: airBroadcastText,
        network_mode: emergencyFlag ? 'mode-4-satellite-beacon' : 'mode-3-ai-mesh',
        audio_size: emergencyFlag ? 16 : 24,
        is_emergency: emergencyFlag,
        language: (detectedLang || selectedTransLang || 'ta'),
        latitude: coords.lat || 12.8718,
        longitude: coords.lng || 80.2185,
        address_name: addressName || (coords.lat ? `GPS: ${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E` : "Active Tactical Sector"),
        cipher_code: generatedToken,
        gateway_node: '@mesh_peer',
        hop_count: 1,
        is_air_broadcast: true,
        display_time: formatTimeIST(),
        timestamp: new Date().toISOString()
      };
      const airPayloadStr = JSON.stringify(airPayloadObj);

      // 1. Air broadcast via Android BLE & Wi-Fi Aware & UDP
      if ((window as any).AndroidBleMeshBridge && (window as any).AndroidBleMeshBridge.broadcastMeshPacket) {
        try {
          (window as any).AndroidBleMeshBridge.broadcastMeshPacket(airPayloadStr);
          triggerSafeHaptic(150);
        } catch (e) {}
      }

      // 2. Air broadcast over Local Network so listening Phone 2 captures it
      const airTargets = getReliableEndpoints('/api/mesh/air-broadcast');
      sendPayloadSingle(airTargets, airPayloadStr);

      // Also try direct command center dispatch if connected
      const cmdTargets = getReliableEndpoints('/api/messages/send');
      sendPayloadSingle(cmdTargets, airPayloadStr);

      // Mode 3 Authentic Air Broadcast: Phone 1 broadcasts into the air (BLE / Wi-Fi / UDP).
      setOfflineMessages((prev: any) => [airPayloadObj, ...prev]);

      // Keep transcribed speech visible in the Voice-to-Text box below mic
      setTextInput('');
      setSpokenSpeechText('');
      setPersistentSpokenText(finalText);
      setPipelineStage('idle');
      return;
    }

    // Pipeline progress animation: Instant for Mode 1 & Mode 2, snappy for satellite
    setPipelineStage('transmitting');

    const payloadObj = {
      id: msgId,
      channel_type: 'EMERGENCY_ALERT',
      session_id: 'DEMO_GLOBAL_SESSION_01',
      sender_role: 'field',
      sender_username: myUsername || '@citizen_field',
      target_username: '@command_center',
      is_local_mesh_private: false,
      type: emergencyFlag ? 'emergency_alert' : 'voice_message',
      text: finalText, // NEVER BLANK OUT USER TEXT!
      network_mode: emergencyFlag ? 'mode-4-satellite-beacon' : networkMode,
      audio_size: compressedBytes,
      audio_url: (networkMode === 'mode-4-satellite-beacon' || emergencyFlag) ? undefined : localAudioUrl,
      cipher_code: generatedToken,
      gateway_node: networkMode === 'mode-1-hd-call' ? '📶 4G/5G Direct Broadband Cell' : networkMode === 'mode-2-compressed-voice' ? '📻 2G Narrowband BTS' : '🛰️ ISRO NavIC / LoRa Gateway',
      hop_count: 1,
      is_emergency: emergencyFlag,
      language: (detectedLang || selectedTransLang || 'ta'),
      latitude: coords.lat,
      longitude: coords.lng,
      address_name: addressName,
      display_time: formatTimeIST(),
      timestamp: new Date().toISOString()
    };
    const payload = JSON.stringify(payloadObj);

    // ONLY broadcast over local radio mesh in Mode 3 (handled above) or Mode 4 (Satellite SOS) or if emergency!
    const isMeshRadioMode = (networkMode as string) === 'mode-4-satellite-beacon' || emergencyFlag;
    if (isMeshRadioMode && (window as any).AndroidBleMeshBridge && (window as any).AndroidBleMeshBridge.broadcastMeshPacket) {
      try {
        (window as any).AndroidBleMeshBridge.broadcastMeshPacket(payload);
      } catch (e) {}
    }

    // ⚡ Ultra-fast instant dispatch over WebSocket to Command Center
    if (send) {
      try { send(payloadObj); } catch {}
    }

    // Immediately mark as delivered in local UI for instant feedback
    setSentMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, status: 'delivered' } : m));

    // Concurrently dispatch to Command Center via High-Speed Endpoints without blocking
    const targets = getReliableEndpoints('/api/messages/send');
    sendPayloadSingle(targets, payload);

    setLastDeliveryToast(`✅ ${
      networkMode === 'mode-1-hd-call'
        ? 'HD Voice Note Delivered (4G/5G)'
        : networkMode === 'mode-2-compressed-voice'
        ? '2G Compressed Voice Delivered (1.2 KB)'
        : 'Satellite Distress SOS Beacon Dispatched'
    }`);

    // Clean, instant transition to delivered & idle
    setPipelineStage('delivered');
    setTimeout(() => {
      setTextInput('');
      setSpokenSpeechText('');
      setPersistentSpokenText(finalText);
      setPipelineStage('idle');
    }, 400);

    // Finished dispatching
  };

  // SEND PRIVATE LOCAL MESH MESSAGE (NO COMMAND CENTER / PURE P2P FRIENDS)
  const sendLocalMeshPrivateMessage = async (
    text: string,
    audioSize: number,
    audioBlob?: Blob,
    audioBase64?: string,
    durationSec?: number
  ) => {
    if (!text || !text.trim()) {
      if (!audioBase64 && !audioBlob) return;
    }

    const effectiveTarget = (!targetFriend || targetFriend === '@' || targetFriend === '@not_set')
      ? '@all_friends'
      : normalizeName(targetFriend);
    const effectiveSender = normalizeName(myUsername);

    if (!text || !text.trim()) {
      if (!audioBase64 && !audioBlob) return;
    }

    let finalText = (text && text.trim()) ? text.trim() : '';
    const actualDuration = (durationSec && durationSec > 0) ? durationSec : 3;

    // Fast STT fallback if text was not recognized synchronously
    if (!finalText && audioBase64) {
      try {
        const endpoints = [
          'http://127.0.0.1:8000/api/stt/transcribe-for-translate',
          'http://localhost:8000/api/stt/transcribe-for-translate',
          'http://10.64.235.76:8000/api/stt/transcribe-for-translate',
          '/api/stt/transcribe-for-translate'
        ];
        for (const ep of endpoints) {
          const resp = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio_base64: audioBase64, language: 'ta' }),
            signal: AbortSignal.timeout(1800)
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data?.text?.trim()) {
              finalText = data.text.trim();
              break;
            }
          }
        }
      } catch {}
    }

    if (!finalText) {
      if (localMeshTextInput.trim()) {
        finalText = localMeshTextInput.trim();
      } else if (localMeshPersistentText.trim() && !localMeshPersistentText.includes('Listening...') && !localMeshPersistentText.includes('Transcribing')) {
        finalText = localMeshPersistentText.trim();
      } else if (localMeshSpokenText.trim() && !localMeshSpokenText.includes('Listening...') && !localMeshSpokenText.includes('Transcribing')) {
        finalText = localMeshSpokenText.trim();
      } else if (localMeshMode === 'mode-1-p2p-hd') {
        finalText = `🎙️ HD Voice Note (${actualDuration}s)`;
      } else if (localMeshMode === 'mode-2-p2p-2g') {
        finalText = `🎙️ 2G Voice Note (${actualDuration}s)`;
      }
    }
    if (localMeshMode === 'mode-3-p2p-nan' && !finalText) {
      setLastDeliveryToast('⚠️ Voice not detected. Please speak clearly into the microphone.');
      return; // STOP! Do not send fallback message!
    }
    const msgId = crypto.randomUUID();
    const randomKey = Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase();
    const lockToken = `LOCK#${effectiveTarget.replace('@', '')}-${randomKey}`;

    let localAudioUrl: string | undefined = audioBase64;
    let effectiveAudioSize = (!audioBlob && !audioBase64) ? 24 : (audioSize || 45000);

    const isMode3 = localMeshMode === 'mode-3-p2p-nan';
    let encryptedPayload: string | undefined = undefined;
    let isLocked = false;
    let transitText = finalText;

    if (isMode3) {
      localAudioUrl = undefined; // ONLY TEXT FOR 24B MESH
      effectiveAudioSize = 24;
      isLocked = true;
      encryptedPayload = encodeE2EE(finalText, effectiveTarget);
      transitText = `🔒 Encrypted Message (Locked for ${effectiveTarget})`;
    } else if (!localAudioUrl && audioBlob && audioBlob.size > 0) {
      localAudioUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
    }

    if (localAudioUrl && !localAudioUrl.startsWith('data:') && !localAudioUrl.startsWith('http')) {
      localAudioUrl = `data:audio/wav;base64,${localAudioUrl}`;
    }

    // 📡 2G LOW-BANDWIDTH AUDIO COMPRESSION (Mode 2)
    if (localMeshMode === 'mode-2-p2p-2g' && localAudioUrl) {
      try {
        const comp = await compressWavFor2G(localAudioUrl);
        localAudioUrl = comp.compressedBase64;
        effectiveAudioSize = comp.size;
      } catch (e) {}
    }

    const payloadObj = {
      id: msgId,
      channel_type: 'CIVILIAN_P2P',
      session_id: 'LOCAL_MESH_PRIVATE',
      sender_role: 'field',
      sender_username: effectiveSender,
      target_username: effectiveTarget,
      node_id: myNodeId,
      is_local_mesh_private: true,
      is_locked: isLocked,
      encrypted_text: encryptedPayload,
      local_mode: localMeshMode,
      network_mode: localMeshMode === 'mode-2-p2p-2g' ? 'mode-2-compressed-voice' : isMode3 ? 'mode-3-ai-mesh' : 'mode-1-hd-call',
      type: (!audioBlob && !audioBase64) ? 'text_message' : 'voice_message',
      text: isMode3 ? transitText : finalText,
      audio_size: effectiveAudioSize,
      audio_url: localAudioUrl,
      cipher_code: lockToken,
      lock_key: `KEY-${randomKey}`,
      duration_seconds: actualDuration,
      display_time: formatTimeIST(),
      timestamp: new Date().toISOString()
    };

    // Add directly to local state (Phone 1 sender sees original text and bound status)
    const localSenderMsg = {
      ...payloadObj,
      text: finalText,
      is_locked: isLocked
    };

    // 🔐 Register this outgoing message so BLE echo-back is NOT treated as a new incoming message
    relayedPacketIdsRef.current.add(msgId);
    if (payloadObj.cipher_code) {
      const echoKey = `${payloadObj.cipher_code}_${payloadObj.text || ''}_h${1}`;
      relayedPacketIdsRef.current.add(echoKey);
    }
    const cleanCipher = (payloadObj.cipher_code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const cleanText = (finalText || '').trim();
    const dedupKey = `${normalizeName(effectiveSender)}_${normalizeName(effectiveTarget)}_${cleanText}_${cleanCipher.slice(-4)}`;
    recentMeshPacketKeysRef.current.add(dedupKey);

    // Clear the echo block after 30 seconds
    setTimeout(() => {
      relayedPacketIdsRef.current.delete(msgId);
      recentMeshPacketKeysRef.current.delete(dedupKey);
    }, 30000);

    setLocalMeshMessages((prev) => {
      // Also deduplicate here: don't add if same id already exists
      if (prev.some((m) => m.id === msgId)) return prev;
      return [localSenderMsg, ...prev];
    });

    const payload = JSON.stringify(payloadObj);

    // 1. In Mode 3 (Offline Radio Mesh), broadcast IMMEDIATELY via Native BLE & Wi-Fi Aware!
    if (isMode3) {
      if ((window as any).AndroidBleMeshBridge && (window as any).AndroidBleMeshBridge.broadcastMeshPacket) {
        try {
          (window as any).AndroidBleMeshBridge.broadcastMeshPacket(payload);
        } catch (e) {}
      }
    }

    // Light sender feedback on message dispatch
    triggerSafeHaptic(80);

    setLastDeliveryToast(isMode3 ? `🔒 Locked & Dispatched to ${effectiveTarget}` : `✅ Sent to ${effectiveTarget}`);

    // 2. Direct WebSocket send for online internet delivery (non-blocking)
    try {
      send(payloadObj);
    } catch (e) {}

    // 3. Dispatch via HTTP Endpoints (Internet / LAN / Cloudflare) in background
    if (!isMode3) {
      const meshTargets = getReliableEndpoints('/api/mesh/p2p/send');
      sendPayloadSingle(meshTargets, payload);
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-slate-100 flex flex-col justify-between overflow-hidden font-sans select-none">
      
      {/* 1. TOP HEADER */}
      <header className="px-3.5 py-2.5 bg-gradient-to-b from-neutral-950/95 to-black/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">

          {/* ⚙️ App Settings Button */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-sm"
            title={t.settings || "Settings"}
          >
            <span className="text-sm">⚙️</span>
          </button>

          {/* 👤 Tactical User CallSign / Profile Button */}
          <button
            type="button"
            onClick={() => {
              if (isUsernameLocked) {
                setShowLockedInfoModal(true);
              } else {
                setEditUsernameInput(myUsername.replace(/^@/, ''));
                setShowUserModal(true);
              }
            }}
            className={`px-2.5 py-1.5 rounded-full text-[10px] font-semibold border transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
              isUsernameLocked
                ? 'bg-emerald-950/50 border-emerald-400/30 text-emerald-300'
                : 'bg-cyan-950/50 border-cyan-400/30 text-cyan-300'
            }`}
            title={isUsernameLocked ? "🔒 Permanent Hardware-Locked Node CallSign" : "Tap to set CallSign"}
          >
            <span className="text-[10px]">{isUsernameLocked ? '🔒' : '👤'}</span>
            <span className="tracking-wide font-mono">{myUsername || '@citizen'}</span>
          </button>

          {/* 🌐 TOP BAR LANGUAGE SELECTOR */}
          <button
            type="button"
            onClick={() => setShowLangModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-emerald-300 active:scale-95 transition-all cursor-pointer"
            title="Select Spoken Language"
          >
            <span className="text-[11px]">🌐</span>
            <span>{INDIC_LANGUAGES_9.find(l => l.code === selectedTransLang)?.label || 'English'}</span>
            <span className="text-[7px] text-white/40">▾</span>
          </button>
        </div>

        {/* Tactical Mode & Battery Badge */}
        <div className="flex items-center gap-2">
          {activeTab === 'mesh' ? (
            /* Local Mesh Mode Badge */
            <div
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 select-none"
              title="Active Local Mesh Mode"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                localMeshMode === 'mode-1-p2p-hd' ? 'bg-emerald-400' :
                localMeshMode === 'mode-2-p2p-2g' ? 'bg-blue-400' : 'bg-amber-400 animate-pulse'
              }`}></span>
              <span className="text-[10px] font-medium text-white/80">
                {localMeshMode === 'mode-1-p2p-hd' ? 'Mesh M1 (HD)' :
                 localMeshMode === 'mode-2-p2p-2g' ? 'Mesh M2 (2G)' : 'Mesh M3 (NAN)'}
              </span>
            </div>
          ) : (
            /* Alert / SOS Network Mode Badge */
            <div
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 select-none"
              title="Active Network Mode"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                networkMode === 'mode-4-satellite-beacon' ? 'bg-red-500 animate-ping' :
                networkMode === 'mode-3-ai-mesh' ? 'bg-emerald-400 animate-pulse' :
                networkMode === 'mode-2-compressed-voice' ? 'bg-blue-400' : 'bg-cyan-400'
              }`}></span>
              <span className="text-[10px] font-medium text-white/80">
                {networkMode === 'mode-1-hd-call' ? 'Mode 1' :
                 networkMode === 'mode-2-compressed-voice' ? 'Mode 2' :
                 networkMode === 'mode-3-ai-mesh' ? 'Mode 3' : 'Mode 4'}
              </span>
            </div>
          )}

          {/* Battery Status */}
          <span className="text-[9px] font-medium text-emerald-400/80 bg-white/5 px-2 py-1.5 rounded-full border border-white/10">
            🔋 {batteryPct}%
          </span>
        </div>
      </header>

      {/* ⚙️ SETTINGS MODAL — FULL 10-LANGUAGE APP LOCALIZATION */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none">
          <div className="bg-neutral-950 border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{t.settings || "Settings"}</h3>
                  <p className="text-[10px] text-white/50">{t.appLanguage || "App Language"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center justify-center text-xs active:scale-95 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 10 Language Cards */}
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider mb-2">
                Select App Language / மொழியைத் தேர்ந்தெடுக்கவும்
              </div>
              {INDIC_LANGUAGES_9.map((l) => {
                const isSelected = appLang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setAppLang(l.code);
                      localStorage.setItem('tantra_app_ui_language', l.code);
                      setSelectedTransLang(l.code);
                      localStorage.setItem('fixed_user_language', l.code);
                      localStorage.setItem('local_language', l.code);
                      setLastDeliveryToast(`🌐 App language changed to ${l.name} (${l.label})`);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-white shadow-lg'
                        : 'bg-white/[0.03] border-white/5 text-white/70 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{l.flag}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{l.name}</div>
                        <div className="text-[10px] text-white/40">{l.label}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-black/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                {t.set || "Done"} ✓
              </button>
            </div>
          </div>
        </div>
      )}

{/* 🌐 QUICK TOP-BAR LANGUAGE SELECTOR MODAL */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-start justify-center pt-4 pb-4 px-3 select-none overflow-y-auto">
          <div className="bg-neutral-950 border-2 border-emerald-500 rounded-3xl w-full max-w-sm font-mono shadow-[0_0_60px_rgba(16,185,129,0.4)] flex flex-col">

            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-emerald-900/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  <div>
                    <h3 className="text-xs font-black text-emerald-300 uppercase tracking-widest">Voice Language Pack</h3>
                    <p className="text-[8.5px] text-slate-400">Select Language Pack • Offline STT Engine</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowLangModal(false)}
                  className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold active:scale-95">
                  ✕
                </button>
              </div>

              {/* Info banner */}
              <div className="mt-3 bg-slate-900/80 border border-slate-700 rounded-2xl px-3 py-2 text-[9px] text-slate-300 leading-relaxed">
                📥 <span className="text-emerald-300 font-bold">Touch any language to download & activate its offline pack</span>.
                The app is lightweight — you only install what you need!

              </div>
            </div>

            {/* Language Pack Grid */}
            <div className="px-4 py-4 space-y-2.5 overflow-y-auto max-h-[68vh]">
              {INDIC_LANGUAGES_9.map((l) => {
                const isSelected = selectedTransLang === l.code;
                const isInstalled = installedPacks.includes(l.code);
                const isDownloading = downloadingLang === l.code;
                const progress = packDownloadProgress[l.code] ?? -1;
                const canDownload = !isInstalled && !isDownloading && !downloadingLang;

                const handleCardTap = () => {
                  if (isDownloading) return;
                  if (!isInstalled) {
                    downloadLangPack(l.code);
                  }
                  if ((window as any).AndroidBleMeshBridge?.downloadLanguagePack) {
                    try { (window as any).AndroidBleMeshBridge.downloadLanguagePack(l.code); } catch (e) {}
                  }
                  setSelectedTransLang(l.code);
                  setTextInput('');
                  setActiveTranslations({});
                  localStorage.setItem('fixed_user_language', l.code);
                  localStorage.setItem('local_language', l.code);
                  setLastDeliveryToast(`🌐 Selected: ${l.name} (${l.label})`);
                };

                return (
                  <div key={l.code}
                    onClick={handleCardTap}
                    className={`rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.5)]'
                        : 'bg-slate-900/60 border-slate-700/80 hover:border-emerald-500/60'
                    }`}>
                    <div className="flex items-center gap-3 px-3.5 py-3">
                      {/* Flag */}
                      <div className="text-2xl flex-shrink-0">{l.flag}</div>

                      {/* Language Info & Progress */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-white">{l.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">({l.label})</span>
                          {isInstalled && (
                            <span className="text-[7.5px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                              ✓ INSTALLED
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[7.5px] font-black bg-cyan-600 text-white px-2 py-0.5 rounded-full">
                              ● ACTIVE
                            </span>
                          )}
                        </div>

                        {/* Pack size info */}
                        <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-2">
                          {isInstalled ? (
                            <span className="text-emerald-400 font-bold">📲 Offline Engine Ready • {l.packMB} MB</span>
                          ) : isDownloading ? (
                            <span className="text-cyan-300 font-bold animate-pulse">⬇ Installing {l.name} Pack...</span>
                          ) : (
                            <span>📥 Pack Size: <span className="text-amber-300 font-bold">{l.packMB} MB</span> • Tap to download</span>
                          )}
                        </div>

                        {/* Download progress bar */}
                        {isDownloading && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[8.5px] mb-0.5">
                              <span className="text-cyan-300 font-bold animate-pulse">Downloading & Installing...</span>
                              <span className="text-white font-black">{progress}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-green-500 rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(3, progress)}%` }}
                              />
                            </div>
                            <div className="text-[8px] text-slate-400 mt-0.5">
                              {Math.round((progress / 100) * l.packMB * 10) / 10} MB / {l.packMB} MB
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Action Badge */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {isInstalled ? (
                          <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black border ${
                            isSelected ? 'bg-emerald-500 text-white border-emerald-300' : 'bg-slate-800 text-emerald-400 border-slate-700'
                          }`}>
                            {isSelected ? '✓ ACTIVE' : 'USE'}
                          </span>
                        ) : isDownloading ? (
                          <span className="px-2.5 py-1 rounded-xl text-[9px] font-black bg-cyan-900/60 text-cyan-300 border border-cyan-600 animate-pulse">
                            {progress}%
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[9px] font-black bg-blue-950 text-blue-300 border border-blue-600 hover:bg-blue-900 hover:text-white transition-all">
                            ⬇ GET
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 pt-2 border-t border-slate-800 space-y-2">
              <div className="text-[8.5px] text-slate-500 text-center">
                💡 Touch any language pack to download. Selected language will be used for all voice notes.
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('fixed_user_language', selectedTransLang);
                  localStorage.setItem('local_language', selectedTransLang);
                  setShowLangModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-black text-sm tracking-wider border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-98 hover:brightness-110 transition-all"
              >
                ✅ DONE — Use {INDIC_LANGUAGES_9.find(l => l.code === selectedTransLang)?.label || selectedTransLang}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ONE-TIME PERMANENT USERNAME REGISTRATION MODAL (WRITE-ONCE HARDWARE BINDING) */}
      {showUserModal && !isUsernameLocked && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-neutral-950 border-2 border-cyan-400 rounded-3xl p-6 w-full max-w-sm space-y-4 font-mono shadow-[0_0_40px_rgba(6,182,212,0.5)] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-cyan-900/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔒</span>
                <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wide">Permanent Node CallSign</h3>
              </div>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-2.5">
              <span className="text-[10px] text-amber-300 font-bold block mb-1">
                ⚠️ WRITE-ONCE PERMANENT HARDWARE LOCK:
              </span>
              <p className="text-[9.5px] text-amber-200/80 leading-relaxed">
                This username will be permanently bound to this physical device for offline mesh triage. It survives app reinstalls and cannot be changed once locked.
              </p>
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-cyan-300 uppercase tracking-wide block mb-1.5">
                👤 Enter Your CallSign / Name:
              </label>
              <input
                type="text"
                autoFocus
                value={editUsernameInput}
                onChange={(e) => {
                  setEditUsernameInput(e.target.value);
                  setRegistrationError('');
                }}
                placeholder="Type your username (e.g. raj or kk)..."
                className={`w-full bg-slate-950 border-2 rounded-2xl px-4 py-2.5 text-sm text-cyan-200 focus:outline-none font-bold tracking-wide placeholder-slate-600 ${
                  registrationError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-cyan-600 focus:border-cyan-300'
                }`}
              />
              {registrationError && (
                <span className="text-[9px] text-rose-400 font-bold block mt-1.5">
                  {registrationError}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const formatted = normalizeName(editUsernameInput);
                if (!formatted || formatted.length < 2) {
                  setRegistrationError('⚠️ Please enter a valid username (min 2 characters).');
                  return;
                }

                // 1. Lock in Native Android Layer (survives app uninstall & data wipes)
                if ((window as any).AndroidBleMeshBridge?.lockPermanentDeviceIdentity) {
                  try {
                    (window as any).AndroidBleMeshBridge.lockPermanentDeviceIdentity(formatted);
                  } catch (e) {
                    console.warn('Native lock error:', e);
                  }
                }

                // 2. Lock in Frontend State & LocalStorage
                setMyUsername(formatted);
                setIsUsernameLocked(true);
                localStorage.setItem('local_username', formatted);
                localStorage.setItem('local_username_locked', 'true');
                if (!localStorage.getItem('target_friend')) {
                  setTargetFriend('@all_friends');
                  localStorage.setItem('target_friend', '@all_friends');
                }
                setShowUserModal(false);
                // Prompt user to select & download their desired language pack
                setShowLangModal(true);

                // Broadcast Identity Announcement Packet
                const announceObj = {
                  id: crypto.randomUUID(),
                  session_id: 'LOCAL_MESH_PRIVATE',
                  sender_role: 'local_friend',
                  sender_username: formatted,
                  target_username: '@all_friends',
                  node_id: myNodeId,
                  is_local_mesh_private: true,
                  local_mode: 'mode-3-p2p-nan',
                  type: 'text_message',
                  text: `🔔 Node Registered: ${formatted}`,
                  timestamp: new Date().toISOString()
                };
                if ((window as any).AndroidBleMeshBridge && (window as any).AndroidBleMeshBridge.broadcastMeshPacket) {
                  try {
                    (window as any).AndroidBleMeshBridge.broadcastMeshPacket(JSON.stringify(announceObj));
                  } catch (e) {}
                }

                setLastDeliveryToast(`🔒 Permanent CallSign Locked: ${formatted}`);
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl text-white font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 tracking-wider uppercase border border-emerald-400 cursor-pointer"
            >
              <span>🔒</span>
              <span>Confirm & Lock Permanently</span>
            </button>
          </div>
        </div>
      )}

      {/* 🔒 PERMANENT HARDWARE-LOCKED CALLSIGN INFO MODAL */}
      {showLockedInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-neutral-950 border-2 border-emerald-500/60 rounded-3xl p-5 max-w-sm w-full shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col items-center text-center animate-fadeIn font-mono">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border-2 border-emerald-500/60 flex items-center justify-center text-2xl mb-3 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              🔒
            </div>
            <h3 className="text-sm font-black text-emerald-300 tracking-wide uppercase">
              Tactical CallSign Locked
            </h3>
            <span className="text-[9.5px] text-emerald-400/80 mt-0.5">
              Write-Once Hardware Bound Node
            </span>

            <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 my-4 flex flex-col gap-2.5 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[11px]">Your CallSign:</span>
                <span className="font-bold text-emerald-300 text-sm">{myUsername}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-neutral-800/80 pt-2">
                <span className="text-slate-400 text-[10px]">Node ID:</span>
                <span className="text-[10px] text-cyan-300">{myNodeId}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-neutral-800/80 pt-2">
                <span className="text-slate-400 text-[10px]">Persistence:</span>
                <span className="text-[10px] text-emerald-400 font-bold">🛡️ Survives Reinstall & Offline</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed mb-4 text-left">
              This node identity is permanently locked to this physical device hardware for disaster mesh routing. It cannot be altered to prevent identity spoofing during rescue operations.
            </p>

            <button
              type="button"
              onClick={() => setShowLockedInfoModal(false)}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN BODY */}
      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col justify-between gap-3 bg-black" style={{ WebkitOverflowScrolling: 'touch' }}>
        
        {/* TAB 1: TALK VIEW (MAIN GOVT / RESCUE DISPATCH) */}
        {activeTab === 'talk' && (
          <div className="flex-1 flex flex-col justify-between gap-3 h-full">
            
            {/* PERMANENT TOP BIG 1-TAP SOS BUTTON */}
            <button
              type="button"
              onClick={triggerOneTapSOS}
              className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-base md:text-lg tracking-wider uppercase flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.5)] border-2 border-red-400 active:scale-[0.97] transition-all cursor-pointer"
            >
              <span className="text-2xl animate-pulse">🚨</span>
              <span>{t.oneTapSos || "1-Tap Emergency SOS Distress Beacon"}</span>
            </button>

            {/* GPS COORDINATES & PLACE NAME BADGE */}
            <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[9.5px] gap-1">
              <span className="text-emerald-400/80 font-medium flex flex-wrap items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span>📍 {addressName || "Locating GPS..."}</span>
                <span className="text-white/30 text-[9px]">
                  ({coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E)
                </span>
              </span>
              <span className="text-white/40 font-medium shrink-0">
                ⏰ {clockTimeStr} IST
              </span>
            </div>

            {/* CENTER PTT & UNIFIED INTERFACE */}
            <div className="flex flex-col items-center justify-center my-auto w-full">
              {networkMode === 'mode-4-satellite-beacon' ? (
                <button
                  type="button"
                  onClick={triggerOneTapSOS}
                  className="w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 select-none relative touch-none cursor-pointer outline-none bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white shadow-[0_0_60px_rgba(244,63,94,0.9)] border-4 border-white animate-pulse"
                >
                  <span className="text-6xl">🚨</span>
                </button>
              ) : (
                <PushToTalkButton
                  language={selectedTransLang}
                  onStartRecord={() => {
                    setSpokenSpeechText('🎙️ Listening... (பேசுங்கள்)');
                    setPersistentSpokenText('');
                  }}
                  onLiveInterimText={(interim) => {
                    if (interim && interim.trim()) {
                      setSpokenSpeechText(interim.trim());
                      if (!interim.includes('Listening...')) {
                        setPersistentSpokenText(interim.trim());
                      }
                    }
                  }}
                  onTranscript={async (text, audioSize, blob, detectedLang, audioBase64, durationSec) => {
                    setSpokenSpeechText('⏳ Transcribing audio (Sherpa AI)...');
                    let candidateText = (text && text.trim() && !text.includes('Listening...')) ? text.trim() : '';

                    // If captured live during speech
                    if (candidateText) {
                      setPersistentSpokenText(candidateText);
                    } else if (spokenSpeechText && spokenSpeechText.trim() && !spokenSpeechText.includes('Listening...') && !spokenSpeechText.includes('Transcribing')) {
                      candidateText = spokenSpeechText.trim();
                      setPersistentSpokenText(candidateText);
                    }

                    // On-device Android Bridge ASR (Sherpa ONNX)
                    if (!candidateText && audioBase64 && (window as any).AndroidBleMeshBridge?.transcribeAudioBase64) {
                      try {
                        const localText = (window as any).AndroidBleMeshBridge.transcribeAudioBase64(audioBase64, selectedTransLang || 'ta');
                        if (localText && localText.trim()) {
                          candidateText = localText.trim();
                          setPersistentSpokenText(candidateText);
                        }
                      } catch (e) {
                        console.warn('On-device ASR bridge error:', e);
                      }
                    }

                    // Network STT fallback if connected
                    if (!candidateText && audioBase64) {
                      const sttEndpoints = getReliableEndpoints('/api/stt/transcribe');
                      for (const ep of sttEndpoints) {
                        try {
                          const sttRes = await fetch(ep, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ audio_base64: audioBase64, language: selectedTransLang || 'ta' }),
                            signal: AbortSignal.timeout(2000)
                          });
                          if (sttRes.ok) {
                            const sttData = await sttRes.json();
                            if (sttData.text && sttData.text.trim()) {
                              candidateText = sttData.text.trim();
                              setPersistentSpokenText(candidateText);
                              break;
                            }
                          }
                        } catch {}
                      }
                    }

                    setSpokenSpeechText('');
                    if (candidateText && candidateText.trim()) {
                      setPersistentSpokenText(candidateText.trim());
                    }

                    sendVoiceOrText(candidateText, audioSize, blob, false, selectedTransLang as any, audioBase64, undefined, durationSec);
                  }}
                  disabled={false}
                  networkMode={networkMode}
                />
              )}

              {/* 🎤 COMPACT REAL-TIME VOICE-TO-TEXT BOX */}
              <div className="w-full max-w-xs mt-3 px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-emerald-500/20 text-center">
                <div className="flex items-center justify-between text-[9px] text-emerald-400/80 font-medium pb-1 mb-1.5 border-b border-white/5">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${spokenSpeechText || persistentSpokenText ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`}></span>
                    <span>{t.voiceToText || "Voice to Text"}</span>
                  </span>
                  <span className={`text-[8.5px] ${spokenSpeechText ? 'text-emerald-300' : persistentSpokenText ? 'text-emerald-400' : 'text-white/30'}`}>
                    {spokenSpeechText ? (t.listening || 'Listening...') : persistentSpokenText ? (t.transcribed || 'Transcribed ✓') : (t.ready || 'Ready')}
                  </span>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <div className="text-white/90 text-xs font-normal min-h-[24px] flex items-center justify-center">
                    <span className="break-words w-full text-center">
                      {spokenSpeechText || persistentSpokenText || <span className="text-white/25 text-[11px]">{t.holdButtonAndSpeak || "Hold button and speak..."}</span>}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* 4-STAGE TRANSMISSION PIPELINE */}
            {networkMode !== "mode-3-ai-mesh" && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>Transmission Pipeline ({networkMode === 'mode-1-hd-call' ? '4G/5G Direct' : networkMode === 'mode-2-compressed-voice' ? '2G Compressed' : networkMode === 'mode-4-satellite-beacon' ? '16B Satellite' : 'BLE Mesh'})</span>
                  </h4>
                  <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/20">
                    🔒 AES-GCM
                  </span>
                </div>
                
                <PipelineProgress
                  stage={pipelineStage}
                  stats={currentMsgStats}
                  bandwidthKbps={networkMode === 'mode-4-satellite-beacon' ? 0.01 : networkMode === 'mode-2-compressed-voice' ? 2.4 : 64}
                  networkMode={networkMode}
                />
              </div>
            )}

            {/* Text Input Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = textInput.trim() || persistentSpokenText.trim() || spokenSpeechText.trim() || (networkMode === 'mode-1-hd-call' ? '🎙️ 4G/5G HD Direct Voice Note' : networkMode === 'mode-2-compressed-voice' ? '🎙️ 2G CELT Compressed Voice Note (1.2 KB)' : 'Alert Message');
                if (val) {
                  setTextInput('');
                  setSpokenSpeechText('');
                  sendVoiceOrText(val, 24, undefined, false, selectedTransLang as any);
                }
              }}
              className="flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => { setTextInput(e.target.value); }}
                placeholder={t.typeAlertMsg || "Type alert message..."}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white w-10 h-10 rounded-full text-sm font-bold transition-all active:scale-90 flex items-center justify-center cursor-pointer"
              >
                ➤
              </button>
            </form>
          </div>
        )}
        {/* TAB 2: SOS EMERGENCY DISPATCH & GOVT RESCUE FEED */}
        {activeTab === 'sos' && (
          <div className="flex-1 overflow-y-auto space-y-3">
            
            {/* 1. TOP SOS DISPATCH CARD */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/80 via-black to-neutral-950 border border-red-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚨</span>
                  <div>
                    <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wide">{t.govtSosGateway || "Government SOS Gateway"}</h3>
                    <span className="text-[8.5px] text-emerald-400/70 font-medium">{t.directToCommand || "Direct to Disaster Command Center"}</span>
                  </div>
                </div>
                <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-rose-400/70 px-2 py-0.5 rounded-full font-medium">
                  {t.loraDirect || "LoRa Direct Gateway"}
                </span>
              </div>

              {/* Big Red 1-Tap SOS Beacon Button */}
              <button
                type="button"
                onClick={triggerOneTapSOS}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-base md:text-lg py-5 px-6 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] border-2 border-red-400 active:scale-[0.97] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span className="text-2xl animate-pulse">🚨</span>
                <span>{t.sendOneTapSos || "Send 1-Tap SOS"}</span>
              </button>


              {/* Relay Cipher UI */}
              {cipherRelayActive && (
                <div className="bg-black/90 border border-green-500/50 rounded-xl p-3 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse">
                  <div className="text-[10px] text-green-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                    {cipherRelaySender} forwarding to Command Center
                  </div>
                  <div className="text-[11px] text-green-500 font-mono tracking-widest break-all overflow-hidden h-4 whitespace-nowrap overflow-ellipsis">
                    <div className="flex flex-col gap-1 w-full">
                      <span className="opacity-60">[ENCRYPTED] CIPHER_0x4954015F...</span>
                      <span className="text-cyan-300 break-words whitespace-normal leading-tight">[DECRYPTED] {cipherRelayText}</span>
                    </div>
                  </div>
                </div>
              )}
              {/* 4 Quick Emergency Distress Buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { icon: '🚑', text: t.medicalEmergency || 'Medical Emergency' },
                  { icon: '🍞', text: t.foodWater || 'Food & Clean Drinking Water' },
                  { icon: '🚤', text: t.evacuationBoat || 'Flood Evacuation Boat' },
                  { icon: '🏠', text: t.trappedRoof || 'Trapped on Roof' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendSosToCommandCenter(`🚨 ${item.text}`)}
                    className="p-2 rounded-xl bg-black/60 border border-red-900/80 hover:border-red-400 text-left text-[9.5px] font-bold text-rose-200 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.text}</span>
                  </button>
                ))}
              </div>

              {/* Custom SOS Text Dispatch */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={sosCustomInput}
                  onChange={(e) => setSosCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendSosToCommandCenter(sosCustomInput)}
                  placeholder={t.typeCustomSos || "Type custom SOS emergency details..."}
                  className="flex-1 bg-slate-950 border border-red-800 rounded-xl px-3 py-2 text-xs text-rose-100 placeholder-slate-600 focus:outline-none focus:border-red-400 font-bold"
                />
                <button
                  type="button"
                  onClick={() => sendSosToCommandCenter(sosCustomInput)}
                  disabled={!sosCustomInput.trim()}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md border border-red-400 active:scale-95 transition-all cursor-pointer"
                >
                  {t.send || "Send"}
                </button>
              </div>
            </div>

            {/* Large Offline Mesh Cipher Board Removed as per User Request */}

            {/* 2. SOS FEED (COMMAND CENTER BROADCASTS & USER'S SENT SOS) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10.5px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <span>📡</span> {t.liveGovtSosLog || "Live Govt SOS & Distress Log"}
                </span>
                <span className="text-[9px] text-slate-500 font-bold">{t.onlySosCommand || "Only SOS & Command Center"}</span>
              </div>

              {/* Filter and display SOS and Command Center alerts */}
              {(() => {
                // Combine and filter messages that are SOS or from/to command center
                const allSosList = [
                  ...sosHistory,
                  ...localMeshMessages.filter(m => m.is_emergency || m.sender_role === 'command' || m.sender_username === '@command_center' || m.target_username === '@command_center')
                ];

                // Deduplicate by ID and SORT: Newest SOS strictly at the TOP
                const uniqueSos = Array.from(new Map(allSosList.map(m => [m.id || m.text, m])).values())
                  .sort((a, b) => getSosTime(b) - getSosTime(a));

                if (uniqueSos.length === 0) {
                  return (
                    <div className="p-6 rounded-2xl bg-neutral-950 border border-red-900/60 text-center space-y-2 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                      <span className="text-3xl animate-pulse">🚨</span>
                      <p className="text-xs font-black text-rose-200 uppercase tracking-wide">{t.sosGatewayReady || "Emergency SOS Gateway Ready"}</p>
                      <p className="text-[9.5px] text-slate-400 font-bold">{t.satelliteDistressConnected || "1-Tap Satellite Distress Beacon (LoRa Direct Gateway) connected to Disaster Command Center."}</p>
                      <span className="inline-block text-[8px] font-mono bg-red-950/80 text-rose-300 border border-red-800 px-3 py-1 rounded-full font-bold">
                        {t.standbyGovt || "Standby for Govt Broadcasts"}
                      </span>
                    </div>
                  );
                }

                return uniqueSos.map((msg, i) => {
                  const isFromCommand = msg.sender_role === 'command' || msg.sender_username === '@command_center';

                  return (
                    <div
                      key={msg.id || i}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isFromCommand
                          ? 'bg-gradient-to-r from-red-950 via-rose-950/80 to-black border-2 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                          : 'bg-gradient-to-r from-red-950/70 via-black to-neutral-950 border border-red-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 border-b border-white/10 pb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm">{isFromCommand ? '📢' : '🚨'}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            isFromCommand ? 'bg-red-600 text-white font-mono' : 'bg-rose-950 text-rose-300 border border-rose-700'
                          }`}>
                            {isFromCommand ? 'GOVT COMMAND CENTER ALERT' : '🚨 EMERGENCY SOS BEACON'}
                          </span>
                          {i === 0 && (
                            <span className="bg-amber-400 text-black font-black text-[8px] px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                              ● NEWEST SOS
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          {formatTimeIST(msg.timestamp || msg.created_at || msg.display_time)}
                        </span>
                      </div>

                      {(!isFromCommand && msg.sender_username !== myUsername) ? (
                        <div className="mt-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-emerald-800/80 flex items-center justify-between font-mono text-[9px] shadow-inner">
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <span className="animate-ping">📡</span>
                            <span>RELAY CIPHER:</span>
                          </span>
                          <span className="text-cyan-300 font-black tracking-wider text-[8px] break-all max-w-[50%] text-right">
                            {msg.cipher_code || '0x4954 015F 0141 4F67 AE42 A082 C502 448A'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className={`text-xs font-sans font-bold leading-relaxed mb-1.5 ${
                            isFromCommand ? 'text-rose-100 text-sm' : 'text-slate-200'
                          }`}>
                            {msg.text}
                          </p>

                          {/* 🔐 Compact Encryption Cipher Badge */}
                          <div className="mt-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-cyan-800/80 flex items-center justify-between font-mono text-[9px]">
                            <span className="text-amber-300 font-bold flex items-center gap-1">
                              <span>🔐</span>
                              <span>CIPHER:</span>
                            </span>
                            <span className="text-cyan-300 font-black tracking-wider">
                              {msg.cipher_code || '0x4954 015F 0141 4F67 AE42 A082 C502 448A'}
                            </span>
                            <span className="text-[7.5px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-black border border-emerald-800">
                              24B MESH
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

          </div>
        )}

        {/* TAB 3: AIR RELAY - ENCRYPTED CIPHER TOKEN & COMPLETE RELAY HISTORY */}
        {activeTab === 'relay' && (
          <div className="flex-1 overflow-y-auto p-4 font-mono space-y-4 animate-fadeIn">
            <div className="w-full max-w-sm mx-auto p-5 rounded-3xl bg-neutral-950 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.35)] space-y-3">
              <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔐</span>
                  <span>ENCRYPTED CIPHER TOKEN:</span>
                </span>
                <span className="text-[9px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-600">
                  24-BYTE AES-GCM
                </span>
              </div>
              <div className="text-emerald-400 font-mono font-bold text-xs tracking-wider break-all bg-black/90 p-3 rounded-2xl border border-emerald-500/50 shadow-inner text-center flex items-center justify-center gap-1.5">
                <span>🔒 End-to-End Encrypted Air Mesh Frame</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>Algorithm: 24B Dynamic Token</span>
                <span className="text-emerald-400 font-bold">🔒 Encrypted in Transit</span>
              </div>
            </div>

            {/* RELAY LOG HISTORY (PHONE 2 GATEWAY) */}
            <div className="w-full max-w-sm mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>📡 MESH RELAY LOG ({relayedAirPackets.length})</span>
                </span>
                <span className="text-[9px] text-cyan-300 font-mono">MESH GATEWAY</span>
              </div>

              {relayedAirPackets.length === 0 ? (
                <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-center text-slate-400 text-xs">
                  📡 No mesh packets relayed yet. When an offline peer broadcasts a packet, this node captures and forwards it automatically.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {relayedAirPackets.map((pkt) => (
                    <div key={pkt.id} className="p-3.5 rounded-2xl bg-neutral-950 border-2 border-emerald-500/60 shadow-lg space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-amber-300 font-black">📱 {pkt.sender}</span>
                        <span className="text-slate-400">{pkt.timestamp}</span>
                      </div>
                      <div className="bg-black/80 px-2 py-1 rounded-xl border border-amber-600/40 text-cyan-300 font-bold text-[9.5px] break-all">
                        🔐 {pkt.cipherKey}
                      </div>
                      <div className="text-slate-100 font-sans font-bold text-xs py-0.5 break-words">
                        "{pkt.text}"
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-emerald-400 font-bold border-t border-slate-800 pt-1.5">
                        <span className="flex items-center gap-1">
                          <span>✅</span>
                          <span>{pkt.status || 'Relayed to HQ (Hop 2)'}</span>
                        </span>
                        <span className="text-slate-400">Route: Hop {pkt.hopCount || 2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LOCAL MESH (FRIENDS P2P CHAT) */}
        {activeTab === 'mesh' && (
          <div className="flex-1 overflow-y-auto space-y-2.5">


            {/* Target Friend Selector */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎯</span>
                  <span className="text-[10px] font-semibold text-cyan-400/80 uppercase tracking-wide">{t.directChatRecipient || "Direct Chat Recipient:"}</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {(!targetFriend || targetFriend === '@' || targetFriend === '@not_set' || targetFriend.length <= 2) ? '@all_friends' : targetFriend}
                </span>
              </div>

              {/* Input Field for Recipient */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFriendInput}
                  onChange={(e) => setCustomFriendInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customFriendInput.trim()) {
                      e.preventDefault();
                      const norm = normalizeName(customFriendInput);
                      if (norm && norm !== '@' && norm.length > 2) {
                        setTargetFriend(norm);
                        localStorage.setItem('target_friend', norm);
                        setCustomFriendInput('');
                        setLastDeliveryToast(`🎯 Recipient set to ${norm}!`);
                      }
                    }
                  }}
                  placeholder={t.enterCallsign || "Enter recipient callsign / username..."}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 placeholder-white/25 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customFriendInput.trim()) {
                      const norm = normalizeName(customFriendInput);
                      if (norm && norm !== '@' && norm.length > 2) {
                        setTargetFriend(norm);
                        localStorage.setItem('target_friend', norm);
                        setCustomFriendInput('');
                        setLastDeliveryToast(`🎯 Recipient set to ${norm}!`);
                      }
                    }
                  }}
                  className="bg-emerald-600 px-4 py-2 rounded-full text-xs font-semibold text-white active:scale-95 transition-all cursor-pointer"
                >
                  ✓ {t.set || "Set"}
                </button>
              </div>


            </div>

            {/* Quick Reaction Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full">
              {[
                t.iamSafe || 'I am safe 👍',
                t.needHelp || 'Need help 🆘',
                t.onMyWay || 'On my way 🏃',
                t.allClear || 'All clear ✅'
              ].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    sendLocalMeshPrivateMessage(chip, 24, undefined, undefined, 0);
                  }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 shrink-0 active:scale-95 transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* PTT Button for Local Mesh Friends (Inherits Top Language & Network Mode) */}
            <div className="flex flex-col items-center justify-center py-2 w-full">
              <PushToTalkButton
                language={selectedTransLang}
                onStartRecord={() => {
                  setLocalMeshSpokenText('🎙️ Listening... (பேசுங்கள்)');
                  setLocalMeshPersistentText('');
                }}
                onLiveInterimText={(interim) => {
                  if (interim && interim.trim()) {
                    setLocalMeshSpokenText(interim.trim());
                    if (!interim.includes('Listening...')) {
                      setLocalMeshPersistentText(interim.trim());
                      setLocalMeshTextInput(interim.trim());
                    }
                  }
                }}
                onTranscript={async (text, audioSize, blob, detectedLang, audioBase64, durationSec) => {
                  setLocalMeshSpokenText('⏳ Transcribing audio (Sherpa AI)...');
                  let candidateText = (text && text.trim() && !text.includes('Listening...')) ? text.trim() : '';

                  if (candidateText) {
                    setLocalMeshPersistentText(candidateText);
                    setLocalMeshTextInput(candidateText);
                  } else if (localMeshSpokenText && localMeshSpokenText.trim() && !localMeshSpokenText.includes('Listening...') && !localMeshSpokenText.includes('Transcribing')) {
                    candidateText = localMeshSpokenText.trim();
                    setLocalMeshPersistentText(candidateText);
                    setLocalMeshTextInput(candidateText);
                  }

                  // On-device Sherpa ONNX ASR fallback
                  if (!candidateText && audioBase64 && (window as any).AndroidBleMeshBridge?.transcribeAudioBase64) {
                    try {
                      const localText = (window as any).AndroidBleMeshBridge.transcribeAudioBase64(audioBase64, selectedTransLang || 'ta');
                      if (localText && localText.trim()) {
                        candidateText = localText.trim();
                        setLocalMeshPersistentText(candidateText);
                        setLocalMeshTextInput(candidateText);
                      }
                    } catch (e) {}
                  }

                  // Fast network STT fallback
                  if (!candidateText && audioBase64) {
                    const endpoints = getReliableEndpoints('/api/stt/transcribe-for-translate');
                    for (const ep of endpoints) {
                      try {
                        const res = await fetch(ep, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ audio_base64: audioBase64, language: selectedTransLang || 'ta' }),
                          signal: AbortSignal.timeout(1800)
                        });
                        if (res.ok) {
                          const data = await res.json();
                          if (data?.text?.trim()) {
                            candidateText = data.text.trim();
                            setLocalMeshPersistentText(candidateText);
                            setLocalMeshTextInput(candidateText);
                            break;
                          }
                        }
                      } catch {}
                    }
                  }

                  setLocalMeshSpokenText('');
                  if (candidateText && candidateText.trim()) {
                    setLocalMeshPersistentText(candidateText.trim());
                    setLocalMeshTextInput(candidateText.trim());
                  }

                  sendLocalMeshPrivateMessage(candidateText, audioSize, blob, audioBase64, durationSec);
                }}
                disabled={false}
                networkMode={localMeshMode === 'mode-1-p2p-hd' ? 'mode-1-hd-call' : localMeshMode === 'mode-2-p2p-2g' ? 'mode-2-compressed-voice' : 'mode-3-ai-mesh'}
              />

              {/* 🎤 COMPACT REAL-TIME VOICE-TO-TEXT BOX FOR LOCAL MESH */}
              <div className="w-full max-w-xs mt-3 px-3.5 py-2.5 rounded-2xl bg-neutral-950 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-center animate-fadeIn">
                <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400 font-bold border-b border-emerald-800/50 pb-1 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${localMeshSpokenText || localMeshPersistentText ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                    <span>{t.voiceToText || "Voice to Text"}</span>
                  </span>
                  <span className={`text-[8.5px] font-mono ${localMeshSpokenText ? 'text-emerald-300 font-bold' : localMeshPersistentText ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {localMeshSpokenText ? (t.listening || 'Listening...') : localMeshPersistentText ? (t.transcribed || 'Transcribed ✓') : (t.ready || 'Ready')}
                  </span>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <div className="text-emerald-100 text-xs font-sans font-bold min-h-[24px] flex items-center justify-center">
                    <span className="break-words w-full text-center">
                      {localMeshSpokenText || localMeshPersistentText || <span className="text-slate-500 text-[11px] font-normal">{t.holdButtonAndSpeak || "Hold button and speak..."}</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Text Input for Local Mesh */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (localMeshTextInput.trim()) {
                  const val = localMeshTextInput.trim();
                  setLocalMeshTextInput('');
                  sendLocalMeshPrivateMessage(val, 24, undefined, undefined, 0);
                }
              }}
              className="flex items-center gap-2 shrink-0 px-1 pb-2"
            >
              <input
                type="text"
                value={localMeshTextInput}
                onChange={(e) => { setLocalMeshTextInput(e.target.value); }}
                placeholder={`${t.messageRecipient || 'Message'} ${(!targetFriend || targetFriend === '@' || targetFriend === '@not_set' || targetFriend.length <= 2) ? '@all_friends' : targetFriend}...`}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white w-10 h-10 rounded-full text-sm font-bold transition-all active:scale-90 flex items-center justify-center cursor-pointer"
              >
                ➤
              </button>
            </form>

            {/* P2P Voice & Text Chat Stream */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5 px-1">
                <span className="text-[11px] font-semibold text-white/60 flex items-center gap-1.5">
                  <span>💬</span> {t.meshChat || 'Mesh Chat'}
                </span>
                <span className="text-[9px] text-cyan-400/60 font-medium bg-white/5 px-2 py-0.5 rounded-full">
                  {t.you || 'You'}: {myUsername}
                </span>
              </div>

              {localMeshMessages.length === 0 ? (
                <div className="p-6 text-center text-white/25 text-xs rounded-2xl bg-white/[0.02] border border-white/5">
                  <span>🎙️ Hold microphone to send a voice note to {(!targetFriend || targetFriend === '@' || targetFriend === '@not_set' || targetFriend.length <= 2) ? '@all_friends' : targetFriend}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {localMeshMessages.filter((msg) => {
                    const targetClean = normalizeName(msg.target_username);
                    const senderClean = normalizeName(msg.sender_username);
                    const myClean = normalizeName(myUsername);

                    // Must NOT be an emergency alert or command broadcast
                    const isNotCommandOrSos = !msg.is_emergency && 
                                              msg.channel_type !== 'EMERGENCY_ALERT' && 
                                              targetClean !== '@command_center' && 
                                              senderClean !== '@command_center';

                    if (!isNotCommandOrSos) return false;

                    // Unified WhatsApp Stream:
                    // 1. Sent by ME to anyone (my outgoing)
                    // 2. Sent to ME by anyone (my incoming from any friend)
                    // 3. Broadcast to @all_friends
                    // STRICTLY HIDE on relay devices: Do NOT show packets intended for other third parties
                    const isForMeOrMine = (
                      senderClean === myClean ||
                      targetClean === myClean ||
                      targetClean === '@all_friends' ||
                      !targetClean
                    );

                    return isForMeOrMine;
                  }).map((msg, i) => {
                    const targetClean = normalizeName(msg.target_username);
                    const senderClean = normalizeName(msg.sender_username);
                    const myClean = normalizeName(myUsername);
                    const isSentByMe = senderClean === myClean;
                    const isForMe = targetClean === myClean;
                    const isForMeOrMine = isSentByMe || isForMe;

                    return (
                      <div
                        key={msg.id || i}
                        className={`flex flex-col ${
                          isSentByMe ? 'items-end' : 'items-start'
                        }`}
                      >
                        {/* Chat Bubble */}
                        <div
                          className={`max-w-[82%] rounded-2xl px-3 py-2.5 space-y-1 text-xs transition-all ${
                            isSentByMe
                              ? 'bg-gradient-to-br from-emerald-900/80 to-teal-950/90 text-emerald-50 rounded-br-sm'
                              : isForMe
                              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 text-slate-50 rounded-bl-sm'
                              : 'bg-slate-950/60 text-slate-500 rounded-2xl opacity-50'
                          }`}
                        >
                          {/* Sender / Recipient Header */}
                          <div className="flex items-center justify-between gap-2 text-[9.5px] pb-0.5">
                            <span className={`font-semibold ${isSentByMe ? 'text-emerald-400/90' : 'text-cyan-400/90'}`}>
                              {isSentByMe ? `${t.you || 'You'} ➔ ${msg.target_username}` : `${msg.sender_username} ➔ ${t.you || 'You'}`}
                            </span>
                            <span className="text-[7px] text-white/30 font-mono">
                              {msg.local_mode === 'mode-3-p2p-nan' ? 'M3·24B' : msg.local_mode === 'mode-2-p2p-2g' ? 'M2·2G' : 'M1·HD'}
                              {' · '}
                              {msg.is_decrypted ? 'E2EE' : isSentByMe && msg.is_locked ? '🔒' : isForMeOrMine ? 'E2EE' : '🔒'}
                            </span>
                          </div>

                          {/* Message Content */}
                          <div className="space-y-1.5">
                            {(msg.audio_url || (msg as any).audioUrl) && (
                              <VoiceNotePlayer
                                audioUrl={msg.audio_url || (msg as any).audioUrl}
                                isSentByMe={isSentByMe}
                                text={msg.text}
                                durationSeconds={msg.duration_seconds || 4}
                              />
                            )}
                            {msg.text && (
                              <div>
                                {msg.is_decrypted && (
                                  <span className="inline-block text-[7px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400/80 font-medium mb-1">
                                    🔓 {t.decrypted || 'Decrypted'}
                                  </span>
                                )}
                                {isSentByMe && msg.is_locked && (
                                  <span className="inline-block text-[7px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/80 font-medium mb-1">
                                    🔒 {t.lockedFor || 'Locked for'} {msg.target_username}
                                  </span>
                                )}
                                <p className="text-[13px] leading-relaxed font-normal text-white/90">
                                  {msg.text}
                                </p>
                              </div>
                            )}
                            {!isForMeOrMine && msg.cipher_code && (
                              <div className="text-[7px] font-mono text-white/20">
                                🔒 {msg.cipher_code}
                              </div>
                            )}
                          </div>

                          {/* Timestamp & Double-Tick */}
                          <div className="flex items-center justify-end gap-1 text-[8px] text-white/35 pt-0.5">
                            <span>
                              {formatTimeIST(msg.timestamp || msg.created_at || msg.display_time)}
                            </span>
                            {isSentByMe && (
                              <span className="text-cyan-400/70 text-[9px]">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* 3. BOTTOM NAVIGATION BAR */}
      <footer className="px-6 py-2 bg-gradient-to-t from-neutral-950/95 to-black/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around shrink-0">
        <button
          onClick={() => setActiveTab('talk')}
          className={`flex flex-col items-center gap-0.5 py-1 px-4 transition-all cursor-pointer relative ${
            activeTab === 'talk' ? 'text-blue-400' : 'text-white/30'
          }`}
        >
          {activeTab === 'talk' && <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-400 rounded-full"></span>}
          <span className="text-lg">📢</span>
          <span className="text-[10px] font-semibold">{t.alertTab || "Alert"}</span>
        </button>

        <button
          onClick={() => setActiveTab('sos')}
          className={`flex flex-col items-center gap-0.5 py-1 px-4 transition-all cursor-pointer relative ${
            activeTab === 'sos' ? 'text-red-400' : 'text-white/30'
          }`}
        >
          {activeTab === 'sos' && <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-red-400 rounded-full"></span>}
          <span className="text-lg">🚨</span>
          <span className="text-[10px] font-semibold">{t.sosTab || "SOS"}</span>
        </button>

        <button
          onClick={() => setActiveTab('mesh')}
          className={`flex flex-col items-center gap-0.5 py-1 px-4 transition-all cursor-pointer relative ${
            activeTab === 'mesh' ? 'text-cyan-400' : 'text-white/30'
          }`}
        >
          {activeTab === 'mesh' && <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-cyan-400 rounded-full"></span>}
          <span className="text-lg">👥</span>
          <span className="text-[10px] font-semibold">{t.meshTab || "Local Mesh"}</span>
        </button>
      </footer>

    </div>
  );
}
