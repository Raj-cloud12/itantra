import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DownloadPage() {
  const [apkInfo, setApkInfo] = useState({
    version: '1.0',
    size_mb: 112.2,
    filename: 'iTantra.apk',
    package_id: 'iTantra.civilianapp',
    app_name: 'iTantra'
  });

  useEffect(() => {
    // Fetch dynamic APK details if available
    fetch('/api/apk/info')
      .then(res => res.json())
      .then(data => {
        if (data && data.size_mb) {
          setApkInfo(prev => ({
            ...prev,
            size_mb: data.size_mb,
            version: data.version || '1.0',
            filename: data.filename || 'iTantra.apk',
            package_id: data.package_id || 'iTantra.civilianapp'
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-cyan-400 selection:text-black flex flex-col relative overflow-y-auto overflow-x-hidden">
      
      {/* Deep Black Ambient Atmosphere */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.08),transparent_55%)] pointer-events-none -z-0"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.05),transparent_55%)] pointer-events-none -z-0"></div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 border-b border-white/10 bg-black/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/download" className="flex items-center gap-3.5 group">
            <img
              src="/logo_round.png"
              alt="iTantra Logo"
              className="w-10 h-10 rounded-full border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.35)] group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white tracking-wide">iTantra</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">Indian Multilingual Disaster Communication & Mesh Network</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-6 py-14 flex flex-col items-center text-center">
        
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-neutral-300 shadow-inner mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-cyan-400 font-bold">Release v{apkInfo.version}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4">
          Download <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">iTantra</span> for Android
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-neutral-400 leading-relaxed mb-12">
          The tactical zero-infrastructure emergency mesh transceiver. Send distress beacons, voice notes, and private peer-to-peer messages — <strong className="text-emerald-400 font-semibold">even when cell towers and the internet are completely dead.</strong>
        </p>

        {/* Action Card: Single Direct APK Download */}
        <div className="w-full max-w-2xl mb-20 text-left">
          <div className="w-full bg-[#0a0a0a] border border-white/10 hover:border-cyan-500/40 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden backdrop-blur-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/[0.07] rounded-full blur-3xl pointer-events-none"></div>

            <div>
              <div className="flex items-center gap-4 mb-8">
                <img
                  src="/logo_round.png"
                  alt="iTantra Logo"
                  className="w-16 h-16 rounded-2xl border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.35)] object-cover bg-black"
                />
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">iTantra Native Android</h2>
                  <span className="inline-block text-xs text-neutral-400 font-mono mt-1 px-2.5 py-0.5 rounded-md bg-white/[0.05] border border-white/10">
                    {apkInfo.package_id}
                  </span>
                </div>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8 text-[11px] font-mono">
                <div className="bg-black/90 border border-white/10 hover:border-white/20 p-3 rounded-2xl transition-colors">
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">File Size</span>
                  <span className="text-emerald-400 font-bold text-xs">{apkInfo.size_mb} MB</span>
                </div>
                <div className="bg-black/90 border border-white/10 hover:border-white/20 p-3 rounded-2xl transition-colors">
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Min Android</span>
                  <span className="text-cyan-400 font-bold text-xs">Android 7.0+</span>
                </div>
                <div className="bg-black/90 border border-white/10 hover:border-white/20 p-3 rounded-2xl transition-colors">
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Signature</span>
                  <span className="text-purple-400 font-bold text-xs">V1 & V2 Signed</span>
                </div>
                <div className="bg-black/90 border border-white/10 hover:border-white/20 p-3 rounded-2xl transition-colors">
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">CPU Arch</span>
                  <span className="text-amber-400 font-bold text-xs">arm64-v8a</span>
                </div>
                <div className="bg-black/90 border border-white/10 hover:border-white/20 p-3 rounded-2xl transition-colors">
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">ASR AI Engine</span>
                  <span className="text-sky-400 font-bold text-xs">Sherpa-ONNX</span>
                </div>
                <div className="bg-black/90 border border-white/10 hover:border-white/20 p-3 rounded-2xl transition-colors">
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Security</span>
                  <span className="text-rose-400 font-bold text-xs">AES-256-GCM</span>
                </div>
              </div>
            </div>

            {/* Single Prominent Download Button */}
            <div className="pt-2">
              <a
                href="/download-apk"
                download="iTantra.apk"
                className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:shadow-[0_0_55px_rgba(6,182,212,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 text-black group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download iTantra.apk ({apkInfo.size_mb} MB)</span>
              </a>
              <p className="text-center text-[11px] text-neutral-500 mt-3 font-mono">
                Direct 1-Click Download
              </p>
            </div>

          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full max-w-4xl mb-20 text-left">
          <h3 className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase mb-6 text-center">
            ⚡ What's Packed Inside iTantra Native
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 p-6 rounded-2xl backdrop-blur-sm transition-all">
              <div className="text-2xl mb-3">📴</div>
              <h4 className="font-bold text-sm text-white mb-1.5">100% Offline Air Mesh</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Relays packets via BLE & Wi-Fi Direct radio frames without needing cellular network or internet backhaul.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 p-6 rounded-2xl backdrop-blur-sm transition-all">
              <div className="text-2xl mb-3">🎙️</div>
              <h4 className="font-bold text-sm text-white mb-1.5">On-Device AI Voice (Sherpa)</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Offline AI model transcribes spoken regional languages locally on the phone without Google or cloud servers.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 p-6 rounded-2xl backdrop-blur-sm transition-all">
              <div className="text-2xl mb-3">🚨</div>
              <h4 className="font-bold text-sm text-white mb-1.5">1-Tap Emergency SOS</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Instant distress beacon broadcasting GPS coordinates, reverse-geocoded landmarks, and life-saving request chips.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 p-6 rounded-2xl backdrop-blur-sm transition-all">
              <div className="text-2xl mb-3">🔒</div>
              <h4 className="font-bold text-sm text-white mb-1.5">Mode 3 Private E2EE Chat</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Military-grade AES-256-GCM encryption locks peer-to-peer chats so only the recipient can decrypt messages.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 p-6 rounded-2xl backdrop-blur-sm transition-all">
              <div className="text-2xl mb-3">🌐</div>
              <h4 className="font-bold text-sm text-white mb-1.5">10 Indian Languages</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Full native localization for Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, Marathi, Gujarati, Urdu, and English.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 p-6 rounded-2xl backdrop-blur-sm transition-all">
              <div className="text-2xl mb-3">🏢</div>
              <h4 className="font-bold text-sm text-white mb-1.5">Command Center Gateway</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Automatically hops packets to any connected uplink node to deliver citizen SOS signals directly to rescue coordinators.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Installation Guide */}
        <div className="w-full max-w-4xl text-left bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 sm:p-10 mb-16">
          <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
            <span>📦 How to Install on Your Android Phone</span>
          </h3>
          <p className="text-xs text-neutral-400 mb-8">
            Quick 4-step installation for sideloading the signed APK without Google Play Store:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-black/90 border border-white/10 hover:border-cyan-500/40 p-5 rounded-2xl transition-all">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
                01
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Download APK</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Tap the "Download iTantra.apk" button above to download the installer directly on your device.
              </p>
            </div>

            <div className="bg-black/90 border border-white/10 hover:border-amber-500/40 p-5 rounded-2xl transition-all">
              <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
                02
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Allow Unknown Apps</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                If prompted with <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>, then allow installs from Chrome / Files.
              </p>
            </div>

            <div className="bg-black/90 border border-white/10 hover:border-emerald-500/40 p-5 rounded-2xl transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
                03
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Tap to Install</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Open the downloaded <code className="text-cyan-400">iTantra.apk</code> from your notifications and press <strong>Install</strong>.
              </p>
            </div>

            <div className="bg-black/90 border border-white/10 hover:border-purple-500/40 p-5 rounded-2xl transition-all">
              <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/80 text-purple-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
                04
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Launch & Join Mesh</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Grant Bluetooth and Location permissions to begin autonomous peer-to-peer relaying.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black py-8 px-6 text-center text-xs text-neutral-500 font-mono">
        <p>iTantra: Indian Multilingual TTS & STT-Aided Neural Transceiver Radio Access for Low-Bitrate Links</p>
        <p className="mt-1 text-[11px] text-neutral-600">Smart India Hackathon Product · MIT Licensed</p>
      </footer>

    </div>
  );
}
