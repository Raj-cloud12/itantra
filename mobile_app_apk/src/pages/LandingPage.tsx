import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [localIp, setLocalIp] = useState<string>('localhost');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/system/ip')
      .then(res => res.json())
      .then(data => setLocalIp(data.ip || 'localhost'))
      .catch(() => {});
  }, []);

  const createSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/session/create', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field_username: 'MobileOperative_01', command_username: 'CommandCenter' })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
        sessionStorage.setItem('current_session_id', data.session_id);
        sessionStorage.setItem('field_token', data.field_token);
        sessionStorage.setItem('command_token', data.command_token);
      } else {
        console.error('Failed to create session');
      }
    } catch (err) {
      console.error('API error', err);
    }
    setLoading(false);
  };

  const mobileUrl = sessionData 
    ? `https://${localIp}:5173/field/${sessionData.session_id}?token=${sessionData.field_token}`
    : `https://${localIp}:5173/mobile`;

  const commandUrl = sessionData
    ? `https://localhost:5173/command/${sessionData.session_id}?token=${sessionData.command_token}`
    : `https://localhost:5173/command-center`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      {/* Background Glowing Grid Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Brand Header */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-inner mb-6">
          <img src="/logo.png" alt="iTiTantra Logo" className="w-6 h-6 rounded-lg object-cover shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">iTiTantra Dual-App Protocol Suite</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 mb-4">
          iTiTantra Platform
        </h1>
        
        <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl font-normal leading-relaxed">
          The system is split into <strong className="text-emerald-400">TWO dedicated applications</strong> for easy testing on Laptop & Mobile:
        </p>

        {!sessionData ? (
          <button 
            onClick={createSession}
            disabled={loading}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_45px_rgba(16,185,129,0.5)] hover:scale-105 transition-all disabled:opacity-50 cursor-pointer mb-8"
          >
            <span>{loading ? 'Initializing Dual-App Session...' : '🚀 Launch Two Dedicated Apps'}</span>
          </button>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl items-stretch mt-2 mb-8">
            
            {/* APP 1: Civilian Mobile App Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-emerald-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-emerald-500/50 transition-all text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase font-mono">
                APP 1: MOBILE APP
              </div>
              <div>
                <div className="w-12 h-12 bg-emerald-950/80 border border-emerald-800/60 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-100 mb-2">Civilian Mobile App</h2>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Dedicated app for mobile phones. Test Push-to-Talk voice, offline Bluetooth mesh, and 9 Indian languages.
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-3 rounded-2xl inline-block mx-auto mb-4 shadow-inner">
                <QRCodeSVG value={mobileUrl} size={150} />
              </div>

              {/* Mobile URL */}
              <div className="relative mb-4">
                <input 
                  type="text" 
                  readOnly 
                  value={mobileUrl}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-[11px] text-emerald-300 font-mono focus:outline-none pr-16"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(mobileUrl)}
                  className="absolute right-1.5 top-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-[10px] font-mono transition-colors"
                >
                  Copy Link
                </button>
              </div>

              <button 
                onClick={() => navigate(`/field/${sessionData.session_id}?token=${sessionData.field_token}`)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold py-3.5 px-5 rounded-2xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <span>Open Mobile App 📱</span>
              </button>
            </div>

            {/* APP 2: Command Center Laptop Web App Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-blue-500/50 transition-all text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase font-mono">
                APP 2: LAPTOP WEB APP
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-950/80 border border-blue-800/60 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M9 16h.01M9 12h.01M9 8h.01M15 16h.01M15 12h.01M15 8h.01"></path></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-100 mb-2">Command Center Laptop</h2>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Tactical response web app for laptops. Monitor live civilian unit GPS pins, response stream, and HD voice player.
                </p>
              </div>

              {/* Laptop URL */}
              <div className="relative mb-4 mt-auto">
                <input 
                  type="text" 
                  readOnly 
                  value={commandUrl}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-[11px] text-blue-300 font-mono focus:outline-none pr-16"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(commandUrl)}
                  className="absolute right-1.5 top-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-[10px] font-mono transition-colors"
                >
                  Copy Link
                </button>
              </div>

              <button 
                onClick={() => navigate(`/command/${sessionData.session_id}?token=${sessionData.command_token}`)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3.5 px-5 rounded-2xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <span>Launch Command Center Laptop 🏛️</span>
              </button>
            </div>

          </div>
        )}

        {/* Direct URL Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            📱 Mobile App URL: <code className="text-emerald-400 font-bold">/mobile</code>
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            🏛️ Command Center URL: <code className="text-blue-400 font-bold">/command-center</code>
          </span>
          {sessionData && (
            <button 
              onClick={() => navigate(`/demo/${sessionData.session_id}`)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
            >
              ⚙️ Demo Controller: <code className="font-bold">/demo</code>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
