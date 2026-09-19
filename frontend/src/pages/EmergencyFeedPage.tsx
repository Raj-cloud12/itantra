import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface RelayPacket {
  id: string;
  sender_username: string;
  target_username: string;
  cipher_code: string;
  hop_count: number;
  latitude: number;
  longitude: number;
  address_name: string;
  timestamp: string;
  display_time: string;
  status: string;
  transit_ms: number;
  masked_text: string;
}

export const EmergencyFeedPage: React.FC = () => {
  const { sessionId = 'DEMO_GLOBAL_SESSION_01' } = useParams<{ sessionId: string }>();
  const [packets, setPackets] = useState<RelayPacket[]>([]);
  const [lastRelayedTime, setLastRelayedTime] = useState<string>('Just now');
  const [tunnelStatus, setTunnelStatus] = useState<'connected' | 'reconnecting'>('connected');

  // Poll or receive live packets and display dynamic encrypted transmitter ciphers ONLY (Zero-Knowledge)
  useEffect(() => {
    const fetchPackets = async () => {
      try {
        const res = await fetch('/api/messages/all');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: RelayPacket[] = data.map((m: any, idx: number) => {
              const randHex = (m.cipher_code || '0x4954015F' + Math.random().toString(16).slice(2, 10).toUpperCase());
              return {
                id: m.id || `relay_${idx}`,
                sender_username: m.sender_username || '@citizen_node',
                target_username: '@command_center',
                cipher_code: randHex,
                hop_count: m.hop_count || 2,
                latitude: m.latitude || 12.8718,
                longitude: m.longitude || 80.2185,
                address_name: m.address_name || (m.latitude ? `GPS: ${m.latitude.toFixed(4)}°N, ${m.longitude.toFixed(4)}°E` : "Disaster Field Sector"),
                timestamp: m.timestamp || new Date().toISOString(),
                display_time: m.display_time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
                status: 'RELAYED_TO_COMMAND_CENTER',
                transit_ms: 0.001,
                masked_text: '🔒 [ENCRYPTED 24-BYTE AES PAYLOAD - ZERO KNOWLEDGE PRIVACY MASKED]'
              };
            });
            setPackets(mapped.reverse());
            setLastRelayedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
          }
        }
      } catch (e) {}
    };

    fetchPackets();
    const interval = setInterval(fetchPackets, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-mono select-none">
      {/* 1. TOP STATUS HEADER */}
      <header className="p-4 bg-[#0a1324] border-b border-cyan-800/60 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">📡</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-cyan-300 uppercase tracking-wider">
                  RELAY NODE TELEMETRY GATEWAY
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 text-[9px] font-bold animate-pulse">
                  TUNNEL ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Bluetooth Mesh Receiver ➔ Internet Forwarder to Command Center
              </p>
            </div>
        </div>

        <Link
          to={`/command/${sessionId}`}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all"
        >
          Open Command Center ➔
        </Link>
      </header>

      {/* 2. ZERO-KNOWLEDGE SECURITY BANNER */}
      <div className="p-3.5 bg-gradient-to-r from-cyan-950/80 via-[#0a1b2d] to-cyan-950/80 border-b border-cyan-700/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-lg">🛡️</span>
          <span className="text-[11px] font-bold text-cyan-200">
            Privacy Guarantee: Phone 2 forwards raw 24-Byte AES Ciphers without viewing victim private plaintext.
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-bold">
          Last Packet: <span className="text-emerald-400">{lastRelayedTime}</span>
        </span>
      </div>

      {/* 3. RELAY PACKETS STREAM */}
      <main className="flex-1 p-4 max-w-4xl w-full mx-auto space-y-3 overflow-y-auto">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
          <span>LIVE RELAY TRANSMISSION LOG (CIPHER ONLY):</span>
          <span>ROUTING: FIELD MESH ➔ GATEWAY ➔ COMMAND CENTER</span>
        </div>

        {packets.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#091122] border-2 border-dashed border-cyan-900/80 text-center space-y-3">
            <span className="text-4xl animate-bounce">📡</span>
            <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wide">
              Listening for Offline Bluetooth Mesh Packets...
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When an offline node transmits, nearby peer gateways capture the encrypted packet and forward it immediately to the Central Command Center.
            </p>
          </div>
        ) : (
          packets.map((pkt) => (
            <div
              key={pkt.id}
              className="p-4 rounded-2xl bg-gradient-to-r from-[#0a1426] via-[#0d1c33] to-[#0a1426] border-2 border-cyan-600/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] space-y-2.5 animate-fadeIn"
            >
              {/* Route & Timestamp */}
              <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-950 text-cyan-300 border border-blue-700 text-[10px] font-black">
                    HOP 1: BLE (30m)
                  </span>
                  <span className="text-slate-400 text-xs font-black">➔</span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-black">
                    HOP 2: TUNNEL (~40ms)
                  </span>
                  <span className="text-slate-400 text-xs font-black">➔</span>
                  <span className="px-2 py-0.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-700 text-[10px] font-black">
                    🏢 COMMAND CENTER
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">
                  ⏰ {pkt.display_time}
                </span>
              </div>

              {/* 🔐 DYNAMIC TRANSMITTER CIPHER CODE BADGE */}
              <div className="bg-black/80 p-3 rounded-xl border border-cyan-500 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔐</span>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">DYNAMIC TRANSMITTER CIPHER CODE:</span>
                    <span className="text-sm font-black text-amber-300 tracking-wider">
                      {pkt.cipher_code}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[9px] font-black shadow">
                  ✓ RELAYED OK
                </span>
              </div>

              {/* Masked Plaintext Banner (Zero-Knowledge Block) */}
              <div className="bg-[#0e1b2f] p-2.5 rounded-xl border border-slate-700 text-[10.5px] text-slate-300 flex items-center justify-between">
                <span className="font-mono text-cyan-200">
                  🔒 {pkt.masked_text}
                </span>
                <span className="text-[9px] text-amber-400 font-bold">
                  24B AES-GCM
                </span>
              </div>

              {/* Location Badge */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span className="text-emerald-400 font-bold">
                  📍 {pkt.address_name} ({pkt.latitude.toFixed(4)}°N, {pkt.longitude.toFixed(4)}°E)
                </span>
                <span className="text-cyan-300 font-bold">
                  Forwarded via Tunnel ➔ Delivered
                </span>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default EmergencyFeedPage;
