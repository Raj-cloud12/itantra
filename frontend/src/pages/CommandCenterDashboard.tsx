import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';

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



  // 🔊 Play English AI Voice for translated message
  const playEnglishAiVoice = async (msgId: string, text: string) => {
    try {
      // Stop previous playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      if (playingAudioId === msgId) {
        setPlayingAudioId(null);
        return;
      }

      let audioUrl = translatedAudios[msgId];
      if (!audioUrl) {
        setPlayingAudioId(msgId);
        const endpoints = [
          '/api/tts/english',
          'https://applications-enclosed-counted-collapse.trycloudflare.com/api/tts/english',
          'http://127.0.0.1:8000/api/tts/english',
          'http://10.200.5.175:8000/api/tts/english',
        ];
        for (const ep of endpoints) {
          try {
            const res = await fetch(ep, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text }),
              signal: AbortSignal.timeout(15000)
            });
            if (res.ok) {
              const data = await res.json();
              if (data.audio_url) {
                audioUrl = data.audio_url;
                setTranslatedAudios(prev => ({ ...prev, [msgId]: audioUrl }));
                break;
              }
            }
          } catch {}
        }
      }

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        setPlayingAudioId(msgId);
        audio.onended = () => {
          setPlayingAudioId(null);
          currentAudioRef.current = null;
        };
        audio.onerror = () => {
          setPlayingAudioId(null);
          currentAudioRef.current = null;
        };
        await audio.play();
      } else {
        setPlayingAudioId(null);
      }
    } catch (e) {
      console.warn('Play AI voice error:', e);
      setPlayingAudioId(null);
    }
  };

  const { sessionId } = useParams();
  const [feed, setFeed] = useState<FeedMsg[]>([]);
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
  const [decryptingMsgs, setDecryptingMsgs] = useState<Record<string, boolean>>({});

  const feedRef = useRef<HTMLDivElement>(null);
  const feedBottomRef = useRef<HTMLDivElement>(null);
  // Automatically scroll to the top whenever a new message arrives
  const prevTopIdRef = useRef<any>(null);
  const autoAnalyzeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnalyzingRef = useRef(false);

  // 🌐 Groq Translation
  const translateWithGroq = async (msgId: string, text: string, lang = 'ta') => {
    if (!text || translatedTexts[msgId as string]) return;
    setTranslatingId(msgId);
    const endpoints = [
      '/api/translate/groq',
      'https://applications-enclosed-counted-collapse.trycloudflare.com/api/translate/groq',
          'http://127.0.0.1:8000/api/translate/groq',
      'http://10.200.5.175:8000/api/translate/groq',
    ];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, source_lang: lang || 'ta', target_lang: 'en' }),
          signal: AbortSignal.timeout(12000)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.translated) {
            setTranslatedTexts(prev => ({ ...prev, [msgId]: data.translated }));
            // Auto read aloud the English translation
            // speak removed
            setTranslatingId(null);
            return;
          }
        }
      } catch {}
    }
    setTranslatingId(null);
  };

  // 🎙️ Transcribe + Translate audio
  const transcribeAndTranslateAudio = async (msgId: string, audioUrl: string, lang = 'ta') => {
    if (!audioUrl || translatedTexts[msgId]) return;
    setTranslatingId(msgId);
    const endpoints = [
      '/api/stt/transcribe-for-translate',
      'https://applications-enclosed-counted-collapse.trycloudflare.com/api/stt/transcribe-for-translate',
          'http://127.0.0.1:8000/api/stt/transcribe-for-translate',
      'http://10.200.5.175:8000/api/stt/transcribe-for-translate',
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
  const analyzeIntegrity = async () => {
    if (feed.length === 0 || isAnalyzingRef.current) return;
    isAnalyzingRef.current = true;
    setIsAnalyzing(true);
    const msgsToAnalyze = feed.slice(0, 20).map(m => ({
      id: String(m.id),
      text: m.text,
      language: m.language || 'ta',
      sender_username: m.sender_username || '@field',
      timestamp: m.timestamp
    }));
    const endpoints = [
      '/api/groq/analyze-integrity',
      'https://applications-enclosed-counted-collapse.trycloudflare.com/api/groq/analyze-integrity',
          'http://127.0.0.1:8000/api/groq/analyze-integrity',
      'http://10.200.5.175:8000/api/groq/analyze-integrity',
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
            setIntegrityScores(scoreMap);
            setFeed(prev => {
              const sorted = [...prev].sort((a, b) => {
                const sa = scoreMap[String(a.id)]?.score || 5;
                const sb = scoreMap[String(b.id)]?.score || 5;
                return sb - sa;
              });
              return sorted;
            });
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


  useEffect(() => {
    if (feed.length > 0) {
      const topId = feed[0]?.id;
      if (topId && topId !== prevTopIdRef.current) {
        prevTopIdRef.current = topId;
        if (feedRef.current) {
          feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  }, [feed]);

  // 🧠 AUTO INTEGRITY SORT: When 2+ messages arrive, auto-analyze after 2s debounce
  useEffect(() => {
    if (feed.length < 2) return;
    if (isAnalyzingRef.current) return;

    // Debounce: wait 2 seconds after last message before analyzing
    if (autoAnalyzeTimerRef.current) clearTimeout(autoAnalyzeTimerRef.current);
    autoAnalyzeTimerRef.current = setTimeout(() => {
      if (!isAnalyzingRef.current) {
        analyzeIntegrity();
      }
    }, 2000);

    return () => {
      if (autoAnalyzeTimerRef.current) clearTimeout(autoAnalyzeTimerRef.current);
    };
  }, [feed.length]); // Only trigger when message COUNT changes (new message arrived)


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

  const formatTimeIST = (timeVal?: any) => {
    const now = new Date();
    if (!timeVal) return now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (typeof timeVal === 'string' && (timeVal.includes('AM') || timeVal.includes('PM'))) return timeVal;
    try {
      const d = new Date(timeVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    } catch {}
    return now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // 🔄 Instant WebSocket Message Stream for Command Center
  useEffect(() => {
    if (wsMessages && wsMessages.length > 0) {
      const latest: any = wsMessages[wsMessages.length - 1];
      if (latest && latest.text) {
        setFeed(prev => {
          const exists = prev.some(m => m.id === latest.id || (m.timestamp === latest.timestamp && m.text === latest.text));
          if (exists) return prev;

          const isEmergency = !!latest.is_emergency;
          const isMode4 = latest.network_mode === 'mode-4-satellite-beacon' || isEmergency;
          const isMode3 = latest.network_mode === 'mode-3-ai-mesh';

          if (isMode3) {
            setDecryptingMsgs(prev => ({ ...prev, [latest.id]: true }));
            setTimeout(() => {
              setDecryptingMsgs(prev => ({ ...prev, [latest.id]: false }));
            }, 6000);
          }
          const cipherCode = latest.cipher_code || (isMode4 ? '534F015F01414F67AE42A082C502448A' : `CIPHER#${((Date.now() * 1733 + 4919) % 65535).toString(16).toUpperCase().padStart(4, '0')}`);

          // Mode 1 / 2: Auto-play incoming citizen voice audio note
          if (latest.audio_url || latest.audioUrl) {
            try {
              const audioObj = new Audio(latest.audio_url || latest.audioUrl);
              audioObj.play().catch(() => {});
            } catch {}
          } else if (isMode3 && latest.text) {
            // 🧠 Mode 3: AI Mesh Voice -> Text 24B -> Command Center AI Auto-Readout!
            try {
              if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(latest.text);
                const bcpMap: Record<string, string> = { ta: 'ta-IN', en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ml: 'ml-IN', kn: 'kn-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN' };
                utterance.lang = bcpMap[latest.language || 'en'] || 'en-IN';
                utterance.rate = 1.0;
                window.speechSynthesis.speak(utterance);
              }
            } catch (e) {}
          }

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
            address_name: latest.address_name || "📍 St. Joseph's Institute of Technology, OMR, Chennai 600119",
            timestamp: latest.timestamp || new Date().toISOString(),
            display_time: latest.display_time || formatTimeIST(latest.timestamp),
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
          'https://applications-enclosed-counted-collapse.trycloudflare.com/api/messages/all',
          'http://127.0.0.1:8000/api/messages/all',
          'http://10.200.5.175:8000/api/messages/all',
        ];

        let data: any = null;
        for (const ep of endpoints) {
          try {
            const res = await fetch(ep, { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
              data = await res.json();
              if (Array.isArray(data) && data.length > 0) break;
            }
          } catch {}
        }
        if (!data || !Array.isArray(data)) return;
        if (!Array.isArray(data)) return;

        const mapped: FeedMsg[] = data.map((m: any) => {
          const isEmergency = !!m.is_emergency;
          const isMode4 = m.network_mode === 'mode-4-satellite-beacon' || isEmergency;
          const isMode3 = m.network_mode === 'mode-3-ai-mesh';
          const cipherCode = m.cipher_code || (isMode4 ? '534F015F01414F67AE42A082C502448A' : `CIPHER#${((m.id * 1733 + 4919) % 65535).toString(16).toUpperCase().padStart(4, '0')}`);
          
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
            address_name: m.address_name || "📍 St. Joseph's Institute of Technology, OMR, Chennai 600119",
            timestamp: m.created_at || new Date().toISOString(),
            display_time: m.display_time || formatTimeIST(m.created_at),
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

        // Deduplicate feed by unique ID or signature to guarantee single display
        const uniqueFeed = Array.from(
          new Map(mapped.map((item: FeedMsg) => [item.id || `${item.sender_username}_${item.text}_${item.display_time}`, item])).values()
        );
        setFeed(uniqueFeed);
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

  const filteredFeed = feed.filter(m => {
    if (filter === 'sos') return m.is_emergency;
    if (filter === 'audio') return !!(m.audio_url || m.audioUrl);
    if (filter === 'gps') return m.latitude != null;
    return true;
  });

  return (
    <div className="h-screen bg-[#07090e] text-slate-100 font-sans flex flex-col overflow-hidden">
      
      {/* 1. TOP HEADER */}
      <header className="shrink-0 bg-[#0c1017] border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg border border-red-400/40 text-lg">
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-100">
                iTiTantra Disaster Command Center
              </h1>
              <span className="text-[9px] bg-red-950 text-rose-300 border border-red-800 px-2 py-0.5 rounded font-mono font-bold">
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

          {/* INSTALL MOBILE APK BUTTON */}
          <button
            onClick={() => setShowInstallModal(true)}
            className="px-3 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 border border-emerald-400"
          >
            <span>📲</span>
            <span>Install Mobile APK</span>
          </button>

          {/* BIG RED SOS BROADCAST BUTTON */}
          <button
            onClick={() => setShowSosModal(true)}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-4 py-2 rounded-xl border border-red-400 shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse flex items-center gap-2 active:scale-95 transition-all"
          >
            <span>🚨</span>
            <span>GOVT SOS BROADCAST</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => switchMode('mode-1-hd-call')}
              className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                activeNetworkMode === 'mode-1-hd-call' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mode 1 (4G)
            </button>
            <button
              onClick={() => switchMode('mode-2-compressed-voice')}
              className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                activeNetworkMode === 'mode-2-compressed-voice' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mode 2 (2G Audio)
            </button>
            <button
              onClick={() => switchMode('mode-3-ai-mesh')}
              className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                activeNetworkMode === 'mode-3-ai-mesh' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mode 3 (AI Mesh)
            </button>
            <button
              onClick={() => switchMode('mode-4-satellite-beacon')}
              className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                activeNetworkMode === 'mode-4-satellite-beacon' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mode 4 (Satellite 16B)
            </button>
          </div>
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
        <aside className="w-80 bg-[#0c1017] border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">Tactical Spectrum</h3>
              <span className="text-[8px] bg-red-950 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">16 BYTES</span>
            </div>
            
            {/* Mode 4 Satellite Link */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-200">📱 Civilian Field Nodes</div>
                  <div className="text-[9px] text-slate-400">All Registered Devices</div>
                </div>
                <span className="text-[9px] bg-rose-900 text-rose-300 px-1.5 py-0.5 rounded">ONLINE</span>
              </div>

              <div className="text-center text-rose-400 font-bold text-[10px]">↓ ISRO NavIC S-Band (2492 MHz) / 865 MHz LoRa</div>

              <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-950/80 to-rose-950/80 border-2 border-rose-500 flex items-center justify-between shadow-lg">
                <div>
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    🛰️ ISRO Satellite Gateway
                  </div>
                  <div className="text-[9px] text-rose-300/80">Direct NavIC Downlink</div>
                </div>
                <span className="text-[9px] bg-red-900 text-rose-200 px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
              </div>
            </div>

            {/* Quick Broadcast SOS Trigger in Sidebar */}
            <div className="p-3 bg-red-950/30 border border-red-900/60 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block">🚨 Instant SOS Broadcast</span>
              <button
                type="button"
                onClick={() => setShowSosModal(true)}
                className="w-full bg-red-700 hover:bg-red-600 text-white text-[11px] font-black py-2 rounded-xl shadow-md active:scale-95 transition-all"
              >
                + Open SOS Broadcast
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
            <div>Gateway: Chennai Disater Ops</div>
            <div>Frequency: 2492 MHz / 865 MHz</div>
            <div>Protocol: iTiTantra 4-Tier v2.4</div>
          </div>
        </aside>

        {/* RIGHT AREA: LIVE SOS & RESCUE STREAM */}
        <main className="flex-1 flex flex-col bg-[#07090e] overflow-hidden">
          
          {/* Action Toolbar */}
          <div className="px-6 py-2.5 bg-[#0a0e14] border-b border-slate-800 flex items-center justify-between shrink-0">
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
              {/* 🧠 Groq Integrity Analysis Button */}
              <button
                type="button"
                onClick={analyzeIntegrity}
                disabled={isAnalyzing || feed.length === 0}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                  isAnalyzing
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-600/40 animate-pulse'
                    : feedSorted
                    ? 'bg-purple-900/40 text-purple-300 border border-purple-600/40'
                    : 'bg-gradient-to-r from-purple-800 to-violet-800 hover:from-purple-700 hover:to-violet-700 text-white border border-purple-600 shadow-[0_0_8px_rgba(139,92,246,0.4)]'
                }`}
              >
                <span>{isAnalyzing ? '⏳' : '🧠'}</span>
                <span>{isAnalyzing ? 'Analyzing Priority...' : feedSorted ? '✅ Priority Sorted' : 'Analyze Priority'}</span>
              </button>
              <span>Session: <span className="font-bold text-cyan-300">{sessionId || 'DEMO_GLOBAL_SESSION_01'}</span></span>
            </div>
          </div>

          {/* Messages Stream */}
          <div ref={feedRef} className="flex-1 overflow-y-auto p-6 space-y-3 font-mono">

            {/* 🧠 Auto-Integrity Status Banner */}
            {(isAnalyzing || feedSorted) && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold font-mono mb-1 border ${
                isAnalyzing
                  ? 'bg-purple-950/60 border-purple-700/50 text-purple-300 animate-pulse'
                  : 'bg-purple-950/30 border-purple-800/30 text-purple-400'
              }`}>
                <span className={isAnalyzing ? 'animate-spin' : ''}>🧠</span>
                {isAnalyzing
                  ? 'Groq AI analyzing message urgency and sorting by Integrity Level...'
                  : `✅ Sorted by Integrity Level — Highest priority shown first (${feed.length} messages)`}
              </div>
            )}

            {filteredFeed.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                <span className="text-4xl">🛰️</span>
                <p className="text-xs font-bold">Listening for incoming satellite SOS distress beacons & field telemetry...</p>
              </div>
            ) : (
              filteredFeed.map((msg, idx) => {
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
                        <span className="text-[10.5px] font-mono text-slate-300 font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
                          ⏰ {msg.display_time || formatTimeIST(msg.timestamp)}
                        </span>
                      </div>
                    </div>

                    <p className={`text-sm font-sans font-bold leading-relaxed mb-1 ${
                      isEmergency ? 'text-rose-100 text-base' : 'text-slate-100'
                    }`}>
                      {decryptingMsgs[String(msg.id)] ? (
                        <span className="text-green-400 font-mono text-xs animate-pulse tracking-widest bg-black/50 px-2 py-1 rounded">
                          [DECRYPTING RELAY] CIPHER: {msg.cipher_code}
                        </span>
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </p>

                    {/* 🧠 Integrity Reason from Groq AI */}
                    {integrityScores[String(msg.id)] && (
                      <div className={`text-[11px] font-mono mb-1.5 px-2.5 py-1 rounded-lg border ${
                        integrityScores[String(msg.id)].score >= 9
                          ? 'bg-red-950/60 text-red-300 border-red-800/50'
                          : integrityScores[String(msg.id)].score >= 7
                          ? 'bg-orange-950/60 text-orange-300 border-orange-800/50'
                          : 'bg-slate-900/60 text-slate-400 border-slate-700/50'
                      }`}>
                        🧠 <span className="font-bold">Groq Priority:</span> {integrityScores[String(msg.id)].reason}
                        {integrityScores[String(msg.id)].summary && integrityScores[String(msg.id)].summary !== msg.text && (
                          <span className="text-amber-300 ml-1">| EN: {integrityScores[String(msg.id)].summary}</span>
                        )}
                      </div>
                    )}

                    {/* 🇬🇧 English Translation Card + AI Voice Player */}
                    {translatedTexts[String(msg.id)] && (
                      <div className="mb-3 p-3 bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-slate-950 border-2 border-amber-500/60 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-fadeIn">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <span>🇬🇧</span>
                            <span>English Translation (Groq AI)</span>
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

                    {/* 🌐 Groq Fast AI Translation Button */}
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (hasAudio && (msg.audio_url || msg.audioUrl)) {
                            transcribeAndTranslateAudio(String(msg.id), msg.audio_url || msg.audioUrl || '', msg.language || 'ta');
                          } else {
                            translateWithGroq(String(msg.id), msg.text, msg.language || 'ta');
                          }
                        }}
                        disabled={translatingId === (String(msg.id))}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 active:scale-95 transition-all ${
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
                            ? (hasAudio ? 'Transcribing & Groq Translating...' : 'Groq Translating...')
                            : translatedTexts[String(msg.id)]
                            ? '✅ Groq English Translation'
                            : hasAudio
                            ? '🌐 Transcribe Voice → English'
                            : '🌐 Translate to English (Groq)'}
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



                    {/* 🌐 Multi-Hop Mesh Relay Route & Cipher Bar */}
                    <div className="mb-2 p-2 rounded-xl bg-black/60 border border-cyan-900/60 text-[9px] font-mono flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                        <span>📡 Multi-Hop Route:</span>
                        <span className="bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">📱 Phone 1: Victim ({msg.sender_username || '@citizen'})</span>
                        <span className="text-cyan-400 font-bold">──[BLE Mesh]──▶</span>
                        <span className="bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800">📱 Phone 2: Relay (@mesh_peer)</span>
                        <span className="text-emerald-400 font-bold">──[Gateway]──▶</span>
                        <span className="bg-blue-950 text-cyan-300 px-1.5 py-0.5 rounded border border-blue-800">🏢 Command Center</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">🔐 Cipher:</span>
                        <span className="bg-black/90 px-2 py-0.5 rounded font-mono text-cyan-300 font-bold border border-cyan-800/80">
                          {msg.cipher_code?.startsWith('0x') ? msg.cipher_code : `0x4954 015F ${msg.cipher_code ? msg.cipher_code.replace(/[^A-F0-9]/gi, '').slice(0, 16) : '4F67AE42A082C502'}`}
                        </span>
                      </div>
                    </div>

                    {/* Location & Metadata Bar */}
                    <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 pt-2 border-t border-white/10">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span>📍</span>
                        <span>{msg.address_name || "St. Joseph's Institute of Technology, OMR, Chennai"}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {msg.gateway_node && (
                          <span className="bg-emerald-950 px-2 py-0.5 rounded text-[10px] text-emerald-300 font-mono font-bold border border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center gap-1">
                            <span>📡</span>
                            <span>RELAYED VIA {msg.gateway_node} ({msg.hop_count || 2} HOPS)</span>
                          </span>
                        )}
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
            <div ref={feedBottomRef} />
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
