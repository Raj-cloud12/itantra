import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';

export default function DownloadPage() {
  const [apkInfo, setApkInfo] = useState({
    version: '1.0',
    size_mb: 112.2,
    filename: 'iTantra.apk',
    package_id: 'com.ititantra.civilianapp',
    app_name: 'iTantra',
    gdrive_url: 'https://drive.google.com/file/d/1xy8R1cWIrWCrN6pr_WC2f7zdCHDMq6gY/view?usp=drivesdk',
    gdrive_direct_url: 'https://drive.usercontent.google.com/download?id=1xy8R1cWIrWCrN6pr_WC2f7zdCHDMq6gY&export=download&confirm=t'
  });
  const [downloadUrl, setDownloadUrl] = useState<string>('/download-apk');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Resolve absolute download URL for QR code
    const fullUrl = `${window.location.origin}/download-apk`;
    setDownloadUrl(fullUrl);

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
            gdrive_url: data.gdrive_url || prev.gdrive_url,
            gdrive_direct_url: data.gdrive_direct_url || prev.gdrive_direct_url
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black flex flex-col relative overflow-y-auto overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link to="/download" className="flex items-center gap-3 group">
            <img
              src="/logo_round.png"
              alt="iTantra Logo"
              className="w-10 h-10 rounded-full border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white tracking-wide">iTantra</span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 px-2 py-0.5 rounded-full font-mono font-bold">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Indian Multilingual Disaster Communication & Mesh Network</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link
            to="/field"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
          >
            📱 <span>Web Mobile App</span>
          </Link>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-inner mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-cyan-400 font-bold">Release v{apkInfo.version}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Signed Production APK</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-mono font-semibold">{apkInfo.size_mb} MB</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4">
          Download <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">iTantra</span> for Android
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed mb-10">
          The tactical zero-infrastructure emergency mesh transceiver. Send distress beacons, voice notes, and private peer-to-peer messages — <strong className="text-emerald-400">even when cell towers and the internet are completely dead.</strong>
        </p>

        {/* Action Cards (Direct Download & QR Code) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-4xl items-stretch mb-16 text-left">
          
          {/* Card 1: Direct APK Download (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <img
                  src="/logo_round.png"
                  alt="iTantra Logo"
                  className="w-16 h-16 rounded-2xl border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] object-cover bg-black"
                />
                <div>
                  <h2 className="text-2xl font-black text-white">iTantra Native Android</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{apkInfo.package_id}</p>
                </div>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6 text-[11px] font-mono">
                <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">FILE SIZE</span>
                  <span className="text-emerald-400 font-bold">{apkInfo.size_mb} MB</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">MIN ANDROID</span>
                  <span className="text-cyan-400 font-bold">Android 7.0+</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">SIGNATURE</span>
                  <span className="text-purple-400 font-bold">V1 & V2 Signed</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">CPU ARCH</span>
                  <span className="text-amber-400 font-bold">arm64-v8a</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">ASR AI ENGINE</span>
                  <span className="text-blue-400 font-bold">Sherpa-ONNX</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">SECURITY</span>
                  <span className="text-rose-400 font-bold">AES-256-GCM</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href="/download-apk"
                download="iTantra.apk"
                className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.7)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 text-slate-950 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download iTantra.apk ({apkInfo.size_mb} MB)</span>
              </a>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{copied ? '✅ Link Copied!' : '📋 Copy Link'}</span>
                </button>
                <a
                  href={apkInfo.gdrive_direct_url || "https://drive.usercontent.google.com/download?id=1xy8R1cWIrWCrN6pr_WC2f7zdCHDMq6gY&export=download&confirm=t"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-emerald-300 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-950/30 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
                  </svg>
                  <span>Google Drive Mirror</span>
                </a>
              </div>
            </div>

          </div>

          {/* Card 2: Mobile Scan QR Code (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden backdrop-blur-xl text-center">
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 mb-3 inline-block">
                Instant Mobile Scan
              </span>
              <h3 className="text-xl font-black text-white mb-1">Scan from Smartphone</h3>
              <p className="text-xs text-slate-400 max-w-xs mb-5">
                Point your mobile camera at this QR code to download directly onto your device.
              </p>
            </div>

            {/* Glowing QR Box */}
            <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] border-2 border-emerald-400/50 mb-4 inline-block">
              <QRCodeSVG
                value={downloadUrl}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="text-[11px] font-mono text-slate-400">
              Direct Link: <span className="text-cyan-400">{window.location.host}/download-apk</span>
            </p>
          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full max-w-4xl mb-16 text-left">
          <h3 className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase mb-4 text-center">
            ⚡ What's Packed Inside iTantra Native
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl mb-2">📴</div>
              <h4 className="font-bold text-sm text-white mb-1">100% Offline Air Mesh</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Relays packets via BLE & Wi-Fi Direct radio frames without needing cellular network or internet backhaul.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl mb-2">🎙️</div>
              <h4 className="font-bold text-sm text-white mb-1">On-Device AI Voice (Sherpa)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Offline AI model transcribes spoken regional languages locally on the phone without Google or cloud servers.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl mb-2">🚨</div>
              <h4 className="font-bold text-sm text-white mb-1">1-Tap Emergency SOS</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant distress beacon broadcasting GPS coordinates, reverse-geocoded landmarks, and life-saving request chips.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl mb-2">🔒</div>
              <h4 className="font-bold text-sm text-white mb-1">Mode 3 Private E2EE Chat</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Military-grade AES-256-GCM encryption locks peer-to-peer chats so only the recipient can decrypt messages.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl mb-2">🌐</div>
              <h4 className="font-bold text-sm text-white mb-1">10 Indian Languages</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full native localization for Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, Marathi, Gujarati, Urdu, and English.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl mb-2">🏢</div>
              <h4 className="font-bold text-sm text-white mb-1">Command Center Gateway</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically hops packets to any connected uplink node to deliver citizen SOS signals directly to rescue coordinators.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Installation Guide */}
        <div className="w-full max-w-4xl text-left bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md mb-12">
          <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
            <span>📦 How to Install on Your Android Phone</span>
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Quick 4-step installation for sideloading the signed APK without Google Play Store:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
                01
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Download APK</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tap the download button above or scan the QR code using your phone's browser.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
                02
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Allow Unknown Apps</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If prompted with <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>, then allow installs from Chrome / Files.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
                03
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Tap to Install</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Open the downloaded <code className="text-cyan-400">iTantra.apk</code> from your notifications and press <strong>Install</strong>.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 text-purple-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
                04
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Launch & Join Mesh</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Grant Bluetooth and Location permissions to begin autonomous peer-to-peer relaying.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-6 px-6 text-center text-xs text-slate-500 font-mono">
        <p>iTantra: Indian Multilingual TTS & STT-Aided Neural Transceiver Radio Access for Low-Bitrate Links</p>
        <p className="mt-1 text-[11px] text-slate-600">Smart India Hackathon Product · MIT Licensed</p>
      </footer>

    </div>
  );
}
