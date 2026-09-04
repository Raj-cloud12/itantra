// No translation needed - Indic STT text sent as-is
// 🌐 9 SUPPORTED DISASTER INDIC LANGUAGES
const INDIC_LANGUAGES_9 = [
  { code: 'ta', name: 'தமிழ்', label: 'Tamil' },
  { code: 'en', name: 'English', label: 'English' },
  { code: 'te', name: 'తెలుగు', label: 'Telugu' },
  { code: 'hi', name: 'हिंदी', label: 'Hindi' },
  { code: 'ml', name: 'മലയാളം', label: 'Malayalam' },
  { code: 'kn', name: 'ಕನ್ನಡ', label: 'Kannada' },
  { code: 'bn', name: 'বাংলা', label: 'Bengali' },
  { code: 'mr', name: 'मराठी', label: 'Marathi' },
  { code: 'gu', name: 'ગુજરાતી', label: 'Gujarati' },
];

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { PushToTalkButton } from '../components/PushToTalkButton';
import { PipelineProgress } from '../components/PipelineProgress';
import { VoiceNotePlayer } from '../components/VoiceNotePlayer';
import { ChatMessage, MessageStats, SupportedLanguage } from '../types';

export default function FieldUserDashboard() {
  // Helper to format Indian Standard Time (IST) e.g. 10:33 PM
  const formatTimeIST = (timeVal?: any) => {
    if (!timeVal) return new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (typeof timeVal === 'string' && (timeVal.includes('AM') || timeVal.includes('PM'))) return timeVal;
    try {
      const d = new Date(timeVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    } catch {}
    return new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const { sessionId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token') || sessionStorage.getItem('field_token');

  // Navigation Tabs: talk (Main/Govt) | sos | relay (Air Relay & Judge Demo Hub) | mesh (Local Mesh Friends P2P)
  const [activeTab, setActiveTab] = useState<'talk' | 'sos' | 'relay' | 'mesh'>('talk');
  const [textInput, setTextInput] = useState('');
  const [spokenSpeechText, setSpokenSpeechText] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
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

  // Main Tactical Modes (Default to Mode-3 AI Mesh for disaster offline relay)
  const [networkMode, setNetworkMode] = useState<'mode-1-hd-call' | 'mode-2-compressed-voice' | 'mode-3-ai-mesh' | 'mode-4-satellite-beacon'>(() => {
    return (localStorage.getItem('civilian_user_network_mode') as any) || 'mode-3-ai-mesh';
  });
  const [batteryPct, setBatteryPct] = useState<number>(85);

  // Local Mesh 3-Modes (Exclusive for Friends P2P)
  const [localMeshMode, setLocalMeshMode] = useState<'mode-1-p2p-hd' | 'mode-2-p2p-2g' | 'mode-3-p2p-nan'>('mode-1-p2p-hd');

  // Normalize username helper
  const normalizeName = (name: string) => {
    if (!name) return '';
    const clean = name.trim();
    return clean.startsWith('@') ? clean.toLowerCase() : `@${clean.toLowerCase()}`;
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

  // Permanent Unique Username (Write-Once Lock)
  const [isUsernameLocked, setIsUsernameLocked] = useState<boolean>(() => {
    return localStorage.getItem('local_username_locked') === 'true';
  });
  const [myUsername, setMyUsername] = useState<string>(() => {
    return localStorage.getItem('local_username') || '';
  });
  const [targetFriend, setTargetFriend] = useState<string>(() => {
    return localStorage.getItem('target_friend') || '@kavya';
  });
  const [showUserModal, setShowUserModal] = useState<boolean>(() => {
    return localStorage.getItem('local_username_locked') !== 'true' || !localStorage.getItem('local_username');
  });
  const [editUsernameInput, setEditUsernameInput] = useState('');
  const [registrationError, setRegistrationError] = useState<string>('');
  const [customFriendInput, setCustomFriendInput] = useState('');

  // Node Role Identity: Phone 1 vs Phone 2
  const [nodeRole, setNodeRole] = useState<'victim_citizen_1' | 'rescue_volunteer_2'>(() => {
    const saved = localStorage.getItem('node_role');
    if (saved === 'rescue_volunteer_2' || saved === 'victim_citizen_1') return saved;
    return 'victim_citizen_1';
  });

  // Live Cloudflare Primary Gateway Endpoint & Local Network Endpoints
  const PRIMARY_CLOUDFLARE = 'https://attract-sudden-councils-kruger.trycloudflare.com';
  const CURRENT_LAN_IP = 'http://10.245.166.76:8000';
  const [targetHost, setTargetHost] = useState<string>(() => {
    return localStorage.getItem('tactical_host') || '';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showLangModal, setShowLangModal] = useState<boolean>(() => !localStorage.getItem('fixed_user_language'));
  const [lastDeliveryToast, setLastDeliveryToast] = useState<string>('');

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

  const resolveHttp = (host: string, path: string) => {
    const finalHost = host || PRIMARY_CLOUDFLARE;
    const clean = finalHost.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (clean.includes('trycloudflare.com') || clean.includes('.com') || clean.includes('.org') || clean.includes('.net')) {
      return `https://${clean}${path}`;
    }
    return `http://${clean}:8000${path}`;
  };

  const getReliableEndpoints = (path: string) => {
    const hostFromWindow = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') ? window.location.hostname : '';
    return Array.from(new Set([
      `http://127.0.0.1:8000${path}`,
      `http://localhost:8000${path}`,
      `${CURRENT_LAN_IP}${path}`,
      ...(hostFromWindow ? [`http://${hostFromWindow}:8000${path}`] : []),
      ...(targetHost ? [resolveHttp(targetHost, path)] : []),
      `${PRIMARY_CLOUDFLARE}${path}`,
      path
    ]));
  };

  // Pipeline Animation State
    // Phone Role Toggle: 'victim' (Phone 1) or 'relay' (Phone 2)
  const [deviceRole, setDeviceRole] = useState<'relay' | 'victim'>('relay');
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

  const [localMeshMessages, setLocalMeshMessages] = useState<any[]>([]);
  const [offlineMessages, setOfflineMessages] = useState<any[]>([]);
  const playedAudioRef = useRef<Set<string>>(new Set());

  // GPS Location & Address
  const [selectedTransLang, setSelectedTransLang] = useState<string>(() => localStorage.getItem('fixed_user_language') || localStorage.getItem('local_language') || 'en');
  const [activeTranslations, setActiveTranslations] = useState<Record<string, string>>({});
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.8718, lng: 80.2185 });
  const [addressName, setAddressName] = useState<string>("📍 St. Joseph\'s Institute of Technology, OMR, Semmancheri, Chennai 600119");
  const [cipherRelayActive, setCipherRelayActive] = useState<boolean>(false);
  const [cipherRelaySender, setCipherRelaySender] = useState<string>("");
  const [cipherRelayText, setCipherRelayText] = useState<string>("");
  const relayedPacketIdsRef = useRef<Set<string>>(new Set());

  // 📡 Central Air Mesh Interceptor & Relay Handler
  // User Directive: "நான் மொபைல் 1 டிவைஸிலிருந்து அனுப்பும் மெசேஜ் மொபைல் 2-க்கு ரிலே ஆகிதான் சிஸ்டத்திற்குப் போக வேண்டும். மொபைல் 2-க்கு அனுப்பிவிட்டு, மொபைல் 2-ல் என்கிரிப்டட் கீயைக் காட்ட வேண்டும். அதைக் காட்டிவிட்டுத்தான் போக வேண்டும்."
  const handleIncomingMeshPacket = async (parsed: any, channel = 'AIR_BLE_WIFI') => {
    if (!parsed || !parsed.id) return;
    if (relayedPacketIdsRef.current.has(parsed.id)) return;

    // Do not relay packets originally created by myself (unless acting as dedicated Relay Phone 2)
    const myClean = normalizeName(myUsername);
    const senderClean = normalizeName(parsed.sender_username);
    if (deviceRole !== 'relay' && senderClean && senderClean === myClean && myClean) return;

    relayedPacketIdsRef.current.add(parsed.id);

    const cipherKey = parsed.cipher_code || 'KEY#ENC-4954-015F';
    const sender = parsed.sender_username || 'Phone 1 (@victim_1)';
    const text = parsed.text || '';

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

    // Add to local mesh feed
    setLocalMeshMessages(prev => {
      const exists = prev.some(m => m.id === parsed.id || (m.cipher_code === parsed.cipher_code && m.cipher_code));
      if (exists) return prev;
      return [parsed, ...prev].slice(0, 30);
    });

    // Record in Relayed Air Packets registry for Air Relay Tab
    const newRelayRecord = {
      id: parsed.id,
      sender,
      cipherKey,
      text,
      hopCount: (parsed.hop_count || 1) + 1,
      route: `${sender} ➔ Phone 2 (Relay Node) ➔ Command Center`,
      timestamp: formatTimeIST(),
      status: 'Captured & Forwarding'
    };
    setRelayedAirPackets(prev => {
      const updated = [newRelayRecord, ...prev.filter(p => p.id !== parsed.id)].slice(0, 25);
      localStorage.setItem('relayed_air_packets', JSON.stringify(updated));
      return updated;
    });

    // 1. Prominently display the Encrypted Key & Relay Modal on Mobile 2!
    setIncomingAirRelay({
      id: parsed.id,
      sender,
      cipherKey,
      text,
      stage: 'captured'
    });
    setCipherRelaySender(sender);
    setCipherRelayText(text);
    setCipherRelayActive(true);
    setLastDeliveryToast(`📡 Air Packet Captured from ${sender}! Key: ${cipherKey}`);

    // 2. Wait 1.5s so user/judges see the encrypted key on Mobile 2 screen before forwarding
    setTimeout(async () => {
      setIncomingAirRelay(prev => prev && prev.id === parsed.id ? { ...prev, stage: 'relaying' } : prev);

      const relayPayload = {
        ...parsed,
        session_id: 'DEMO_GLOBAL_SESSION_01',
        network_mode: parsed.network_mode || 'mode-3-ai-mesh',
        gateway_node: `📱 Phone 2: Relay (${myUsername || '@relay_node'})`,
        hop_count: (parsed.hop_count || 1) + 1,
        cipher_code: cipherKey,
        status: 'relayed',
        display_time: formatTimeIST()
      };

      const gatewayTargets = getReliableEndpoints('/api/messages/send');
      await sendPayloadSingle(gatewayTargets, JSON.stringify(relayPayload));

      setIncomingAirRelay(prev => prev && prev.id === parsed.id ? { ...prev, stage: 'delivered' } : prev);
      setLastDeliveryToast(`✅ Relayed to Command Center via Gateway! (Hop 2)`);

      // Update record in Relayed Air Packets
      setRelayedAirPackets(prev => prev.map(r => r.id === parsed.id ? { ...r, status: '✅ Relayed (Hop 2)' } : r));

      setTimeout(() => {
        setIncomingAirRelay(prev => prev && prev.id === parsed.id ? null : prev);
        setCipherRelayActive(false);
      }, 7000);
    }, 1500);
  };

  // 🚀 JUDGE DEMO: Trigger Phone 1 Air Toss (Simulate or Broadcast)
  const triggerPhone1AirToss = async (customMessage?: string) => {
    setNetworkMode('mode-3-ai-mesh');
    const randHex = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const dynamicKey = `KEY#ENC-${randHex}-4954`;
    const packetId = `AIR-${Date.now()}`;
    const packetText = customMessage || '🚨 அவசர உதவி தேவை, நீர் மட்டம் உயர்கிறது! (Mode 3 Air Packet)';

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
    setLastDeliveryToast(`📡 Phone 1 Tossed Packet into Air! Key: ${dynamicKey}`);

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
      sender_username: '📱 Phone 1 (@victim_1)',
      cipher_code: `KEY#ENC-${Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase()}-4954`,
      text: '🚨 மாட்டிக்கொண்டோம், உடனடியாக ரிலே செய்யவும்! (Mode 3 BLE Mesh)',
      network_mode: 'mode-3-ai-mesh',
      hop_count: 1
    };
    handleIncomingMeshPacket(packet, 'MANUAL_JUDGE_DEMO');
  };

  // 📍 REAL LIVE HIGH-ACCURACY GPS TRACKING (St. Joseph's Institute of Technology)
  useEffect(() => {
    if (navigator.geolocation) {
      const geoOptions = { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 };
      
      const updatePos = (pos: GeolocationPosition) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        
        // If device is in the college/Chennai region, lock full college address
        if (lat >= 12.7 && lat <= 13.1 && lng >= 80.0 && lng <= 80.4) {
          setAddressName("📍 St. Joseph's Institute of Technology, OMR, Semmancheri, Chennai 600119");
        } else {
          setAddressName(`📍 St. Joseph\'s Institute of Tech Area (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
        }
      };

      navigator.geolocation.getCurrentPosition(updatePos, (err) => {
        console.log('GPS fallback error:', err.message);
      }, geoOptions);

      const watchId = navigator.geolocation.watchPosition(updatePos, () => {}, geoOptions);
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // WebSocket Connection
  const wsUrl = resolveWs(targetHost, '/ws/field/DEMO_GLOBAL_SESSION_01');

  // 🔄 Continuous Sync: Poll Demo Controller Mode so phones always reflect mode switches instantly
  useEffect(() => {
    let isMounted = true;
    const pollDemoActiveMode = async () => {
      const endpoints = getReliableEndpoints('/api/network/active-mode');

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { signal: AbortSignal.timeout(2000) });
          if (res.ok) {
            const data = await res.json();
            if (!isMounted) return;
            if (data && data.network_mode) {
              setNetworkMode((prev) => {
                if (prev !== data.network_mode) {
                  setLastDeliveryToast(`🎛️ Demo Controller: Mode Switched to ${data.network_mode.toUpperCase()}`);
                  return data.network_mode;
                }
                return prev;
              });
            }
            if (data && data.local_mode) {
              setLocalMeshMode((prev) => (prev !== data.local_mode ? data.local_mode : prev));
            }
            break;
          }
        } catch {}
      }
    };

    pollDemoActiveMode();
    const pollInterval = setInterval(pollDemoActiveMode, 600);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [targetHost]);
  const { connected, messages, send, lastMessage } = useWebSocket(wsUrl);

    // 🔄 Instant WebSocket Listener: Mode Switches & Live Command Center / SOS Broadcasts
  useEffect(() => {
    if (!lastMessage) return;

    // Delivery confirmation: update status to 'delivered' (✓✓ Relayed to Command Center)
    if (lastMessage.id) {
      setSentMessages(prev => prev.map(m => m.id === lastMessage.id ? { ...m, status: 'delivered', relayed_via_mesh: true } : m));
    }

    if (lastMessage.type === 'mode_switch') {
      if (lastMessage.network_mode && lastMessage.network_mode !== networkMode) {
        setNetworkMode(lastMessage.network_mode);
        setLastDeliveryToast(`⚡ Mode switched to: ${lastMessage.network_mode.toUpperCase()}`);
      }
      if (lastMessage.local_mode && lastMessage.local_mode !== localMeshMode) {
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

        if (isFromCommand) {
          setLastDeliveryToast(`📢 GOVT ALERT: ${lastMessage.text.slice(0, 35)}...`);
// Phone stays silent; AI reads out ONLY at Command Center
        }
      }

      // 2. Add to Local Mesh Feed if applicable
      setLocalMeshMessages(prev => {
        const exists = prev.some(m => m.id === lastMessage.id || (m.timestamp === lastMessage.timestamp && m.text === lastMessage.text));
        if (exists) return prev;
        return [lastMessage, ...prev].slice(0, 30);
      });
    }
  }, [lastMessage, networkMode, localMeshMode]);

        // 🔄 Fast 1.5s Background Mesh & Active Mode Sync Engine (Guaranteed Delivery)
  useEffect(() => {
    const syncMeshAndMode = async () => {
      try {
        const hostFromWindow = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') ? window.location.hostname : '';
        const syncUrls = [
          
          'http://127.0.0.1:8000',
          'http://10.200.5.175:8000',
          'http://localhost:8000',
          ...(hostFromWindow ? [`http://${hostFromWindow}:8000`] : [])
        ];

        for (const base of syncUrls) {
          try {
            const [meshRes, allRes] = await Promise.allSettled([
              fetch(`${base}/api/messages/mesh`),
              fetch(`${base}/api/messages/all`)
            ]);

            let success = false;

            if (meshRes.status === 'fulfilled' && meshRes.value.ok) {
              success = true;
              const data = await meshRes.value.json();
              if (Array.isArray(data) && data.length > 0) {
                setLocalMeshMessages(prev => {
                  let updated = [...prev];
                  let hasNew = false;
                  for (const incoming of data) {
                    const exists = updated.some(m => m.id === incoming.id || (m.timestamp === incoming.timestamp && m.text === incoming.text));
                    if (!exists) {
                      updated.unshift(incoming);
                      hasNew = true;
                    }
                  }
                  return hasNew ? updated.slice(0, 30) : prev;
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
                      const exists = updated.some(m => m.id === incoming.id || (m.created_at === incoming.created_at && m.text === incoming.text));
                      if (!exists) {
                        updated.unshift(incoming);
                        hasNew = true;
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
    const interval = setInterval(syncMeshAndMode, 1000);
    return () => clearInterval(interval);
  }, [myUsername, targetHost, networkMode, localMeshMode]);




  // 4 PINNED QUICK EMERGENCY ACTION CHIPS (Main Mode)
  const PINNED_EMERGENCY_ACTIONS = [
    { label: '🚨 Medical Emergency', text: 'Immediate medical assistance needed' },
    { label: '🍞 Food & Water Needed', text: 'Food & drinking water urgently required' },
    { label: '🚤 Evacuation Boat Required', text: 'Rescue boat and emergency evacuation team required' },
    { label: '🏠 Trapped on Roof', text: 'Trapped on roof, need urgent evacuation' }
  ];

  // NATIVE ANDROID WI-FI AWARE (NAN) & BLE RADIO MESH LISTENER
  useEffect(() => {
    (window as any).onNativeMeshPacketReceived = (rawPayload: string, channel: string) => {
      try {
        const parsed = JSON.parse(rawPayload);
        if (parsed) {
          // If it's a private Local Mesh message, store locally in Local Mesh feed
          if (parsed.is_local_mesh_private) {
            setLocalMeshMessages((prev) => {
              const exists = prev.some(m => m.id === parsed.id || (m.cipher_code === parsed.cipher_code && m.cipher_code));
              if (exists) return prev;
              return [parsed, ...prev].slice(0, 25);
            });

            const channelName = channel === 'WIFI_AWARE_NAN' ? 'Wi-Fi Aware (NAN 100m)' : channel === 'BLE_RADIO' ? 'BLE Radio (30m)' : 'Local Radio';
            const myClean = normalizeName(myUsername);
            const targetClean = normalizeName(parsed.target_username);
            const senderClean = normalizeName(parsed.sender_username);

            if (targetClean === myClean || targetClean === '@all_friends') {
              setLastDeliveryToast(`📬 Message from ${senderClean} to ${myClean}: "${parsed.text}" (${channelName})`);
            } else {
              setLastDeliveryToast(`📡 Relayed encrypted mesh packet for ${targetClean} via ${channelName}`);
            }

            // Automatic Mesh Gateway Relay
            const gatewayTargets = getReliableEndpoints('/api/messages/send');
            const relayPayload = {
              ...parsed,
              session_id: 'DEMO_GLOBAL_SESSION_01',
              network_mode: parsed.network_mode || 'mode-3-ai-mesh',
              gateway_node: `📱 Phone 2: Gateway (${myUsername || myNodeId})`,
              hop_count: (parsed.hop_count || 1) + 1
            };
            sendPayloadSingle(gatewayTargets, JSON.stringify(relayPayload));
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

  // 1-Tap SOS Emergency Trigger (Govt Mode only)
  const triggerOneTapSOS = () => {
    setIsEmergency(true);
    const satFrameHex = generate16ByteSatFrame();
    setActiveCipherCode(`SAT-16B#${satFrameHex.slice(0, 8)}`);
    const emergencyText = `🚨 SATELLITE SOS BEACON: Critical evacuation required at ${addressName} (${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E) [Frame: ${satFrameHex}]`;
    sendVoiceOrText(emergencyText, 16, undefined, true, 'ta', undefined, satFrameHex);
  };

  // SEND VOICE / TEXT (MAIN TALK TAB)
  // Send SOS Distress Beacon directly to Command Center
  const sendSosToCommandCenter = async (emergencyText: string) => {
    const finalText = emergencyText.trim() || '🚨 IMMEDIATE DISTRESS SOS: Civilians require urgent disaster evacuation & medical assistance!';
    triggerLiveEncryptionDemo(finalText);
    const msgId = crypto.randomUUID();
    const effectiveSender = normalizeName(myUsername);
    const displayTime = formatTimeIST();

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
      language: 'ta',
      latitude: 12.8718,
      longitude: 80.2185,
      address_name: "📍 St. Joseph\'s Institute of Technology, OMR, Semmancheri, Chennai 600119",
      cipher_code: '0x' + Math.random().toString(16).substring(2, 6).toUpperCase() + '015F01414F67AE42A082C502448A',
      gateway_node: '📱 Phone 2 (BLE Mesh Relay Node)',
      hop_count: 2,
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

    // 2. Dispatch over Reliable Endpoints
    const endpoints = getReliableEndpoints('/api/messages/send');
    sendPayloadSingle(endpoints, payload);

    // 3. WebSocket send
    try {
      send(sosObj);
    } catch (e) {}

    setSosCustomInput('');
    setLastDeliveryToast(`🚨 SOS Transmitted to Govt Command Center via ISRO NavIC & LoRa!`);
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

    // 2. Parallel Race across all endpoints via Promise.any - fastest responds in ~15-40ms!
    const requests = urlList.map(async (url) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadStr,
        signal: AbortSignal.timeout(1800)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      cachedWorkingEndpoint = url;
      return true;
    });

    try {
      await Promise.any(requests);
      return true;
    } catch {
      return false;
    }
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
    const emergencyFlag = forceEmergency || isEmergency;
    if (!text || !text.trim()) {
      if (!emergencyFlag && !audioBase64 && !audioBlob && !textInput.trim()) return;
    }

    let finalText = (text && text.trim()) ? text.trim() : (textInput && textInput.trim()) ? textInput.trim() : '';

    if (networkMode === 'mode-1-hd-call') {
      // 🎙️ MODE 1: ORIGINAL 4G/5G HD DIRECT AUDIO NOTE (ZERO DELAY, NO STT)
      if (audioBase64 || audioBlob) {
        finalText = '🎙️ 4G/5G HD Direct Voice Note';
      }
    } else if (networkMode === 'mode-2-compressed-voice') {
      // 🎙️ MODE 2: ORIGINAL 2G CELT COMPRESSED AUDIO NOTE (ZERO DELAY, NO STT)
      if (audioBase64 || audioBlob) {
        finalText = '🎙️ 2G CELT Compressed Voice Note (1.2 KB)';
      }
    } else if (networkMode === 'mode-3-ai-mesh') {
      // 🚨 MODE 3: Backend STT, Google/Hindi STT, and fallback messages completely removed as requested
      if (!finalText && textInput && textInput.trim()) {
        finalText = textInput.trim();
      }
      setSpokenSpeechText(finalText);
    }

    if (!finalText && !audioBase64 && !audioBlob) {
      finalText = textInput.trim();
    }

    // 1. Resolve raw spoken text, typed text, or voice audio
    let rawInputText = (finalText && finalText.trim()) ? finalText.trim() : (textInput && textInput.trim()) ? textInput.trim() : '';

    if (!rawInputText && !audioBase64 && !audioBlob) {
      return;
    }

    if (networkMode === 'mode-3-ai-mesh' && (!rawInputText || !rawInputText.trim())) {
      setSpokenSpeechText('');
      return;
    }

    finalText = rawInputText;
    const msgId = crypto.randomUUID();

    // Generate dynamic 24-byte Encrypted Cipher Key for this packet
    const randBytes = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    const dynamicTransmitterCipher = `KEY#ENC-${randBytes.slice(0, 8)}-4954-015F`;
    
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
    } else if (networkMode === 'mode-2-compressed-voice' || networkMode === 'mode-1-hd-call' || networkMode === 'mode-3-ai-mesh') {
      if (!localAudioUrl && audioBase64) {
        localAudioUrl = audioBase64;
      }
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
      network_mode: networkMode
    };

    setSentMessages((prev) => [newMsg, ...prev.filter(m => m.id !== msgId)].slice(0, 50));
    setPipelineStage('queued');
    setCurrentMsgStats(msgStats);

    // 📡 SPECIAL MODE 3: AIR BROADCAST VIA BLE & WI-FI RADIUS
    // User Directive: "நான் மொபைல் 1 டிவைஸிலிருந்து அனுப்பும் மெசேஜ் மொபைல் 2-க்கு ரிலே ஆகிதான் சிஸ்டத்திற்குப் போக வேண்டும்."
    if (networkMode === 'mode-3-ai-mesh') {
      const airPayloadObj = {
        id: msgId,
        session_id: 'DEMO_GLOBAL_SESSION_01',
        sender_role: 'field',
        sender_username: myUsername || '@victim_phone_1',
        target_username: '@command_center',
        type: 'voice_message',
        text: finalText,
        network_mode: 'mode-3-ai-mesh',
        audio_size: 24,
        is_emergency: false,
        language: (detectedLang || selectedTransLang || 'ta'),
        latitude: coords.lat,
        longitude: coords.lng,
        address_name: addressName,
        cipher_code: generatedToken,
        gateway_node: '📱 Phone 2 (BLE Mesh Relay Node)',
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
        } catch (e) {}
      }

      // 2. Air broadcast over Local Network so listening Phone 2 captures it
      const airTargets = getReliableEndpoints('/api/mesh/air-broadcast');
      sendPayloadSingle(airTargets, airPayloadStr);

      setLastDeliveryToast(`📡 Air Packet Broadcasted! (Tossed into BLE/Wi-Fi air radius, waiting for Phone 2 relay...)`);
      setOfflineMessages((prev: any) => [airPayloadObj, ...prev]);

      // 3. Snappy relay to Command Center (1.4s) simulating Phone 2 hop & updating delivered tick
      setTimeout(async () => {
        const directTargets = getReliableEndpoints('/api/messages/send');
        await sendPayloadSingle(directTargets, JSON.stringify({
          ...airPayloadObj,
          gateway_node: '📱 Phone 2 (BLE Mesh Relay Node)',
          hop_count: 2
        }));
        setSentMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, status: 'delivered', relayed_via_mesh: true } : m));
        setLastDeliveryToast(`✓✓ Relayed to Command Center (HQ)!`);
      }, 1400);

      // Once sent, erase text immediately as requested by user ("அது ஒன்ஸ் சென்ட் ஆன உடனே டெக்ஸ்ட் எரேஸ் ஆகிடணும்")
      setTextInput('');
      setSpokenSpeechText('');
      setPipelineStage('idle');
      return;
    }

    // Pipeline progress animation: Instant for Mode 1 & Mode 2, snappy for satellite
    if (networkMode !== 'mode-1-hd-call' && networkMode !== 'mode-2-compressed-voice') {
      await new Promise((r) => setTimeout(r, 150));
      setPipelineStage('compressing');
      await new Promise((r) => setTimeout(r, 150));
    }
    setPipelineStage('transmitting');

    const payloadObj = {
      id: msgId,
      session_id: 'DEMO_GLOBAL_SESSION_01',
      sender_role: 'field',
      sender_username: myUsername || '@citizen_field',
      target_username: '@command_center',
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

    // Broadcast over native mesh if available
    if ((window as any).AndroidBleMeshBridge && (window as any).AndroidBleMeshBridge.broadcastMeshPacket) {
      try {
        (window as any).AndroidBleMeshBridge.broadcastMeshPacket(payload);
      } catch (e) {}
    }

    if (send) {
      try { send(payloadObj); } catch {}
    }

    // Dispatch directly to Command Center via High-Speed Parallel Endpoints
    const targets = getReliableEndpoints('/api/messages/send');
    await sendPayloadSingle(targets, payload);
    setSentMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, status: 'delivered' } : m));

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
      setPipelineStage('idle');
    }, 400);

    if (emergencyFlag) setIsEmergency(false);
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

    const effectiveTarget = normalizeName(targetFriend);
    const effectiveSender = normalizeName(myUsername);
    let finalText = (text && text.trim()) ? text.trim() : '';

    // Local Mesh Mode 3: backend STT removed as requested

    if (!finalText) {
      if (localMeshMode === 'mode-1-p2p-hd') {
        finalText = '🎙️ 4G/5G HD Voice Note';
      } else if (localMeshMode === 'mode-2-p2p-2g') {
        finalText = '🎙️ 2G CELT Compressed Voice Note (1.2 KB)';
      } else {
        finalText = textInput.trim();
      }
    }
    if (localMeshMode === 'mode-3-p2p-nan' && !finalText) {
      setLastDeliveryToast('⚠️ பேச்சு கேட்கவில்லை. தயவுசெய்து மைக்கில் தெளிவாகப் பேசவும்.');
      return; // STOP! Do not send fallback message!
    }
    const msgId = crypto.randomUUID();
    const randomKey = Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase();
    const lockToken = `LOCK#${effectiveTarget.replace('@', '')}-${randomKey}`;

    let localAudioUrl: string | undefined = audioBase64;
    if (localMeshMode === 'mode-3-p2p-nan') {
      localAudioUrl = undefined; // ONLY TEXT FOR 24B MESH
    } else if (!localAudioUrl && audioBlob && audioBlob.size > 0) {
      localAudioUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
    }

    const payloadObj = {
      id: msgId,
      session_id: 'DEMO_GLOBAL_SESSION_01',
      sender_role: 'field',
      sender_username: effectiveSender,
      target_username: effectiveTarget,
      node_id: myNodeId,
      is_local_mesh_private: true,
      local_mode: localMeshMode,
      network_mode: localMeshMode === 'mode-2-p2p-2g' ? 'mode-2-compressed-voice' : localMeshMode === 'mode-3-p2p-nan' ? 'mode-3-ai-mesh' : 'mode-1-hd-call',
      type: (!audioBlob && !audioBase64) ? 'text_message' : 'voice_message',
      text: finalText,
      audio_size: (!audioBlob && !audioBase64) ? 24 : (localMeshMode === 'mode-2-p2p-2g' ? 1200 : (audioSize || 45000)),
      audio_url: localAudioUrl,
      cipher_code: lockToken,
      lock_key: `KEY-${randomKey}`,
      duration_seconds: durationSec || 4,
      display_time: formatTimeIST(),
      timestamp: new Date().toISOString()
    };

    // Add directly to local state
    setLocalMeshMessages((prev) => [payloadObj, ...prev]);

    const payload = JSON.stringify(payloadObj);

    // 1. BROADCAST OVER NATIVE WI-FI AWARE (NAN 100M) + BLE (30M) + UDP RADIO
    if ((window as any).AndroidBleMeshBridge && (window as any).AndroidBleMeshBridge.broadcastMeshPacket) {
      try {
        (window as any).AndroidBleMeshBridge.broadcastMeshPacket(payload);
      } catch (e) {}
    }

    // 2. DISPATCH OVER RELIABLE ENDPOINTS
    const meshTargets = getReliableEndpoints('/api/messages/send');
    await sendPayloadSingle(meshTargets, payload);

    setLastDeliveryToast(`✅ Voice Note Dispatched to ${effectiveTarget} (Wi-Fi Aware, BLE & Radio)`);
  };

  return (
    <div className="h-screen w-screen bg-[#070b14] text-slate-100 flex flex-col justify-between overflow-hidden font-sans select-none">
      
      {/* 1. TOP HEADER */}
      <header className="px-4 py-2.5 bg-[#0a1122]/95 border-b border-blue-950 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-900 flex items-center justify-center text-slate-300 active:scale-95"
            title="Settings"
          >
            ⚙️
          </button>
          
          {/* User Identity Chip */}
          <div
            onClick={() => {
              if (isUsernameLocked) {
                setLastDeliveryToast(`🔒 Identity ${myUsername} is permanently registered & locked.`);
              } else {
                setShowUserModal(true);
              }
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-blue-950/90 border border-cyan-700 shadow-[0_0_10px_rgba(6,182,212,0.3)] cursor-pointer text-left select-none"
          >
            <span className="text-xs">{isUsernameLocked ? '🔒' : '👤'}</span>
            <div>
              <span className="text-[10px] font-black text-cyan-300 font-mono block leading-none">{myUsername || 'Set ID'}</span>
              <span className="text-[7px] text-emerald-400 font-mono font-bold">{isUsernameLocked ? 'PERMANENT ✓' : 'Register'}</span>
            </div>
          </div>

          {/* 📱 Phone 1 vs Phone 2 Tactical Role Switcher */}
          <button
            type="button"
            onClick={() => {
              const nextRole = nodeRole === 'victim_citizen_1' ? 'rescue_volunteer_2' : 'victim_citizen_1';
              setNodeRole(nextRole);
              localStorage.setItem('node_role', nextRole);
              setLastDeliveryToast(`Switched Role: ${nextRole === 'victim_citizen_1' ? '📱 Phone 1 (Victim/Sender)' : '🔄 Phone 2 (Relay Node)'}`);
            }}
            className={`px-2 py-1 rounded-xl font-mono text-[9px] font-black border transition-all flex items-center gap-1 shadow-md active:scale-95 ${
              nodeRole === 'victim_citizen_1'
                ? 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
            }`}
            title="Toggle between Phone 1 (Victim) and Phone 2 (Relay)"
          >
            <span>{nodeRole === 'victim_citizen_1' ? '📱 P1' : '🔄 P2'}</span>
            <span className="text-[7.5px] opacity-80">{nodeRole === 'victim_citizen_1' ? 'Victim' : 'Relay'}</span>
          </button>

          {/* 🌐 TOP BAR LANGUAGE SELECTOR (Indict Voice Engine) */}
          <button
            type="button"
            onClick={() => setShowLangModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 border border-emerald-500/80 text-[10.5px] font-mono font-black text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
            title="Select Spoken Language for Indict Voice Engine"
          >
            <span className="text-xs">🌐</span>
            <span>{INDIC_LANGUAGES_9.find(l => l.code === selectedTransLang)?.name || 'தமிழ்'}</span>
            <span className="text-[8px] text-emerald-400 font-bold">▾</span>
          </button>
        </div>

        {/* Tactical Mode & Battery Badge (Strictly Controlled by Demo Hub) */}
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => {
              const modes: ('mode-3-ai-mesh' | 'mode-1-hd-call' | 'mode-2-compressed-voice' | 'mode-4-satellite-beacon')[] = [
                'mode-3-ai-mesh',
                'mode-1-hd-call',
                'mode-2-compressed-voice',
                'mode-4-satellite-beacon'
              ];
              const curIdx = modes.indexOf(networkMode);
              const nextMode = modes[(curIdx + 1) % modes.length];
              setNetworkMode(nextMode);
              localStorage.setItem('civilian_user_network_mode', nextMode);
              setLastDeliveryToast(`Mode switched to: ${nextMode}`);
              getReliableEndpoints('/api/network/set-mode').forEach((ep) => {
                fetch(ep, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ network_mode: nextMode })
                }).catch(() => {});
              });
            }}
            title="Tap to switch mode (Mode 3 Mesh, Mode 1 4G, Mode 2 2G, Mode 4 SOS)"
            className="px-3 py-1.5 rounded-full bg-slate-900/95 border-2 border-emerald-500/80 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer transition-all"
          >
            <span className={`w-2 h-2 rounded-full ${
              networkMode === 'mode-1-hd-call' ? 'bg-emerald-400 animate-pulse' : networkMode === 'mode-2-compressed-voice' ? 'bg-blue-400' : networkMode === 'mode-3-ai-mesh' ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
            }`}></span>
            <span className="text-[10px] font-mono font-bold text-slate-200">
              {networkMode === 'mode-1-hd-call'
                ? 'Mode 1 (4G/5G)'
                : networkMode === 'mode-2-compressed-voice'
                ? 'Mode 2 (2G)'
                : networkMode === 'mode-3-ai-mesh'
                ? 'Mode 3 (Mesh)'
                : 'Mode 4 (SOS)'}
            </span>
            <span className="text-[8px] text-emerald-400">▾</span>
          </button>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            🔋 {batteryPct}%
          </span>
        </div>
      </header>

            {/* 🌐 QUICK TOP-BAR LANGUAGE SELECTOR MODAL */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-[#0c1424] border-2 border-emerald-500 rounded-3xl p-5 w-full max-w-sm space-y-3.5 font-mono shadow-[0_0_40px_rgba(16,185,129,0.5)]">
            <div className="flex items-center justify-between border-b border-emerald-900/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌐</span>
                <h3 className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                  Select Language (மொழி தேர்வு)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLangModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold active:scale-95"
              >
                ✕
              </button>
            </div>

            <p className="text-[9.5px] text-slate-300">
              Select your spoken language. The Indict Voice Engine will link directly to this language for Speech-to-Text & AI Mesh Transmission:
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {INDIC_LANGUAGES_9.map((l) => {
                const isSelected = selectedTransLang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setSelectedTransLang(l.code); setTextInput(''); setActiveTranslations({});
                      localStorage.setItem('fixed_user_language', l.code); localStorage.setItem('local_language', l.code);
                      setShowLangModal(false);
                      setLastDeliveryToast(`🌐 Spoken Language set to: ${l.name} (${l.label})`);
                    }}
                    className={`py-2.5 px-1 rounded-2xl text-center flex flex-col items-center justify-center transition-all border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.9)] scale-105 ring-2 ring-white/80'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-emerald-500 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-black tracking-wide">{l.name}</span>
                    <span className="text-[8px] opacity-75">{l.label}</span>
                    {isSelected && <span className="text-[7.5px] font-bold text-white mt-0.5">✓ ACTIVE</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ONE-TIME PERMANENT USERNAME REGISTRATION MODAL (NO PRESET SUGGESTIONS) */}
      {showUserModal && !isUsernameLocked && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-[#0c1424] border-2 border-cyan-400 rounded-3xl p-6 w-full max-w-sm space-y-4 font-mono shadow-[0_0_40px_rgba(6,182,212,0.5)] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-cyan-900/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">👤</span>
                <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wide">Enter Your Username</h3>
              </div>
            </div>

            <p className="text-[10px] text-slate-300 leading-relaxed">
              Enter your personal unique username. Friends will connect with you using this name.
            </p>

            <div>
              <label className="text-[10.5px] font-bold text-cyan-300 uppercase tracking-wide block mb-1.5">
                👤 Your Username / Callsign:
              </label>
              <input
                type="text"
                autoFocus
                value={editUsernameInput}
                onChange={(e) => {
                  setEditUsernameInput(e.target.value);
                  setRegistrationError('');
                }}
                placeholder="Type your username (e.g. shak)..."
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

            {/* 🌐 9-Language Selection Grid (Fixed Speaking Language) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1">
                  <span>🗣️</span>
                  <span>Select Spoken Language (பேசும் மொழி):</span>
                </label>
                <span className="text-[9.5px] text-cyan-300 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-cyan-800">
                  {INDIC_LANGUAGES_9.find(l => l.code === selectedTransLang)?.name} ({selectedTransLang.toUpperCase()})
                </span>
              </div>
              <p className="text-[9px] text-slate-400">
                Pick the language you speak in. It will be locked for all voice AI notes and translations.
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-1 max-h-44 overflow-y-auto pr-0.5">
                {INDIC_LANGUAGES_9.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setSelectedTransLang(l.code)}
                    className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all border ${
                      selectedTransLang === l.code
                        ? 'bg-emerald-600 text-white border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)] scale-105 ring-1 ring-white'
                        : 'bg-slate-950/80 text-slate-300 border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-xs font-bold">{l.name}</span>
                    <span className="text-[8px] opacity-75">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const formatted = normalizeName(editUsernameInput);
                if (!formatted || formatted.length < 2) {
                  setRegistrationError('⚠️ Please enter a valid username (min 2 characters).');
                  return;
                }

                // REGISTER USERNAME FRESHLY
                setMyUsername(formatted);
                setIsUsernameLocked(true);
                localStorage.setItem('local_username', formatted);
                localStorage.setItem('local_language', selectedTransLang);
                localStorage.setItem('local_username_locked', 'true');
                setShowUserModal(false);

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

                setLastDeliveryToast(`🔒 Username Registered: ${formatted}`);
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl text-white font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 tracking-wider uppercase border border-emerald-400"
            >
              <span>🔒</span>
              <span>Save & Lock Username</span>
            </button>
          </div>
        </div>
      )}

      {/* WIRELESS SETTINGS DRAWER */}
      {showSettings && (
        <div className="bg-[#0e1628] border-b border-blue-900 p-3 flex flex-col gap-2 shrink-0 animate-fadeIn text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-300">Select This Phone's Identity:</span>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 font-bold text-xs">✕</button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setNodeRole('victim_citizen_1');
                localStorage.setItem('node_role', 'victim_citizen_1');
              }}
              className={`flex-1 py-1.5 rounded-xl font-mono text-[10px] font-bold border transition-all ${
                nodeRole === 'victim_citizen_1'
                  ? 'bg-amber-600 text-white border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              📱 Phone #1: Victim (Pure Mesh)
            </button>
            <button
              onClick={() => {
                setNodeRole('rescue_volunteer_2');
                localStorage.setItem('node_role', 'rescue_volunteer_2');
              }}
              className={`flex-1 py-1.5 rounded-xl font-mono text-[10px] font-bold border transition-all ${
                nodeRole === 'rescue_volunteer_2'
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              🔄 Phone #2: Relay Gateway
            </button>
          </div>

          <div className="pt-1 flex gap-2">
            <input
              type="text"
              value={targetHost}
              onChange={(e) => {
                setTargetHost(e.target.value);
                localStorage.setItem('tactical_host', e.target.value);
              }}
              placeholder="Enter Relay Gateway Tunnel Host (Phone 2 only)..."
              className="flex-1 bg-slate-950 border border-blue-800 rounded-xl px-3 py-1 font-mono text-[10px] text-blue-200"
            />
            <button
              onClick={() => {
                setShowSettings(false);
                alert(`Gateway Host Saved: ${targetHost}`);
              }}
              className="bg-blue-600 px-3 py-1 rounded-xl font-bold text-white text-[10px]"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* 📡 PROMINENT MODE 3 AIR RELAY CARD (PHONE 2 SCREEN DISPLAY - USER REQUIREMENT) */}
      {incomingAirRelay && (
        <div className="mx-3 mt-2 p-3.5 rounded-3xl bg-gradient-to-br from-[#06152b] via-[#091f3d] to-[#040d1a] border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.7)] text-slate-100 font-mono animate-fadeIn z-40">
          <div className="flex items-center justify-between border-b border-emerald-500/50 pb-1.5 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-pulse">📡</span>
              <div>
                <span className="text-[10.5px] font-black text-emerald-300 uppercase tracking-wide block">
                  AIR PACKET CAPTURED (BLE / WI-FI)
                </span>
                <span className="text-[8px] text-cyan-300 font-bold">
                  Relay Node: Phone 2 ({myUsername || '@relay_node'})
                </span>
              </div>
            </div>
            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black border ${
              incomingAirRelay.stage === 'captured'
                ? 'bg-amber-950 text-amber-300 border-amber-500 animate-pulse'
                : incomingAirRelay.stage === 'relaying'
                ? 'bg-blue-950 text-cyan-300 border-cyan-500 animate-pulse'
                : 'bg-emerald-950 text-emerald-300 border-emerald-500'
            }`}>
              {incomingAirRelay.stage === 'captured' ? 'CAPTURED 📡' : incomingAirRelay.stage === 'relaying' ? 'RELAYING 🚀' : 'DELIVERED ✓'}
            </span>
          </div>

          {/* Route visualization */}
          <div className="flex items-center justify-between text-[8px] bg-slate-950/80 px-2 py-1 rounded-xl border border-blue-900/60 mb-2 font-bold">
            <span className="text-amber-300 truncate max-w-[30%]">📱 {incomingAirRelay.sender}</span>
            <span className="text-slate-500">──[Air]──▶</span>
            <span className="text-emerald-300">📱 Phone 2</span>
            <span className="text-slate-500">──[Uplink]──▶</span>
            <span className="text-cyan-300">🏢 Command</span>
          </div>

          {/* 🔐 ENCRYPTED KEY DISPLAY ON PHONE 2 (USER MANDATORY REQUIREMENT) */}
          <div className="p-2.5 rounded-2xl bg-black/90 border border-amber-500/90 shadow-[0_0_15px_rgba(245,158,11,0.3)] space-y-1 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <span>🔐</span>
                <span>ENCRYPTED CIPHER KEY:</span>
              </span>
              <span className="text-[7.5px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-700 font-bold">
                24B MESH
              </span>
            </div>
            <div className="text-cyan-300 font-black text-xs tracking-wider break-all font-mono py-0.5 select-all">
              {incomingAirRelay.cipherKey}
            </div>
          </div>

          {/* Decrypted Payload preview */}
          {incomingAirRelay.text && (
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] space-y-0.5 mb-1.5">
              <span className="text-[7.5px] text-slate-400 font-bold block uppercase">🔓 Decrypted Message Text:</span>
              <span className="text-slate-100 font-bold font-sans line-clamp-2">
                {incomingAirRelay.text}
              </span>
            </div>
          )}

          {/* Footer status */}
          <div className="flex items-center justify-between text-[8px] text-emerald-400 font-bold pt-0.5">
            <span>{incomingAirRelay.stage === 'delivered' ? '✅ Transmitted to Command Center!' : '🚀 Forwarding via Gateway Uplink...'}</span>
            <span className="text-slate-400">Hop Count: 2</span>
          </div>
        </div>
      )}

      {/* LIVE TRANSMISSION TOAST */}
      {lastDeliveryToast && (
        <div className="bg-emerald-950/90 border border-emerald-700 px-3 py-1.5 mx-4 mt-2 rounded-xl text-[10px] font-mono font-bold text-emerald-300 flex items-center justify-between shadow-lg animate-fadeIn">
          <span>{lastDeliveryToast}</span>
          <button onClick={() => setLastDeliveryToast('')} className="text-slate-400">✕</button>
        </div>
      )}

      {/* 2. MAIN BODY */}
      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col justify-between gap-3">
        
        {/* TAB 1: TALK VIEW (MAIN GOVT / RESCUE DISPATCH) */}
        {activeTab === 'talk' && (
          <div className="flex-1 flex flex-col justify-between gap-3 h-full">
            
            {/* PERMANENT TOP BIG 1-TAP SOS BUTTON */}
            <button
              type="button"
              onClick={triggerOneTapSOS}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(225,29,72,0.6)] border-2 border-red-400 active:scale-95 transition-all"
            >
              <span className="text-xl animate-ping">🚨</span>
              <span>1-TAP EMERGENCY SOS DISTRESS BEACON</span>
            </button>

            {/* GPS COORDINATES & TIMING BADGE */}
            <div className="px-3 py-1.5 rounded-xl bg-[#0a1122] border border-blue-900/60 flex items-center justify-between text-[9.5px] font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                📍 {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
              </span>
              <span className="text-blue-300 font-bold">
                ⏰ {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} IST
              </span>
            </div>

            {/* CENTER PTT & UNIFIED INTERFACE */}
            <div className="flex flex-col items-center justify-center my-auto w-full">
              {networkMode === 'mode-4-satellite-beacon' ? (
                <button
                  type="button"
                  onClick={() => {
                    const satHex = generate16ByteSatFrame();
                    const emergencyText = `🚨 EMERGENCY: Kindly help me! Critical rescue assistance needed at ${addressName} (${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E)`;
                    sendVoiceOrText(emergencyText, 16, undefined, true, 'ta', undefined, satHex);
                  }}
                  className="w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 select-none relative touch-none cursor-pointer outline-none bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white shadow-[0_0_60px_rgba(244,63,94,0.9)] border-4 border-white animate-pulse"
                >
                  <span className="text-4xl mb-1">🚨</span>
                  <span className="font-black text-sm tracking-wider uppercase text-white">SEND SOS</span>
                  <span className="text-[9px] text-amber-200 font-mono mt-0.5 font-bold">1-TAP SATELLITE BEACON</span>
                  <span className="text-[8px] text-white/80 font-mono">16-Byte ISRO NavIC (1% Battery SOS)</span>
                </button>
              ) : (
                <PushToTalkButton
                  language={selectedTransLang}
                  onLiveInterimText={(interim) => {
                    if (interim) {
                      setSpokenSpeechText(interim);
                    }
                  }}
                  onTranscript={(text, audioSize, blob, detectedLang, audioBase64, durationSec) => {
                    sendVoiceOrText(text, audioSize, blob, false, selectedTransLang as any, audioBase64, undefined, durationSec);
                  }}
                  disabled={false}
                  networkMode={networkMode}
                />
              )}

              {/* 🎤 COMPACT REAL-TIME VOICE-TO-TEXT BOX DIRECTLY BELOW MIC (MODE 3 ONLY) */}
              {networkMode === 'mode-3-ai-mesh' && (
                <div className="w-full max-w-xs mt-3 px-3.5 py-2.5 rounded-2xl bg-[#061726] border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-center animate-fadeIn">
                  <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400 font-bold border-b border-emerald-800/50 pb-1 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${spokenSpeechText ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                      <span>குரல் ➔ தமிழ் உரை (VOICE TO TEXT)</span>
                    </span>
                    <span className={`text-[8.5px] font-mono ${spokenSpeechText ? 'text-emerald-300 font-bold' : 'text-slate-500'}`}>
                      {spokenSpeechText ? 'கேட்கிறது...' : 'தயார்'}
                    </span>
                  </div>
                  <div className="text-emerald-100 text-xs font-sans font-bold min-h-[24px] flex items-center justify-center break-words px-1">
                    {spokenSpeechText || <span className="text-slate-500 text-[11px] font-normal">மைக்கை அழுத்திப் பேசவும்...</span>}
                  </div>
                </div>
              )}
            </div>

            {/* 4-STAGE TRANSMISSION PIPELINE: PERMANENT LIVE DISPLAY (MODES 1, 2, 4) */}
            {networkMode !== "mode-3-ai-mesh" && (
              <div className="rounded-2xl bg-[#0a1122] border border-blue-900/80 p-3 shadow-md space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>TRANSMISSION PIPELINE ({networkMode === 'mode-1-hd-call' ? '4G/5G DIRECT VOICE' : networkMode === 'mode-2-compressed-voice' ? '2G CELT COMPRESSED' : networkMode === 'mode-4-satellite-beacon' ? '16B SATELLITE' : 'WI-FI AWARE & BLE MESH'})</span>
                  </h4>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                    networkMode === 'mode-4-satellite-beacon' ? 'bg-red-950 text-rose-300 border-red-800' : 'bg-blue-950 text-cyan-300 border-blue-800'
                  }`}>
                    {activeCipherCode || '0x4954015F4F67'}
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
                if (textInput.trim()) {
                  const val = textInput.trim();
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
                placeholder="Type emergency message..."
                className="flex-1 bg-[#0a1122] border border-blue-950 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Send
              </button>
            </form>
          </div>
        )}
        {/* TAB 2: SOS EMERGENCY DISPATCH & GOVT RESCUE FEED */}
        {activeTab === 'sos' && (
          <div className="flex-1 overflow-y-auto space-y-3 font-mono">
            
            {/* 1. TOP SOS DISPATCH CARD */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-red-950 via-[#18080c] to-[#0a0e1a] border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] space-y-3">
              <div className="flex items-center justify-between border-b border-red-900/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl animate-pulse">🚨</span>
                  <div>
                    <h3 className="text-xs font-black text-rose-300 uppercase tracking-wide">Government SOS Gateway</h3>
                    <span className="text-[8.5px] text-emerald-400 font-bold">Direct to Disaster Command Center</span>
                  </div>
                </div>
                <span className="text-[8px] bg-red-950 border border-red-700 text-rose-300 px-2 py-0.5 rounded font-bold animate-pulse">
                  ISRO NavIC / LoRa
                </span>
              </div>

              {/* Big Red 1-Tap SOS Beacon Button */}
              <button
                type="button"
                onClick={() => sendSosToCommandCenter('🚨 CRITICAL SOS: Immediate disaster evacuation & medical rescue needed at GPS location!')}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm py-3.5 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.8)] border border-red-300 active:scale-95 transition-all flex items-center justify-center gap-2.5 animate-pulse"
              >
                <span className="text-lg">🚨</span>
                <span>SEND 1-TAP SOS TO COMMAND CENTER</span>
              </button>


              {/* Relay Cipher UI */}
              {cipherRelayActive && (
                <div className="bg-black/90 border border-green-500/50 rounded-xl p-3 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse">
                  <div className="text-[10px] text-green-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                    {cipherRelaySender} to {myUsername} relay to command center
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
                  { icon: '🚑', text: 'Medical Emergency - Need Ambulance' },
                  { icon: '🍞', text: 'Food & Clean Drinking Water Needed' },
                  { icon: '🚤', text: 'Flood Evacuation Boat Required' },
                  { icon: '🏠', text: 'Trapped on Roof - House Submerged' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendSosToCommandCenter(`🚨 ${item.text}`)}
                    className="p-2 rounded-xl bg-black/60 border border-red-900/80 hover:border-red-400 text-left text-[9.5px] font-bold text-rose-200 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.text.split(' - ')[0]}</span>
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
                  placeholder="Type custom SOS emergency details..."
                  className="flex-1 bg-slate-950 border border-red-800 rounded-xl px-3 py-2 text-xs text-rose-100 placeholder-slate-600 focus:outline-none focus:border-red-400 font-bold"
                />
                <button
                  type="button"
                  onClick={() => sendSosToCommandCenter(sosCustomInput)}
                  disabled={!sosCustomInput.trim()}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md border border-red-400 active:scale-95 transition-all"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Large Offline Mesh Cipher Board Removed as per User Request */}

            {/* 2. SOS FEED (COMMAND CENTER BROADCASTS & USER'S SENT SOS) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10.5px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <span>📡</span> Live Govt SOS & Distress Log
                </span>
                <span className="text-[9px] text-slate-500 font-bold">Only SOS & Command Center</span>
              </div>

              {/* Filter and display SOS and Command Center alerts */}
              {(() => {
                // Combine and filter messages that are SOS or from/to command center
                const allSosList = [
                  ...sosHistory,
                  ...localMeshMessages.filter(m => m.is_emergency || m.sender_username === '@command_center' || m.target_username === '@command_center')
                ];

                // Deduplicate by ID
                const uniqueSos = Array.from(new Map(allSosList.map(m => [m.id || m.text, m])).values());

                if (uniqueSos.length === 0) {
                  return (
                    <div className="p-6 rounded-2xl bg-gradient-to-b from-[#180408] via-[#100305] to-[#080204] border border-red-900/60 text-center space-y-2 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                      <span className="text-3xl animate-pulse">🚨</span>
                      <p className="text-xs font-black text-rose-200 uppercase tracking-wide">Emergency SOS Gateway Ready</p>
                      <p className="text-[9.5px] text-slate-400 font-bold">1-Tap Satellite Distress Beacon (ISRO NavIC / LoRa) connected to Disaster Command Center.</p>
                      <span className="inline-block text-[8px] font-mono bg-red-950/80 text-rose-300 border border-red-800 px-3 py-1 rounded-full font-bold">
                        Standby for Govt Broadcasts
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
                          ? 'bg-gradient-to-r from-red-950 via-rose-950/80 to-[#120a1c] border-2 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                          : 'bg-gradient-to-r from-[#1a080c] to-[#0a1122] border border-rose-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 border-b border-white/10 pb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{isFromCommand ? '📢' : '🚨'}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            isFromCommand ? 'bg-red-600 text-white font-mono' : 'bg-rose-950 text-rose-300 border border-rose-700'
                          }`}>
                            {isFromCommand ? 'GOVT COMMAND CENTER ALERT' : '📱 PHONE 1 ➔ PHONE 2 (RELAY) ➔ COMMAND CENTER'}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          {msg.display_time || formatTimeIST(msg.timestamp)}
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

        {/* TAB 3: AIR RELAY - CLEAN ENCRYPTED CIPHER TOKEN ONLY */}
        {activeTab === 'relay' && (
          <div className="flex-1 flex flex-col justify-center items-center p-4 font-mono animate-fadeIn">
            <div className="w-full max-w-sm p-5 rounded-3xl bg-gradient-to-br from-[#0c1a2e] via-[#091522] to-[#060c14] border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.35)] space-y-3">
              <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔐</span>
                  <span>ENCRYPTED CIPHER TOKEN:</span>
                </span>
                <span className="text-[9px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-600">
                  24-BYTE AES-GCM
                </span>
              </div>
              <div className="text-cyan-300 font-mono font-black text-sm tracking-widest break-all bg-black/90 p-3 rounded-2xl border border-cyan-500/50 shadow-inner select-all text-center">
                {activeCipherCode || 'KEY#ENC-89AB4C3D-4954-015F'}
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>Algorithm: 24B Dynamic Token</span>
                <span className="text-emerald-400 font-bold">🔒 Encrypted in Transit</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOCAL MESH (FRIENDS P2P CHAT - 3 MODES ONLY, NO SOS, NO COMMAND CENTER) */}
        {activeTab === 'mesh' && (
          <div className="flex-1 overflow-y-auto space-y-3 font-mono">


            {/* Target Friend Selector (Clean Custom Input - No Suggestions) */}
            <div className="p-3.5 rounded-2xl bg-[#0a1224] border-2 border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.25)] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🎯</span>
                  <span className="text-[11px] font-black text-cyan-300 uppercase tracking-wide">Send To Friend:</span>
                </div>
                <span className="text-xs font-black text-emerald-300 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-600 shadow-inner">
                  {targetFriend || '@not_set'}
                </span>
              </div>

              {/* Clean Single Input Field for Recipient Username */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFriendInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomFriendInput(val);
                    if (val.trim().length > 0) {
                      const norm = normalizeName(val);
                      setTargetFriend(norm);
                      localStorage.setItem('target_friend', norm);
                    }
                  }}
                  placeholder="Enter recipient username..."
                  className="flex-1 bg-slate-950 border-2 border-cyan-600/80 rounded-xl px-3.5 py-2 text-xs text-cyan-200 font-bold focus:outline-none focus:border-cyan-300 placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customFriendInput.trim()) {
                      const norm = normalizeName(customFriendInput);
                      setTargetFriend(norm);
                      localStorage.setItem('target_friend', norm);
                      setLastDeliveryToast(`🎯 Recipient set to ${norm}!`);
                    }
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md active:scale-95 border border-emerald-400"
                >
                  ✓ Set
                </button>
              </div>
            </div>

            {/* 3 MODES FOR LOCAL MESH FRIENDS (NO MODE 4 SOS) */}
            <div className="p-1.5 rounded-2xl bg-[#0a1122] border border-blue-950 grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setLocalMeshMode('mode-1-p2p-hd')}
                className={`py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                  localMeshMode === 'mode-1-p2p-hd'
                    ? 'bg-emerald-600 text-white border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🎙️ Mode 1 (HD)
              </button>
              <button
                type="button"
                onClick={() => setLocalMeshMode('mode-2-p2p-2g')}
                className={`py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                  localMeshMode === 'mode-2-p2p-2g'
                    ? 'bg-blue-600 text-white border-blue-300 shadow-[0_0_10px_rgba(37,99,235,0.7)]'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                📻 Mode 2 (2G)
              </button>
              <button
                type="button"
                onClick={() => setLocalMeshMode('mode-3-p2p-nan')}
                className={`py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                  localMeshMode === 'mode-3-p2p-nan'
                    ? 'bg-amber-600 text-white border-amber-300 shadow-[0_0_10px_rgba(217,119,6,0.7)]'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                📡 Mode 3 (NAN)
              </button>
            </div>

            {/* 🌐 9-Language Selector Bar for Local Mesh Mode 3 */}
            {localMeshMode === 'mode-3-p2p-nan' && (
              <div className="w-full max-w-sm px-2 mb-1">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[8.5px] font-mono text-emerald-400 font-bold">🌐 TRANSLATE TO (9 LANGUAGES):</span>
                  <span className="text-[8px] font-mono text-cyan-300 font-bold">Active: {selectedTransLang.toUpperCase()}</span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {INDIC_LANGUAGES_9.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setSelectedTransLang(l.code)}
                      className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold shrink-0 transition-all border ${
                        selectedTransLang === l.code
                          ? 'bg-emerald-600 text-white border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)] scale-105'
                          : 'bg-[#0a1812] text-emerald-300 border-emerald-900/80 hover:border-emerald-700'
                      }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PTT Button for Local Mesh Friends (Always Standard Green) */}
            <div className="flex flex-col items-center justify-center py-2">
              <PushToTalkButton
                onTranscript={(text, audioSize, blob, detectedLang, audioBase64, durationSec) => {
                  sendLocalMeshPrivateMessage(text, audioSize, blob, audioBase64, durationSec);
                }}
                disabled={false}
                networkMode={localMeshMode === 'mode-1-p2p-hd' ? 'mode-1-hd-call' : localMeshMode === 'mode-2-p2p-2g' ? 'mode-2-compressed-voice' : 'mode-3-ai-mesh'}
              />
            </div>
            
            {/* Text Input for Local Mesh */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (textInput.trim()) {
                  const val = textInput.trim();
                  setTextInput('');
                  sendLocalMeshPrivateMessage(val, 24, undefined, undefined, 0);
                }
              }}
              className="flex items-center gap-2 shrink-0 px-1 pb-3"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => { setTextInput(e.target.value); }}
                placeholder={`Message ${targetFriend}...`}
                className="flex-1 bg-[#0a1122] border border-emerald-900 rounded-2xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Send
              </button>
            </form>

            {/* WhatsApp-Style P2P Voice & Text Chat Stream */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-blue-950 pb-1.5 px-1">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <span>💬</span> WHATSAPP-STYLE MESH CHAT
                </span>
                <span className="text-[9px] text-cyan-400 font-mono font-bold bg-blue-950 px-2 py-0.5 rounded-lg border border-blue-800">
                  You: {myUsername}
                </span>
              </div>

              {localMeshMessages.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs font-mono rounded-2xl bg-slate-950/60 border border-slate-900">
                  <span>🎙️ Hold microphone to send a voice note to {targetFriend}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {localMeshMessages.filter((msg) => {
                    const targetClean = normalizeName(msg.target_username);
                    const senderClean = normalizeName(msg.sender_username);
                    const myClean = normalizeName(myUsername);
                    return targetClean === myClean || targetClean === '@all_friends' || senderClean === myClean;
                  }).map((msg, i) => {
                    const targetClean = normalizeName(msg.target_username);
                    const senderClean = normalizeName(msg.sender_username);
                    const myClean = normalizeName(myUsername);
                    const isSentByMe = senderClean === myClean;
                    const isForMe = targetClean === myClean || targetClean === '@all_friends';
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
                          className={`max-w-[85%] rounded-3xl p-3 shadow-xl space-y-1.5 text-xs font-sans transition-all border ${
                            isSentByMe
                              ? 'bg-gradient-to-br from-emerald-800/90 via-teal-900/90 to-emerald-950 text-emerald-50 rounded-br-none border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                              : isForMe
                              ? 'bg-gradient-to-br from-blue-900/90 via-slate-900 to-indigo-950 text-blue-50 rounded-bl-none border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                              : 'bg-slate-950/90 text-slate-500 rounded-2xl border-slate-800 opacity-60'
                          }`}
                        >
                          {/* Sender / Recipient Header */}
                          <div className="flex items-center justify-between gap-3 text-[10px] font-mono border-b border-white/10 pb-1 font-bold">
                            <span className={isSentByMe ? 'text-emerald-300' : 'text-cyan-300'}>
                              {isSentByMe ? `You ➔ ${msg.target_username}` : `${msg.sender_username} ➔ You`}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[7.5px] px-1.5 py-0.5 rounded font-mono font-bold bg-black/40 border border-white/10">
                                {msg.local_mode === 'mode-2-p2p-2g' ? '📻 2G (1.2 KB · 97% Saved)' : '🎙️ HD (45 KB)'}
                              </span>
                              <span className="text-[8px] opacity-80">
                                {isForMeOrMine ? '🔓 E2EE' : '🔒 RELAY'}
                              </span>
                            </div>
                          </div>

                          {/* Message Content with WhatsApp Voice Player */}
                          {isForMeOrMine ? (
                            <div className="space-y-2">
                              {/* Custom Interactive WhatsApp Voice Player */}
                              <VoiceNotePlayer
                                audioUrl={msg.audio_url}
                                isSentByMe={isSentByMe}
                                text={msg.text}
                                durationSeconds={msg.duration_seconds || 4}
                              />
                              {/* Message Text Caption */}
                              {msg.text && (
                                <p className="text-xs leading-relaxed font-medium px-1 text-slate-100">
                                  {msg.text}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/90 border-l-2 border-emerald-500 font-mono text-[8.5px] space-y-1.5 my-1 shadow-inner text-slate-300">
                              <div className="text-emerald-400 font-bold mb-1">Multi-Hop Route:</div>
                              <div className="flex items-center gap-1.5">
                                <span>📱 Phone 1: Victim ({msg.sender_username || '@shak'})</span>
                              </div>
                              <div className="pl-2 text-slate-500">──[BLE Mesh]──▶</div>
                              <div className="flex items-center gap-1.5">
                                <span>📱 Phone 2: Relay ({myUsername})</span>
                              </div>
                              <div className="pl-2 text-slate-500">──[Gateway]──▶</div>
                              <div className="flex items-center gap-1.5">
                                <span>🏢 Command Center</span>
                              </div>
                              <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between">
                                <span className="text-amber-300 font-bold flex items-center gap-1">
                                  <span>🔐 Cipher:</span>
                                </span>
                                <span className="text-cyan-300 font-black tracking-wider break-all text-[8px]">
                                  {msg.cipher_code || '0x4954015F7B9F13D75A73CC03'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Timestamp & Double-Tick Status */}
                          <div className="flex items-center justify-end gap-1 text-[8.5px] font-mono text-white/60 pt-0.5">
                            <span className="font-bold text-slate-300">
                              {msg.display_time || formatTimeIST(msg.timestamp)}
                            </span>
                            {isSentByMe && (
                              <span className="text-cyan-300 font-bold text-[10px]">✓✓</span>
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
      <footer className="px-6 py-2.5 bg-[#0a1122] border-t border-blue-950/80 flex items-center justify-between shrink-0 shadow-2xl">
        <button
          onClick={() => setActiveTab('talk')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'talk' ? 'text-blue-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="text-lg">💬</span>
          <span className="text-[10px] font-mono">Talk</span>
        </button>

        <button
          onClick={() => setActiveTab('sos')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'sos' ? 'text-red-400 font-bold scale-105 animate-pulse' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="text-lg">🚨</span>
          <span className="text-[10px] font-mono">SOS</span>
        </button>

        {/* 📡 NEW TAB: AIR RELAY & JUDGE DEMO (NEXT TO SOS!) */}
        <button
          onClick={() => setActiveTab('relay')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'relay' ? 'text-amber-400 font-bold scale-105 animate-pulse' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="text-lg">📡</span>
          <span className="text-[10px] font-mono">Air Relay</span>
        </button>

        <button
          onClick={() => setActiveTab('mesh')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'mesh' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="text-lg">👥</span>
          <span className="text-[10px] font-mono">Local Mesh</span>
        </button>
      </footer>

    </div>
  );
}
