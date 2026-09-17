import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DemoMode() {
  // Government 4-Mode State
  const [govtMode, setGovtMode] = useState<'mode-1-hd-call' | 'mode-2-compressed-voice' | 'mode-3-ai-mesh' | 'mode-4-satellite-beacon'>('mode-4-satellite-beacon');
  
  // Friends Local Mesh 3-Mode State
  const [friendsMode, setFriendsMode] = useState<'mode-1-p2p-hd' | 'mode-2-p2p-2g' | 'mode-3-p2p-nan'>('mode-2-p2p-2g');
  
  const [statusToast, setStatusToast] = useState('🟢 Live Synced with Devices & Command Center');
  const [activeHost, setActiveHost] = useState<string>(() => {
    return localStorage.getItem('tactical_host') || 'appendix-comparisons-delhi-extraction.trycloudflare.com';
  });
  const [isEditingHost, setIsEditingHost] = useState(false);
  const [tempHost, setTempHost] = useState('');

  const getApiBase = () => {
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
      return `http://${window.location.hostname}:8000`;
    }
    return 'http://localhost:8000';
  };

  // Poll current active mode from backend
  useEffect(() => {
    const fetchMode = async () => {
      try {
        const apiBase = getApiBase();
        let res = await fetch(`${apiBase}/api/network/active-mode`).catch(() => null);
        if (!res || !res.ok) res = await fetch('/api/network/active-mode').catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data) {
            if (data.network_mode) setGovtMode(data.network_mode);
            if (data.local_mode) setFriendsMode(data.local_mode);
          }
        }
      } catch {}
    };

    fetchMode();
    const interval = setInterval(fetchMode, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSetModeTargets = () => {
    const apiBase = getApiBase();
    const clean = activeHost.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const customUrl = clean.includes('trycloudflare.com') || clean.includes('.com')
      ? `https://${clean}/api/network/set-mode`
      : `http://${clean}:8000/api/network/set-mode`;

    return Array.from(new Set([
      customUrl,
      'https://itantra-4yzo.onrender.com/api/network/set-mode',
      'http://10.64.235.76:8000/api/network/set-mode',
      `${apiBase}/api/network/set-mode`,
      'http://localhost:8000/api/network/set-mode',
      'http://127.0.0.1:8000/api/network/set-mode',
      '/api/network/set-mode'
    ]));
  };

  const switchGovtMode = async (mode: 'mode-1-hd-call' | 'mode-2-compressed-voice' | 'mode-3-ai-mesh' | 'mode-4-satellite-beacon') => {
    setGovtMode(mode);
    const targets = getSetModeTargets();

    targets.forEach(url => {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ network_mode: mode })
      }).catch(() => {});
    });

    setStatusToast(`⚡ Govt Mode: ${mode.toUpperCase()}`);
    setTimeout(() => setStatusToast('🟢 Live Synced with Devices & Command Center'), 3000);
  };

  const switchFriendsMode = async (mode: 'mode-1-p2p-hd' | 'mode-2-p2p-2g' | 'mode-3-p2p-nan') => {
    setFriendsMode(mode);
    const targets = getSetModeTargets();

    targets.forEach(url => {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ local_mode: mode })
      }).catch(() => {});
    });

    setStatusToast(`⚡ Local Mesh Mode: ${mode.toUpperCase()}`);
    setTimeout(() => setStatusToast('🟢 Live Synced with Devices & Command Center'), 3000);
  };

  const broadcastQuickSos = async (text: string) => {
    const apiBase = getApiBase();
    const payload = JSON.stringify({
      id: crypto.randomUUID(),
      session_id: 'DEMO_GLOBAL_SESSION_01',
      sender_role: 'command',
      sender_username: '@command_center',
      target_username: '@all_users',
      type: 'emergency_alert',
      text: text,
      network_mode: 'mode-4-satellite-beacon',
      audio_size: 16,
      is_emergency: true,
      display_time: new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    });

    const targets = [
      `${apiBase}/api/messages/send`,
      'http://127.0.0.1:8000/api/messages/send',
      'http://localhost:8000/api/messages/send',
      '/api/messages/send'
    ];

    targets.forEach(u => {
      fetch(u, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      }).catch(() => {});
    });

    setStatusToast(`🚨 SOS Sent: "${text.slice(0, 30)}..."`);
    setTimeout(() => setStatusToast('🟢 Live Synced with Devices & Command Center'), 4000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 md:p-6 font-sans flex flex-col justify-between select-none">
      
      {/* 1. COMPACT CLEAN HEADER */}
      <header className="flex flex-wrap justify-between items-center bg-[#0c1017] px-5 py-3.5 rounded-2xl border border-slate-800 shadow-xl gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xl shadow-md border border-cyan-400/40">
            🎛️
          </div>
          <div>
            <h1 className="text-base font-black text-slate-100 flex items-center gap-2">
              iTiTantra Demo Controller
            </h1>
            <span className="text-[10px] text-slate-400">Direct Manual Switcher for Presentation & Testing</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
            {statusToast}
          </span>
          <Link
            to="/command"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition-all active:scale-95"
          >
            🏛️ Command Center
          </Link>
        </div>
      </header>

      {/* 2. TWO SEPARATE COMPACT BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5 flex-1">
        
        {/* ========================================================================= */}
        {/* BOX 1: GOVERNMENT MODE (ISRO SATELLITE 16B & COMMAND CENTER) */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-3xl bg-[#0c1220] border-2 border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.2)] flex flex-col justify-between space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-red-900/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏛️</span>
              <div>
                <h2 className="text-sm font-black text-rose-300 uppercase tracking-wide">Government Mode</h2>
                <span className="text-[9.5px] text-slate-400">ISRO NavIC Satellite 16B · 4-Tier Operations</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold bg-red-950 text-rose-300 px-2 py-0.5 rounded border border-red-800">
              GOVT RESCUE
            </span>
          </div>

          {/* 4 Compact Mode Switcher Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Select Active Government Mode:</span>
            <div className="grid grid-cols-2 gap-2 font-mono">
              {[
                { key: 'mode-1-hd-call', icon: '📶', title: 'Mode 1 (4G/5G)', sub: '64 kbps · 45 KB Raw' },
                { key: 'mode-2-compressed-voice', icon: '📻', title: 'Mode 2 (2G Audio)', sub: '2.4 kbps · 1.2 KB CELT' },
                { key: 'mode-3-ai-mesh', icon: '🧠', title: 'Mode 3 (AI Mesh)', sub: '0.1 kbps · 24 Bytes' },
                { key: 'mode-4-satellite-beacon', icon: '🛰️', title: 'Mode 4 (Satellite 16B)', sub: '0.01 kbps · 16-Byte Beacon' }
              ].map((m) => {
                const isSel = govtMode === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => switchGovtMode(m.key as any)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                      isSel
                        ? 'bg-red-950/90 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-1 ring-white/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{m.icon}</span>
                      {isSel && <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">ACTIVE</span>}
                    </div>
                    <div className="font-black text-xs">{m.title}</div>
                    <div className="text-[9px] text-slate-400">{m.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick SOS Trigger Buttons */}
          <div className="space-y-1.5 pt-2 border-t border-red-900/60">
            <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">🚨 Quick Broadcast SOS to All Phones:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-bold">
              <button
                type="button"
                onClick={() => broadcastQuickSos('🚨 RED ALERT: Evacuate coastal sector immediately. Rescue boats deployed.')}
                className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow active:scale-95 transition-all text-left truncate"
              >
                🚨 Evacuate Sector Now
              </button>
              <button
                type="button"
                onClick={() => broadcastQuickSos('🌊 FLOOD WARNING: NDRF relief boats reaching Kottivakkam area.')}
                className="p-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white shadow active:scale-95 transition-all text-left truncate"
              >
                🌊 Flood Rescue Active
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* BOX 2: LOCAL MESH MODE (PRIVATE FRIENDS P2P CHAT) */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-3xl bg-[#0a1220] border-2 border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.2)] flex flex-col justify-between space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👥</span>
              <div>
                <h2 className="text-sm font-black text-cyan-300 uppercase tracking-wide">Local Mesh Mode</h2>
                <span className="text-[9.5px] text-slate-400">1-to-1 Private Voice · Zero Command Center Leak</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              CIVILIAN MESH
            </span>
          </div>

          {/* 3 Compact Mode Switcher Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Select Active Local Mesh Mode:</span>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {[
                { key: 'mode-1-p2p-hd', icon: '🎙️', title: 'Mode 1 (HD)', sub: '45 KB Studio' },
                { key: 'mode-2-p2p-2g', icon: '📻', title: 'Mode 2 (2G)', sub: '1.2 KB CELT' },
                { key: 'mode-3-p2p-nan', icon: '📡', title: 'Mode 3 (Mesh)', sub: '0-Internet Radio' }
              ].map((m) => {
                const isSel = friendsMode === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => switchFriendsMode(m.key as any)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                      isSel
                        ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] ring-1 ring-white/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{m.icon}</span>
                      {isSel && <span className="text-[8px] bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded font-bold">ACTIVE</span>}
                    </div>
                    <div className="font-black text-xs">{m.title}</div>
                    <div className="text-[8.5px] text-slate-400">{m.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Phone Testing Status */}
          <div className="space-y-1.5 pt-2 border-t border-cyan-900/60 font-mono text-[10px]">
            <span className="text-slate-400 font-bold uppercase block">📱 Connected Test Phones:</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-800/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-300">📱 Phone 1 (@raj)</div>
                  <div className="text-[8.5px] text-slate-400">1-to-1 Private Voice Sender</div>
                </div>
                <span className="text-[8px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700">ONLINE</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-800/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-cyan-300">📱 Phone 2 (@kavya)</div>
                  <div className="text-[8.5px] text-slate-400">E2EE Voice Receiver</div>
                </div>
                <span className="text-[8px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-700">ONLINE</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. FOOTER */}
      <footer className="px-5 py-2.5 bg-[#0c1017] border border-slate-800 rounded-2xl flex items-center justify-between font-mono text-xs shadow-xl shrink-0">
        <div className="text-slate-400 text-[11px]">
          Government: <strong className="text-rose-400">{govtMode.toUpperCase()}</strong> · Local Mesh: <strong className="text-cyan-400">{friendsMode.toUpperCase()}</strong>
        </div>
        <div className="text-emerald-400 font-bold text-[11px]">
          ⚡ Ready for Live Presentation
        </div>
      </footer>

    </div>
  );
}
