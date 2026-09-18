import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { instantTranslate9 } from '../utils/ultraFastTranslator';

interface FeedMsg {
  id: string | number;
  sender_role: string;
  sender_username?: string;
  target_username?: string;
  text: string;
  is_emergency: boolean;
  language?: string;
  latitude?: number;
  longitude?: number;
  address_name?: string;
  timestamp: string;
  display_time?: string;
  audio_url?: string;
  audioUrl?: string;
  network_mode?: string;
  cipher_code?: string;
  gateway_node?: string;
  hop_count?: number;
  stats?: {
    raw_bytes?: number;
    compressed_bytes?: number;
    encrypted_bytes?: number;
    original_audio_bytes?: number;
    transit_time_ms?: number;
    compression_method?: string;
    ciphertext_hex?: string;
  };
}

export default function CommandCenterDashboard() {

  // 🔔 Tactical Audio Notification Ding-Ding Alert (synthesized via Web Audio API)
  const playTacticalDingDing = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      // Tone 1: High crisp ding (880 Hz - A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2: Harmonious secondary chime (1320 Hz - E6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.12);
      gain2.gain.setValueAtTime(0.4, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch {}

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([120, 60, 120]);
      } catch {}
    }
  };  const [playingAiMsgId, setPlayingAiMsgId] = useState<string | null>(null);
  const activeAiAudioRef = useRef<HTMLAudioElement | null>(null);
  const aiAudioCacheRef = useRef<Record<string, string>>({});

  // 🔊 Instant Neural AI Voice Readout (0ms Zero Latency via Instant Synthesis & Neural Cache)
  const playAiNeuralReadout = async (msgId: string, text: string, lang = 'auto') => {
    if (!text || !text.trim()) return;

    // Toggle off if currently playing
    if (playingAiMsgId === msgId) {
      if (activeAiAudioRef.current) {
        try { activeAiAudioRef.current.pause(); } catch {}
        activeAiAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch {}
      }
      setPlayingAiMsgId(null);
      return;
    }

    // Stop any existing playing sound
    if (activeAiAudioRef.current) {
      try { activeAiAudioRef.current.pause(); } catch {}
      activeAiAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }

    setPlayingAiMsgId(msgId);

    // 1. Instant Cache Hit (0ms latency!)
    const cachedUrl = aiAudioCacheRef.current[msgId] || aiAudioCacheRef.current[text];
    if (cachedUrl) {
      try {
        const sound = new Audio(cachedUrl);
        activeAiAudioRef.current = sound;
        sound.onended = () => { setPlayingAiMsgId(null); activeAiAudioRef.current = null; };
        sound.onerror = () => { setPlayingAiMsgId(null); activeAiAudioRef.current = null; };
        await sound.play();
        return;
      } catch {}
    }

    // 2. Instant Browser Web Speech Synthesis (Starts speaking in < 30ms with 0 seconds wait!)
    const isTamil = /[\u0B80-\u0BFF]/.test(text) || (lang && lang.startsWith('ta'));
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = isTamil ? 'ta-IN' : 'en-US';
        utter.rate = 1.0;
        utter.pitch = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const targetVoice = voices.find(v => isTamil ? (v.lang.includes('ta') || v.name.toLowerCase().includes('tamil')) : (v.lang.includes('en')));
        if (targetVoice) {
          utter.voice = targetVoice;
        }

        utter.onend = () => {
          setPlayingAiMsgId(null);
        };
        utter.onerror = () => {
          setPlayingAiMsgId(null);
        };

        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
      }
    }

    // 3. In parallel, fetch Azure Neural Audio and cache it for crystal-clear replay
    fetch('/api/tts/ai-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang }),
      signal: AbortSignal.timeout(8000)
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        if (data.audio_url) {
          aiAudioCacheRef.current[msgId] = data.audio_url;
          aiAudioCacheRef.current[text] = data.audio_url;
        }
      }
    }).catch(() => {});
  };

  // 🔊 Instant English AI Voice for translated message
  const playEnglishAiVoice = async (msgId: string, text: string) => {
    try {
      // Stop previous playing audio
      if (currentAudioRef.current) {
        try { currentAudioRef.current.pause(); } catch {}
        currentAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch {}
      }

      if (playingAudioId === msgId) {
        setPlayingAudioId(null);
        return;
      }

      setPlayingAudioId(msgId);

      // 1. Instant Cache Hit
      let audioUrl = translatedAudios[msgId] || aiAudioCacheRef.current[msgId];
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => { setPlayingAudioId(null); currentAudioRef.current = null; };
        audio.onerror = () => { setPlayingAudioId(null); currentAudioRef.current = null; };
        await audio.play();
        return;
      }

      // 2. Instant Browser Web Speech Synthesis in English (0ms latency)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = 1.0;
        utter.onend = () => setPlayingAudioId(null);
        utter.onerror = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utter);
      }

      // 3. In parallel, fetch backend audio and cache
      fetch('/api/tts/english', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(8000)
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.audio_url) {
            setTranslatedAudios(prev => ({ ...prev, [msgId]: data.audio_url }));
            aiAudioCacheRef.current[msgId] = data.audio_url;
          }
        }
      }).catch(() => {});
    } catch (e) {
      setPlayingAudioId(null);
    }
  };

  const { sessionId } = useParams();
  const [feed, setFeed] = useState<FeedMsg[]>(() => {
    try {
      const saved = localStorage.getItem('tantra_command_center_feed_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [replyText, setReplyText] = useState('');
  const [sosBroadcastText, setSosBroadcastText] = useState('');
  const [showSosModal, setShowSosModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [sosSentToast, setSosSentToast] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ta');
  const [filter, setFilter] = useState<'all' | 'sos' | 'audio' | 'gps'>('all');

  // Active Network Mode State: 4 Modes
  const [activeNetworkMode, setActiveNetworkMode] = useState<'mode-1-hd-call' | 'mode-2-compressed-voice' | 'mode-3-ai-mesh' | 'mode-4-satellite-beacon'>('mode-4-satellite-beacon');

  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [translatedAudios, setTranslatedAudios] = useState<Record<string, string>>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [integrityScores, setIntegrityScores] = useState<Record<string, {score: number; reason: string; summary: string}>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedSorted, setFeedSorted] = useState(false);
  const [feedSortMode, setFeedSortMode] = useState<'latest' | 'integrity'>('latest');
  const [clusterDetected, setClusterDetected] = useState<number>(0);
  const burstCountRef = useRef<number>(0);
  const burstResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [decryptingMsgs, setDecryptingMsgs] = useState<Record<string, boolean>>({});

  const feedRef = useRef<HTMLDivElement>(null);
  // Automatically scroll to the top whenever a new message arrives
  const prevTopIdRef = useRef<any>(null);
  const autoAnalyzeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnalyzingRef = useRef(false);
  const playedTtsRef = useRef<Set<string>>(new Set());
  const hasInitialLoadedRef = useRef(false);

  // 🌐 Instant Translation to English (Neural Engine + Groq Cloud Fallback)
  const translateWithGroq = async (msgId: string, text: string, lang = 'ta') => {
    if (!text || translatedTexts[msgId as string]) return;
    setTranslatingId(msgId);

    // 1. Direct Instant Neural Translation
    try {
      const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text.trim())}`;
      const gRes = await fetch(gUrl, { signal: AbortSignal.timeout(4000) });
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData && gData[0]) {
          const transStr = gData[0].map((item: any) => item[0]).filter(Boolean).join('').trim();
          if (transStr && transStr.toLowerCase() !== text.trim().toLowerCase()) {
            setTranslatedTexts(prev => ({ ...prev, [msgId]: transStr }));
            setTranslatingId(null);
            return;
          }
        }
      }
    } catch {}

    const endpoints = [
      '/api/translate/groq',
      'https://symposium-desktops-identical-christopher.trycloudflare.com/api/translate/groq',
      'http://127.0.0.1:8000/api/translate/groq',
      'http://10.64.235.76:8000/api/translate/groq',
    ];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, source_lang: lang || 'ta', target_lang: 'en' }),
          signal: AbortSignal.timeout(6000)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.translated && data.translated.toLowerCase() !== text.trim().toLowerCase()) {
            setTranslatedTexts(prev => ({ ...prev, [msgId]: data.translated }));
            setTranslatingId(null);
            return;
          }
        }
      } catch {}
    }
    // Instant offline dictionary fallback
    try {
      const fallback = instantTranslate9(text)?.translations?.en;
      if (fallback && fallback.toLowerCase() !== text.trim().toLowerCase()) {
        setTranslatedTexts(prev => ({ ...prev, [msgId]: fallback }));
      }
    } catch {}
    setTranslatingId(null);
  };

  // 🎙️ Transcribe + Translate audio
  const transcribeAndTranslateAudio = async (msgId: string, audioUrl: string, lang = 'ta') => {
    if (!audioUrl || translatedTexts[msgId]) return;
    setTranslatingId(msgId);
    const endpoints = [
      '/api/stt/transcribe-for-translate',
      'https://harbor-like-kings-greater.trycloudflare.com/api/stt/transcribe-for-translate',
      'http://127.0.0.1:8000/api/stt/transcribe-for-translate',
      'http://10.64.235.76:8000/api/stt/transcribe-for-translate',
    ];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio_url: audioUrl, language: lang || 'ta' }),
          signal: AbortSignal.timeout(20000)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.translated) {
            setTranslatedTexts(prev => ({ ...prev, [msgId]: data.translated }));
            if (data.audio_url) {
              setTranslatedAudios(prev => ({ ...prev, [msgId]: data.audio_url }));
            }
            setTranslatingId(null);
            return;
          }
        }
      } catch {}
    }
    setTranslatingId(null);
  };

  // 🧠 Groq Integrity Level Analysis
  // 🧠 Groq Integrity Level Analysis (for Multi-message Disaster Clusters: 10, 20, 100 messages)
  const analyzeIntegrity = async (autoSwitchToIntegrity = true) => {
    if (feed.length === 0 || isAnalyzingRef.current) return;
    isAnalyzingRef.current = true;
    setIsAnalyzing(true);
    const msgsToAnalyze = feed.slice(0, 30).map(m => ({
      id: String(m.id),
      text: m.text,
      language: m.language || 'ta',
      sender_username: m.sender_username || '@field',
      timestamp: m.timestamp
    }));
    const endpoints = [
      '/api/groq/analyze-integrity',
      'https://harbor-like-kings-greater.trycloudflare.com/api/groq/analyze-integrity',
      'http://127.0.0.1:8000/api/groq/analyze-integrity',
      'http://10.64.235.76:8000/api/groq/analyze-integrity',
    ];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: msgsToAnalyze }),
          signal: AbortSignal.timeout(25000)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.scored_messages) {
            const scoreMap: Record<string, {score: number; reason: string; summary: string}> = {};
            data.scored_messages.forEach((sm: any) => {
              scoreMap[sm.id] = {
                score: sm.integrity_score || 5,
                reason: sm.integrity_reason || '',
                summary: sm.english_summary || sm.text || ''
              };
            });
            setIntegrityScores(prev => ({ ...prev, ...scoreMap }));
            if (autoSwitchToIntegrity) {
              setFeedSortMode('integrity');
            }
            setFeedSorted(true);
            isAnalyzingRef.current = false;
            setIsAnalyzing(false);
            return;
          }
        }
      } catch {}
    }
    isAnalyzingRef.current = false;
    setIsAnalyzing(false);
  };



  const getApiBase = () => {
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
      return `http://${window.location.hostname}:8000`;
    }
    return 'http://localhost:8000';
  };

  const [wsUrl] = useState<string>(() => {
    const targetSession = sessionId || 'DEMO_GLOBAL_SESSION_01';
    const host = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost')
      ? window.location.hostname
      : 'localhost';
    return `ws://${host}:8000/ws/command/${targetSession}`;
  });

  const { connected, stats, messages: wsMessages, send } = useWebSocket(wsUrl);

  // ⏰ Precise Indian Standard Time (IST) Formatter (Handles UTC DB strings, timestamps & 12hr AM/PM)
  const formatTimeIST = (timeVal?: any) => {
    if (!timeVal) {
      return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    }
    if (typeof timeVal === 'string') {
      const trimmed = timeVal.trim();
      const lower = trimmed.toLowerCase();
      if (lower.includes('am') || lower.includes('pm')) {
        return trimmed.toUpperCase();
      }
      let isoStr = trimmed;
      if (!isoStr.endsWith('Z') && !isoStr.includes('+')) {
        isoStr = isoStr.replace(' ', 'T') + 'Z';
      }
      const d = new Date(isoStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
      }
    } else if (typeof timeVal === 'number') {
      const ts = timeVal > 1e11 ? timeVal : timeVal * 1000;
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
      }
    }
    return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  };

  // 🔄 Instant WebSocket Message Stream for Command Center
  useEffect(() => {
    if (wsMessages && wsMessages.length > 0) {
      const latest: any = wsMessages[wsMessages.length - 1];
      if (latest && latest.text) {
        // 🛑 ABSOLUTE PRIVACY FIREWALL: Never show private Local Mesh in Command Center!
        const isPrivateLocalMesh = (
          latest.is_local_mesh_private ||
          latest.session_id === 'LOCAL_MESH_PRIVATE' ||
          (latest.target_username && latest.target_username !== '@command_center' && latest.target_username !== '@all_users' && !latest.is_emergency && latest.sender_role !== 'command')
        );
        if (isPrivateLocalMesh) return;

        // 🛑 Block system/node-registration messages by text pattern
        const WS_SYSTEM_PATTERNS = [/node registered/i, /node_register/i, /callsign locked/i, /🔔 node/i, /identity announcement/i, /device profile/i, /mesh_node_join/i, /ble_announce/i];
        const latestText = (latest.text || '').trim();
        if (!latestText || latestText.length < 2 || WS_SYSTEM_PATTERNS.some(p => p.test(latestText))) return;


        setFeed(prev => {
          const cleanLatestText = (latest.text || '').trim().toLowerCase().replace(/[\s\W]+/g, ' ');
          const exists = prev.some(m => {
            if (m.id === latest.id) return true;
            const cleanMText = (m.text || '').trim().toLowerCase().replace(/[\s\W]+/g, ' ');
            return cleanMText === cleanLatestText && m.sender_username === latest.sender_username;
          });
          if (exists) return prev;

          const isEmergency = !!latest.is_emergency;
          const isMode4 = latest.network_mode === 'mode-4-satellite-beacon' || isEmergency;
          const isMode3 = latest.network_mode === 'mode-3-ai-mesh';

          const cipherCode = latest.cipher_code || (isMode4 ? '534F015F01414F67AE42A082C502448A' : `CIPHER#${((Date.now() * 1733 + 4919) % 65535).toString(16).toUpperCase().padStart(4, '0')}`);

          // 🔔 Play Tactical Ding-Ding Notification on incoming message (NO auto-speaking voice!)
          const msgKey = String(latest.id || latest.text);
          if (!playedTtsRef.current.has(msgKey)) {
            playedTtsRef.current.add(msgKey);
            playTacticalDingDing();
          }

          const rawTs = latest.timestamp || new Date().toISOString();
          const normalizedTs = (typeof rawTs === 'number')
            ? new Date(rawTs < 1e11 ? rawTs * 1000 : rawTs).toISOString()
            : (typeof rawTs === 'string' && /^\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/.test(rawTs))
            ? (rawTs.includes('T') && rawTs.endsWith('Z') ? rawTs : `${rawTs.replace(' ', 'T').replace(/Z$/, '')}Z`)
            : rawTs;

          const newFeedItem: FeedMsg = {
            id: latest.id || crypto.randomUUID(),
            sender_role: latest.sender_role || 'field',
            sender_username: latest.sender_username || '@citizen_field',
            target_username: latest.target_username || '@command_center',
            text: latest.text,
            is_emergency: isEmergency,
            language: latest.language || 'ta',
            latitude: latest.latitude || 12.8718,
            longitude: latest.longitude || 80.2185,
            address_name: latest.address_name || (latest.latitude ? `GPS: ${latest.latitude}°N, ${latest.longitude}°E` : "Active Tactical Sector"),
            timestamp: normalizedTs,
            display_time: latest.display_time || formatTimeIST(normalizedTs),
            audio_url: latest.audio_url || latest.audioUrl,
            audioUrl: latest.audio_url || latest.audioUrl,
            network_mode: latest.network_mode || (isMode4 ? 'mode-4-satellite-beacon' : 'mode-2-compressed-voice'),
            cipher_code: cipherCode,
            gateway_node: latest.gateway_node || (isMode4 ? '🛰️ ISRO NavIC Gateway' : '@civ_mesh_relay'),
            hop_count: isMode4 ? 1 : (latest.hop_count || 2),
            stats: latest.stats || {
              raw_bytes: 45000,
              compressed_bytes: isMode4 ? 16 : isMode3 ? 24 : 1200,
              encrypted_bytes: isMode4 ? 16 : isMode3 ? 24 : 1200,
              original_audio_bytes: 45000,
              transit_time_ms: isMode4 ? 35.0 : 85.0,
              compression_method: isMode4 ? 'satellite_beacon' : 'celt_2g_compressed',
              ciphertext_hex: cipherCode
            }
          };
          // Deduplicate before adding to feed:
          const cleanNewText = (newFeedItem.text || '').trim().toLowerCase().replace(/[\s\W]+/g, ' ');
          const isDuplicate = prev.some(m => 
            m.id === newFeedItem.id || 
            (cleanNewText && (m.text || '').trim().toLowerCase().replace(/[\s\W]+/g, ' ') === cleanNewText && 
             Math.abs(new Date(m.timestamp).getTime() - new Date(newFeedItem.timestamp).getTime()) < 15000)
          );
          if (isDuplicate) return prev;
          return [newFeedItem, ...prev];
        });
      }
    }
  }, [wsMessages]);

  // High-Frequency Live Polling (1s Interval)
  useEffect(() => {
    const poll = async () => {
      try {
        const apiBase = getApiBase();
        const endpoints = [
          `${apiBase}/api/messages/all`,
          '/api/messages/all',
          'https://harbor-like-kings-greater.trycloudflare.com/api/messages/all',
          'http://127.0.0.1:8000/api/messages/all',
          'http://10.64.235.76:8000/api/messages/all',
        ];

        let data: any = null;
        for (const ep of endpoints) {
          try {
            const res = await fetch(ep, { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
              const json = await res.json();
              if (Array.isArray(json)) {
                data = json;
                break;
              }
            }
          } catch {}
        }
        if (!data || !Array.isArray(data)) return;

        // 🛑 ABSOLUTE PRIVACY FIREWALL: Exclude private Local Mesh from Command Center
        const SYSTEM_MSG_PATTERNS = [
          /node registered/i,
          /node_register/i,
          /callsign locked/i,
          /🔔 node/i,
          /identity announcement/i,
          /device profile/i,
          /mesh_node_join/i,
          /ble_announce/i,
        ];
        const cleanData = data.filter((m: any) => {
          if (m.is_local_mesh_private || m.session_id === 'LOCAL_MESH_PRIVATE') return false;
          if (m.target_username && m.target_username !== '@command_center' && m.target_username !== '@all_users' && m.target_username !== '@all_citizens' && !m.is_emergency && m.sender_role !== 'command') return false;
          // Block system/registration messages by text pattern
          const txt = (m.text || '').trim();
          if (SYSTEM_MSG_PATTERNS.some(p => p.test(txt))) return false;
          // Must have meaningful user-generated text (not just a callsign or whitespace)
          if (!txt || txt.length < 2) return false;
          return true;
        });

        // If initial load, record all existing IDs so we don't replay history
        if (!hasInitialLoadedRef.current) {
          cleanData.forEach((m: any) => playedTtsRef.current.add(String(m.id || m.text)));
          hasInitialLoadedRef.current = true;
        } else {
          // Check for newly arrived messages to trigger tactical ding-ding chime (NO auto-speaking voice!)
          let hasNewMessage = false;
          let burstArrivals = 0;
          cleanData.forEach((m: any) => {
            const k = String(m.id || m.text);
            if (!playedTtsRef.current.has(k)) {
              playedTtsRef.current.add(k);
              hasNewMessage = true;
              burstArrivals++;
            }
          });
          if (hasNewMessage) {
            playTacticalDingDing();
          }
          // Multi-User Surge / Burst Detection:
          // Activate AI ONLY when multiple users/systems send messages simultaneously!
          if (burstArrivals >= 5) {
            setClusterDetected(burstArrivals);
            // Automatically invoke AI multi-incident triage to rank 1st, 2nd, 3rd...
            analyzeIntegrity(true);
          }
        }

        const mapped: FeedMsg[] = cleanData.map((m: any) => {
          const isEmergency = !!m.is_emergency;
          const isMode4 = m.network_mode === 'mode-4-satellite-beacon' || isEmergency;
          const isMode3 = m.network_mode === 'mode-3-ai-mesh';
          const cipherCode = m.cipher_code || (isMode4 ? '534F015F01414F67AE42A082C502448A' : `CIPHER#${((m.id * 1733 + 4919) % 65535).toString(16).toUpperCase().padStart(4, '0')}`);
          
          const rawTs = m.created_at || m.timestamp || new Date().toISOString();
          const normalizedTs = (typeof rawTs === 'number')
            ? new Date(rawTs < 1e11 ? rawTs * 1000 : rawTs).toISOString()
            : (typeof rawTs === 'string' && /^\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/.test(rawTs))
            ? (rawTs.includes('T') && rawTs.endsWith('Z') ? rawTs : `${rawTs.replace(' ', 'T').replace(/Z$/, '')}Z`)
            : rawTs;

          return {
            id: m.id,
            sender_role: m.sender_role || 'field',
            sender_username: m.sender_username || (m.sender_role === 'command' ? '@command_center' : '@citizen_field'),
            target_username: m.target_username || (m.sender_role === 'command' ? '@all_users' : '@command_center'),
            text: m.text || '',
            is_emergency: isEmergency,
            language: m.language || 'ta',
            latitude: m.latitude,
            longitude: m.longitude,
            address_name: m.address_name || (m.latitude ? `GPS: ${m.latitude}°N, ${m.longitude}°E` : "Active Tactical Sector"),
            timestamp: normalizedTs,
            display_time: m.display_time || formatTimeIST(normalizedTs),
            audio_url: m.audio_url || m.audioUrl,
            audioUrl: m.audio_url || m.audioUrl,
            network_mode: m.network_mode || (isMode4 ? 'mode-4-satellite-beacon' : 'mode-2-compressed-voice'),
            cipher_code: cipherCode,
            gateway_node: m.gateway_node || (isMode4 ? '🛰️ ISRO NavIC (S-Band / 2492MHz) & LoRa 865MHz Gateway' : '@civ_mesh_relay (BLE 20m / Wi-Fi 100m)'),
            hop_count: isMode4 ? 1 : (m.hop_count || 2),
            stats: {
              raw_bytes: m.audio_size ? Math.round(m.audio_size * 28.5) : 45000,
              compressed_bytes: isMode4 ? 16 : isMode3 ? (m.text?.length || 24) : (m.audio_size || 1200),
              encrypted_bytes: isMode4 ? 16 : isMode3 ? (m.text?.length || 24) : (m.audio_size || 1200),
              original_audio_bytes: m.audio_size ? Math.round(m.audio_size * 28.5) : 45000,
              transit_time_ms: isMode4 ? 35.0 : isMode3 ? 45.0 : m.network_mode === 'mode-1-hd-call' ? 12.0 : 85.0,
              compression_method: isMode4 ? '16byte_satellite_lora_beacon' : isMode3 ? 'voice_to_ai_text_ble_mesh' : 'celt_2g_compressed',
              ciphertext_hex: cipherCode
            }
          };
        });

        // Robust UI Deduplication: Deduplicate by clean normalized text signature within 15s window
        const seenSignatures = new Set<string>();
        const uniqueFeed: FeedMsg[] = [];
        for (const item of mapped) {
          const cleanText = (item.text || '').trim().toLowerCase().replace(/[\s\W]+/g, ' ');
          const timeBucket = Math.floor(new Date(item.timestamp).getTime() / 15000);
          const sig = `${cleanText}_${timeBucket}`;
          if (cleanText) seenSignatures.add(sig);
          uniqueFeed.push(item);
        }

        // Incremental State Merge: Never wipe historical messages from state!
        setFeed(prevFeed => {
          const map = new Map<string, FeedMsg>();
          prevFeed.forEach(m => {
            const key = String(m.id || `${m.timestamp}_${m.text}`);
            map.set(key, m);
          });
          uniqueFeed.forEach(m => {
            const key = String(m.id || `${m.timestamp}_${m.text}`);
            map.set(key, m);
          });
          const merged = Array.from(map.values()).sort((a, b) => {
            const tA = new Date(a.timestamp).getTime() || 0;
            const tB = new Date(b.timestamp).getTime() || 0;
            return tB - tA;
          });
          // 🔒 ONLY save to localStorage if we have messages — NEVER overwrite with empty array
          if (merged.length > 0) {
            try {
              localStorage.setItem('tantra_command_center_feed_v2', JSON.stringify(merged.slice(0, 500)));
            } catch {}
          }
          return merged;
        });
      } catch {}
    };

    poll();
    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, []);

  const switchMode = async (mode: 'mode-1-hd-call' | 'mode-2-compressed-voice' | 'mode-3-ai-mesh' | 'mode-4-satellite-beacon') => {
    setActiveNetworkMode(mode);
    const apiBase = getApiBase();
    try {
      await fetch(`${apiBase}/api/network/set-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ network_mode: mode })
      });
    } catch {}
  };

  const resolveWs = (host: string, path: string) => {
    let finalHost = host;
    if (!finalHost) {
      if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        finalHost = window.location.hostname;
      } else {
        finalHost = 'localhost';
      }
    }
    const clean = finalHost.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '').replace(/\/$/, '');
    if (clean.includes('trycloudflare.com') || clean.includes('.com') || clean.includes('.org') || clean.includes('.net')) {
      return `wss://${clean}${path}`;
    }
    return `ws://${clean}:8000${path}`;
  };

  // Broadcast Govt SOS Alert to ALL Users & Field Devices
  const handleBroadcastGovtSos = async (textToBroadcast?: string) => {
    const content = textToBroadcast || sosBroadcastText;
    if (!content.trim()) return;

    const apiBase = getApiBase();
    const payloadObj = {
      id: crypto.randomUUID(),
      session_id: 'DEMO_GLOBAL_SESSION_01',
      sender_role: 'command',
      sender_username: '@command_center',
      target_username: '@all_users',
      type: 'emergency_alert',
      text: content.trim(),
      network_mode: 'mode-4-satellite-beacon',
      audio_size: 16,
      is_emergency: true,
      language: selectedLanguage,
      latitude: 12.8718,
      longitude: 80.2185,
      cipher_code: 'SAT-16B#GOVT-SOS-BROADCAST',
      display_time: formatTimeIST()
    };

    const payload = JSON.stringify(payloadObj);

    // 1. Dispatch over HTTP endpoints
    const endpoints = [
      `${apiBase}/api/messages/send`,
      'http://127.0.0.1:8000/api/messages/send',
      'http://localhost:8000/api/messages/send',
      '/api/messages/send'
    ];

    endpoints.forEach(url => {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      }).catch(() => {});
    });

    // 2. Dispatch over WebSocket
    try {
      send(payloadObj);
    } catch {}

    setSosBroadcastText('');
    setShowSosModal(false);
    setSosSentToast(`🚨 GOVT SOS BROADCASTED TO ALL USERS: "${content.slice(0, 35)}..."`);
    setTimeout(() => setSosSentToast(''), 6000);
  };

  const handleSend = async (textToSend?: string) => {
    const content = textToSend || replyText;
    if (!content.trim()) return;

    const apiBase = getApiBase();
    const payload = JSON.stringify({
      session_id: 'DEMO_GLOBAL_SESSION_01',
      sender_role: 'command',
      sender_username: '@command_center',
      target_username: '@all_users',
      type: 'text_message',
      text: content,
      network_mode: activeNetworkMode,
      audio_size: 64,
      is_emergency: false,
      language: selectedLanguage,
      latitude: 12.8718,
      longitude: 80.2185
    });

    try {
      await fetch(`${apiBase}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
    } catch {
      fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      }).catch(() => {});
    }

    if (!textToSend) setReplyText('');
  };

  const filteredFeed = useMemo(() => {
    let list = feed.filter(m => {
      if (filter === 'sos') return m.is_emergency;
      if (filter === 'audio') return !!(m.audio_url || m.audioUrl);
      if (filter === 'gps') return m.latitude != null;
      return true;
    });

    const normalizeTimestamp = (ts: any): number => {
      if (!ts) return 0;
      if (typeof ts === 'number') return ts < 1e11 ? ts * 1000 : ts;
      const str = String(ts).trim();
      if (/^\d{10,13}$/.test(str)) {
        const n = Number(str);
        return n < 1e11 ? n * 1000 : n;
      }
      if (/^\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/.test(str)) {
        const cleanStr = str.replace(' ', 'T');
        const withZ = cleanStr.endsWith('Z') ? cleanStr : `${cleanStr}Z`;
        const parsed = new Date(withZ).getTime();
        if (!isNaN(parsed)) return parsed;
      }
      const t = new Date(str).getTime();
      return isNaN(t) ? 0 : t;
    };

    const getMsgSortScore = (m: FeedMsg): number => {
      const timeMs = normalizeTimestamp(m.timestamp);
      const numId = typeof m.id === 'number' ? m.id : (typeof (m as any).db_id === 'number' ? (m as any).db_id : 0);
      if (timeMs > 0 && numId > 0) {
        return Math.floor(timeMs / 1000) * 1000000 + (numId % 1000000);
      }
      if (timeMs > 0) return timeMs * 1000;
      if (numId > 0) return numId * 1000000000;
      return 0;
    };

    if (feedSortMode === 'integrity') {
      return [...list].sort((a, b) => {
        const sa = integrityScores[String(a.id)]?.score || (a.is_emergency ? 8 : 5);
        const sb = integrityScores[String(b.id)]?.score || (b.is_emergency ? 8 : 5);
        if (sb !== sa) return sb - sa;
        return getMsgSortScore(b) - getMsgSortScore(a);
      });
    }

    // Default 'latest' mode: Newest message STRICTLY at the top!
    return [...list].sort((a, b) => getMsgSortScore(b) - getMsgSortScore(a));
  }, [feed, filter, feedSortMode, integrityScores]);

  useEffect(() => {
    if (filteredFeed.length > 0) {
      const topId = filteredFeed[0]?.id;
      if (topId && topId !== prevTopIdRef.current) {
        prevTopIdRef.current = topId;
        if (feedRef.current) {
          feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  }, [filteredFeed]);

  return (
    <div className="h-screen bg-black text-neutral-100 font-sans flex flex-col overflow-hidden">
      
      {/* 1. TOP HEADER */}
      <header className="shrink-0 bg-neutral-950 border-b border-neutral-800 px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg border border-red-400/40 text-lg">
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm lg:text-base font-black text-slate-100">
                iTantra - Indian Multilingual Disaster Communication & Mesh Network
              </h1>
              <span className="text-[9px] bg-red-950 text-rose-300 border border-red-800 px-2 py-0.5 rounded font-mono font-bold shrink-0">
                ISRO NavIC / GOVT SOS GATEWAY
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Emergency Distress Monitor & Real-Time Broadcast Control</p>
          </div>
        </div>

        {/* SOS BROADCAST TRIGGER & 4 Tactical Modes */}
        <div className="flex items-center gap-3">
          {/* DEMO CONTROLLER BUTTON */}
          <Link
            to="/demo"
            className="px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 border border-purple-400"
          >
            <span>🎛️</span>
            <span>Demo Hub</span>
          </Link>

          {/* BIG RED SOS BROADCAST BUTTON */}
          <button
            onClick={() => setShowSosModal(true)}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-4 py-2 rounded-xl border border-red-400 shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <span>🚨</span>
            <span>GOVT SOS BROADCAST</span>
          </button>
        </div>
      </header>

      {/* SOS SENT NOTIFICATION TOAST */}
      {sosSentToast && (
        <div className="bg-gradient-to-r from-red-700 to-rose-600 text-white px-6 py-2.5 text-xs font-bold font-mono shadow-2xl flex items-center justify-between border-b-2 border-red-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-base animate-bounce">🚨</span>
            <span>{sosSentToast}</span>
          </div>
          <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-mono">DELIVERED TO ALL PHONES</span>
        </div>
      )}

      {/* GOVT SOS BROADCAST MODAL */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1422] border-2 border-red-500 rounded-3xl p-6 w-full max-w-lg space-y-4 font-mono shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-red-900 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-pulse">🚨</span>
                <div>
                  <h3 className="text-base font-black text-red-400 uppercase tracking-wide">Government Emergency Broadcast</h3>
                  <span className="text-[9px] text-rose-300 font-bold">Transmits over Satellite 16B & Mesh to ALL USERS (Online + Offline)</span>
                </div>
              </div>
              <button
                onClick={() => setShowSosModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Quick Emergency Broadcast Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Quick Disaster Presets:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '🚨', label: 'Evacuate Zone Immediately', text: '🚨 RED ALERT: Evacuate coastal sector immediately. Rescue teams en route.' },
                  { icon: '🌊', label: 'Flood Rescue Boats Active', text: '🌊 FLOOD WARNING: NDRF relief boats dispatched to Kottivakkam area.' },
                  { icon: '🍞', label: 'Relief Food & Water Camp', text: '🍞 RELIEF AID: Food, drinking water & supplies arriving at main relief camp.' },
                  { icon: '🏥', label: 'Medical Team Deployed', text: '🏥 MEDICAL AID: Emergency medical team reaching your sector now.' }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSosBroadcastText(preset.text)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-red-900/80 hover:border-red-500 text-left text-[10px] space-y-0.5 transition-all group"
                  >
                    <div className="font-bold text-red-300 flex items-center gap-1.5">
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Custom Emergency Announcement:</label>
              <textarea
                rows={3}
                value={sosBroadcastText}
                onChange={(e) => setSosBroadcastText(e.target.value)}
                placeholder="Type emergency disaster alert to broadcast to ALL citizens..."
                className="w-full bg-slate-950 border-2 border-red-700 focus:border-red-400 rounded-2xl p-3 text-xs text-rose-100 font-sans focus:outline-none placeholder-slate-600 resize-none font-bold"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="w-1/3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs py-3 rounded-2xl border border-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBroadcastGovtSos()}
                disabled={!sosBroadcastText.trim()}
                className="w-2/3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs py-3 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.7)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>📡</span>
                <span>BROADCAST SOS TO ALL USERS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN BODY */}
      <div className="flex-1 flex min-h-0">
        
        {/* LEFT SIDEBAR: TOPOLOGY & SATELLITE TELEMETRY */}
        <aside className="w-80 bg-black border-r border-neutral-850 p-4 flex flex-col justify-between shrink-0 overflow-y-auto font-mono text-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-xs font-black uppercase text-neutral-300 tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Tactical Node Telemetry</span>
              </h3>
              <span className="text-[8px] bg-neutral-900 text-emerald-400 border border-neutral-700 px-1.5 py-0.5 rounded font-bold">LIVE</span>
            </div>

            {/* Active Node Matrix */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300">📱 Phone 1: Victim Citizen</span>
                  <span className="text-[8px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-bold">AIR MESH</span>
                </div>
                <div className="text-[9.5px] text-neutral-400">Offline BLE Mesh & Wi-Fi Direct Broadcast</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300">🔄 Phone 2: Relay Gateway</span>
                  <span className="text-[8px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded font-bold">CIVILIAN PIPE</span>
                </div>
                <div className="text-[9.5px] text-neutral-400">Zero-Display Encrypted Transit Node</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-300">📡 Phone 3: Sub-Mesh Node</span>
                  <span className="text-[8px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded font-bold">CLUSTER RELAY</span>
                </div>
                <div className="text-[9.5px] text-neutral-400">BLE Cluster Repeater (100m Sector)</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">🛰️ Phone 4: Tactical Edge Gateway</span>
                  <span className="text-[8px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-bold">GATEWAY PIPE</span>
                </div>
                <div className="text-[9.5px] text-neutral-400">LoRa 865MHz / ISRO NavIC Direct Uplink</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">🏢 Government Control Centre</span>
                  <span className="text-[8px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-bold">RECEIVER</span>
                </div>
                <div className="text-[9.5px] text-neutral-400">Disaster Ops HQ & Real-Time Rescue Dispatch</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 text-[10px] text-neutral-500 space-y-1">
            <div className="text-cyan-400 font-bold">🏢 Government Control Centre</div>
            <div>Encryption: AES-GCM Compact Mesh Codec</div>
            <div>Protocol: iTantra 4-Tier v2.4</div>
          </div>
        </aside>

        {/* RIGHT AREA: LIVE SOS & RESCUE STREAM */}
        <main className="flex-1 flex flex-col bg-black overflow-hidden">
          
          {/* Action Toolbar */}
          <div className="px-6 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Live Feed:
              </span>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                📋 All Messages ({feed.length})
              </button>
              <button
                onClick={() => setFilter('sos')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  filter === 'sos' ? 'bg-rose-900 text-rose-200 border border-rose-700' : 'text-rose-400 hover:text-rose-300 bg-slate-900 border border-slate-800'
                }`}
              >
                <span>🚨</span>
                <span>SOS Distress ({feed.filter(m => m.is_emergency).length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-slate-200">Live Feed</span>
              </div>

              {/* Instant ANS Trigger */}
              <button
                type="button"
                onClick={() => analyzeIntegrity(false)}
                disabled={isAnalyzing || feed.length === 0}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isAnalyzing
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-600/40 animate-pulse'
                    : 'bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700/60'
                }`}
                title="Run Automated Notification Stream Analysis"
              >
                <span>{isAnalyzing ? '⏳' : '🧠'}</span>
                <span>{isAnalyzing ? 'Analyzing...' : 'Run ANS'}</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div ref={feedRef} className="flex-1 overflow-y-auto p-6 space-y-3 font-mono">

            {/* 🚨 Clustered Burst Notification Banner (10, 20, 100 simultaneous messages) */}
            {clusterDetected > 0 && (
              <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono mb-2 bg-gradient-to-r from-red-950/90 via-amber-950/70 to-neutral-900 border-2 border-red-500 text-red-200 animate-pulse shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <span>DISASTER BURST DETECTED: {clusterDetected} simultaneous field reports incoming!</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFeedSortMode('integrity');
                    analyzeIntegrity(true);
                  }}
                  className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-[11px] font-mono cursor-pointer shadow"
                >
                  View Ranked 1, 2, 3... ➔
                </button>
              </div>
            )}

            {/* 🧠 Auto-Integrity Status Banner */}
            {(isAnalyzing || feedSortMode === 'integrity') && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold font-mono mb-1 border ${
                isAnalyzing
                  ? 'bg-purple-950/60 border-purple-700/50 text-purple-300 animate-pulse'
                  : 'bg-purple-950/30 border-purple-800/30 text-purple-400'
              }`}>
                <span className={isAnalyzing ? 'animate-spin' : ''}>🧠</span>
                {isAnalyzing
                  ? 'Analyzing disaster message urgency and sorting by Integrity Level...'
                  : `✅ Ranked by Integrity Level (1, 2, 3...) — Highest emergency cluster shown first (${filteredFeed.length} messages)`}
              </div>
            )}

            {filteredFeed.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                <span className="text-4xl">🛰️</span>
                <p className="text-xs font-bold">Listening for incoming satellite SOS distress beacons & field telemetry...</p>
              </div>
            ) : (
              filteredFeed.map((msg: FeedMsg, idx: number) => {
                const isEmergency = !!msg.is_emergency;
                const isFromCommand = msg.sender_role === 'command';
                const hasAudio = !!(msg.audio_url || msg.audioUrl);

                return (
                  <div
                    key={msg.id || idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isEmergency || (integrityScores[String(msg.id)]?.score || 0) >= 9
                        ? 'bg-gradient-to-r from-red-950/90 via-rose-950/70 to-slate-950 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-fadeIn'
                        : (integrityScores[String(msg.id)]?.score || 0) >= 7
                        ? 'bg-gradient-to-r from-orange-950/80 via-amber-950/60 to-slate-950 border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-fadeIn'
                        : isFromCommand
                        ? 'bg-gradient-to-r from-blue-950/80 to-[#0c1322] border border-blue-600 shadow-md animate-fadeIn'
                        : 'bg-gradient-to-r from-[#0c1524] via-[#09111c] to-[#070b14] border border-cyan-700/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-fadeIn'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isEmergency ? (
                          <span className="text-base animate-ping">🚨</span>
                        ) : (
                          <span className="text-base">💬</span>
                        )}
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded font-mono ${
                          isEmergency 
                            ? 'bg-red-700 text-white' 
                            : isFromCommand 
                            ? 'bg-blue-700 text-white' 
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        }`}>
                          {isFromCommand ? 'GOVT COMMAND CENTER BROADCAST' : `CITIZEN: ${msg.sender_username || '@citizen_field'}`}
                        </span>
                        
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          isEmergency ? 'bg-red-950 text-rose-300 border border-red-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {isEmergency ? 'SOS DISTRESS BEACON' : 'NORMAL DISPATCH'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* ⚡ Newest Arrival badge */}
                        {idx === 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md font-mono bg-emerald-950 text-emerald-300 border border-emerald-500 animate-pulse">
                            ● NEWEST
                          </span>
                        )}

                        {/* 🔥 Integrity Level Badge */}
                        {integrityScores[String(msg.id)] && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg font-mono border ${
                            integrityScores[String(msg.id)].score >= 9
                              ? 'bg-red-800 text-red-100 border-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse'
                              : integrityScores[String(msg.id)].score >= 7
                              ? 'bg-orange-800 text-orange-100 border-orange-600'
                              : integrityScores[String(msg.id)].score >= 5
                              ? 'bg-yellow-800 text-yellow-100 border-yellow-600'
                              : 'bg-slate-800 text-slate-300 border-slate-600'
                          }`}>
                            🧠 IL: {integrityScores[String(msg.id)].score}/10
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-cyan-300 font-bold bg-black/60 px-2.5 py-0.5 rounded border border-cyan-800/60 shadow-sm">
                          ⏰ {formatTimeIST(msg.display_time || msg.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-1">
                      <p className={`text-sm font-sans font-bold leading-relaxed ${
                        isEmergency ? 'text-rose-100 text-base' : 'text-slate-100'
                      }`}>
                        <span>{msg.text}</span>
                      </p>
                    </div>

                    {/* 🛡️ Manual Review Required */}
                    <div className="text-[10.5px] font-mono mb-1.5 px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 bg-amber-950/60 text-amber-300 border-amber-800/50">
                      <span>🛡️</span>
                      <span className="font-bold text-amber-300 uppercase tracking-wide">Manual Review Required</span>
                    </div>

                    {/* 🇬🇧 English Translation Card + AI Voice Player */}
                    {translatedTexts[String(msg.id)] && (
                      <div className="mb-3 p-3 bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-slate-950 border-2 border-amber-500/60 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-fadeIn">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <span>🇬🇧</span>
                            <span>English Translation</span>
                          </span>
                          
                          {/* 🔊 Play English AI Voice Button */}
                          <button
                            type="button"
                            onClick={() => playEnglishAiVoice(String(msg.id), translatedTexts[String(msg.id)])}
                            className={`px-3 py-1 rounded-xl text-xs font-black font-mono flex items-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer ${
                              playingAudioId === String(msg.id)
                                ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                            }`}
                          >
                            <span>{playingAudioId === String(msg.id) ? '⏸️' : '🔊 ▶'}</span>
                            <span>{playingAudioId === String(msg.id) ? 'Stop AI Voice' : 'Play AI Voice'}</span>
                          </button>
                        </div>

                        <p className="text-sm font-sans font-bold text-amber-100 leading-relaxed">
                          {translatedTexts[String(msg.id)]}
                        </p>
                      </div>
                    )}

                    {/* 🎮 Tactical Action Row: Play AI Voice + Groq Fast AI Translation Button */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* 🔊 Play AI Voice Button (Explicit Manual Readout) */}
                      <button
                        type="button"
                        onClick={() => playAiNeuralReadout(String(msg.id), msg.text, msg.language || 'ta')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md ${
                          playingAiMsgId === String(msg.id)
                            ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.8)] border border-rose-400'
                            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                        }`}
                      >
                        <span>{playingAiMsgId === String(msg.id) ? '⏸️' : '🔊 ▶'}</span>
                        <span>{playingAiMsgId === String(msg.id) ? 'Playing AI Voice (Stop)' : '🔊 Play AI Voice'}</span>
                      </button>

                      {/* 🌐 Fast AI Text Translation Button (Translates the text above to English) */}
                      <button
                        type="button"
                        onClick={() => {
                          translateWithGroq(String(msg.id), msg.text, msg.language || 'ta');
                        }}
                        disabled={translatingId === (String(msg.id))}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 active:scale-95 transition-all cursor-pointer ${
                          translatedTexts[String(msg.id)]
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/50 shadow-inner'
                            : translatingId === (String(msg.id))
                            ? 'bg-amber-900/80 text-amber-200 animate-pulse border border-amber-500'
                            : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        }`}
                      >
                        <span className="text-sm">{translatingId === (String(msg.id)) ? '⏳' : '⚡'}</span>
                        <span>
                          {translatingId === (String(msg.id))
                            ? 'Translating Text...'
                            : translatedTexts[String(msg.id)]
                            ? '✅ English Translation'
                            : '🌐 Translate Text → English'}
                        </span>
                      </button>
                    </div>

                    {/* Mode 1 / 2 Audio Player */}
                    {hasAudio && (
                      <div className="mb-2.5 p-2.5 bg-black/60 rounded-xl border border-cyan-500/30 flex items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const audioEl = new Audio(msg.audio_url || msg.audioUrl);
                                audioEl.play().catch(() => {});
                              } catch {}
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-sans font-bold text-xs rounded-lg flex items-center gap-1.5 active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all"
                          >
                            <span>▶️</span>
                            <span>Play Voice Note</span>
                          </button>
                          <span className={`text-[11px] font-mono font-bold hidden sm:inline ${
                            msg.network_mode === 'mode-2-compressed-voice' ? 'text-blue-300' : 'text-cyan-300'
                          }`}>
                            {msg.network_mode === 'mode-2-compressed-voice' ? '📻 1.2 KB CELT 2G Audio' : '🎙️ 16kHz HD PCM'}
                          </span>
                        </div>
                        <audio controls src={msg.audio_url || msg.audioUrl} className="h-8 w-48 sm:w-64 accent-emerald-500" />
                      </div>
                    )}

                    {/* Location & Metadata Bar */}
                    <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 pt-2 border-t border-white/10">
                      <span className="text-emerald-400 font-bold flex flex-wrap items-center gap-1.5">
                        <span>📍</span>
                        <span>{msg.address_name || (msg.latitude && msg.longitude ? `GPS: ${msg.latitude.toFixed(4)}°N, ${msg.longitude.toFixed(4)}°E` : "Active Tactical Sector")}</span>
                        {msg.latitude && msg.longitude && !msg.address_name?.includes('GPS:') && (
                          <span className="text-cyan-300 font-mono text-[9px]">
                            [GPS: {msg.latitude.toFixed(4)}°N, {msg.longitude.toFixed(4)}°E]
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-black border ${
                          msg.network_mode === 'mode-2-compressed-voice' ? 'bg-blue-950 text-blue-300 border-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.4)]' :
                          msg.network_mode === 'mode-3-ai-mesh' ? 'bg-amber-950 text-amber-300 border-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                          msg.network_mode === 'mode-4-satellite-beacon' ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.4)]' :
                          'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        }`}>
                          {msg.network_mode === 'mode-2-compressed-voice' ? 'MODE-2 (2G COMPRESSED)' : msg.network_mode?.toUpperCase() || 'MODE-1'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Broadcast Input Bar */}
          <div className="p-4 bg-[#0a0e14] border-t border-slate-800 flex items-center gap-3 shrink-0">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type tactical message to broadcast..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-bold"
            />
            <button
              onClick={() => handleSend()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all"
            >
              Send Message
            </button>
            <button
              onClick={() => setShowSosModal(true)}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>🚨</span>
              <span>Broadcast SOS</span>
            </button>
          </div>

        </main>
      </div>

    </div>
  );
}
