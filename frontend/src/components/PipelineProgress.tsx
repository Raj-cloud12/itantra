import React from 'react';
import { MessageStats } from '../types';

interface PipelineProgressProps {
  currentStage?: string;
  stage?: string;
  stats: MessageStats | null;
  bandwidthKbps?: number;
  networkMode?: string;
}

export function PipelineProgress({
  currentStage,
  stage,
  stats,
  bandwidthKbps = 2.4,
  networkMode = 'mode-2-compressed-voice'
}: PipelineProgressProps) {
  const activeStage = currentStage || stage || 'idle';

  const isMode1 = networkMode === 'mode-1-hd-call';
  const isMode2 = networkMode === 'mode-2-compressed-voice';
  const isMode3 = networkMode === 'mode-3-ai-mesh';
  const isMode4 = networkMode === 'mode-4-satellite-beacon';

  // Mode 1: 3-stage direct HD stream (64 kbps)
  // Mode 2: 4-stage radio compressed audio (2.4 kbps / 1.2 KB)
  // Mode 3: 4-stage BLE/Wi-Fi Mesh with Voice-to-Text conversion (24 bytes)
  // Mode 4: 4-stage 16-Byte Satellite / Gov Emergency SOS Beacon
  const STAGES = isMode1
    ? [
        { key: 'queued', label: '1. Queued' },
        { key: 'transmitting', label: '2. 4G/5G Stream' },
        { key: 'delivered', label: '3. Delivered' }
      ]
    : isMode3
    ? [
        { key: 'queued', label: '1. Voice Mic' },
        { key: 'compressing', label: '2. Voice ➔ AI Text' },
        { key: 'transmitting', label: '3. BLE/Wi-Fi Mesh' },
        { key: 'delivered', label: '4. Decrypt & TTS' }
      ]
    : isMode4
    ? [
        { key: 'queued', label: '1. SOS Trigger' },
        { key: 'compressing', label: '2. 16-Byte Frame' },
        { key: 'transmitting', label: '3. Satellite / LoRa' },
        { key: 'delivered', label: '4. Gov Dispatched' }
      ]
    : [
        { key: 'queued', label: '1. Queued' },
        { key: 'compressing', label: '2. Compressing' },
        { key: 'transmitting', label: '3. ISM Radio' },
        { key: 'delivered', label: '4. Delivered' }
      ];

  const stageKeys = STAGES.map(s => s.key);
  const currentIndex = stageKeys.indexOf(activeStage);

  return (
    <div className="bg-[#0a1122] rounded-2xl p-3.5 border border-blue-950 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-blue-400">
          <span className={`w-2 h-2 rounded-full animate-pulse ${
            isMode1 ? 'bg-emerald-400' : isMode3 ? 'bg-amber-400' : isMode4 ? 'bg-rose-500' : 'bg-blue-400'
          }`}></span>
          {isMode1
            ? '🟢 Mode 1: 4G/5G Direct HD Stream'
            : isMode2
            ? '🔵 Mode 2: 2G Compressed Audio (2.4 kbps / 1.2 KB)'
            : isMode3
            ? '🟡 Mode 3: AI Mesh (Voice ➔ AI Text 24B)'
            : '🔴 Mode 4: 16-Byte Gov Satellite & LoRa SOS'}
        </h4>
        <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-full ${
          isMode4 ? 'text-rose-300 bg-red-950 border-red-800 font-bold' : 'text-slate-400 bg-blue-950/80 border-blue-900'
        }`}>
          {isMode1 ? '3-Stage Direct' : isMode3 ? '4-Stage AI Mesh' : isMode4 ? '16-Byte Satellite' : '4-Stage Radio CELT'}
        </span>
      </div>

      <div className="relative">
        {/* Background Connecting Line */}
        <div className="absolute top-3 left-4 right-4 h-0.5 bg-blue-950 -z-0"></div>

        <div className="flex justify-between items-start relative z-10 px-1">
          {STAGES.map((s, idx) => {
            const isCompleted = currentIndex > idx || activeStage === 'delivered';
            const isActive = activeStage === s.key && s.key !== 'delivered';

            return (
              <div key={s.key} className="flex flex-col items-center relative flex-1">
                {/* Stage Indicator Node */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mb-1.5 transition-all duration-300 ${
                    isCompleted
                      ? (isMode4 ? 'bg-red-600 border-red-400 shadow-[0_0_10px_rgba(225,29,72,0.6)]' : 'bg-blue-600 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.6)]')
                      : isActive
                      ? (isMode4 ? 'bg-red-500 border-rose-300 shadow-[0_0_12px_rgba(225,29,72,0.9)] scale-110 animate-pulse' : 'bg-blue-500 border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.9)] scale-110 animate-pulse')
                      : 'bg-[#070b14] border-blue-950 text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-900"></div>
                  )}
                </div>

                {/* Stage Label */}
                <span
                  className={`text-[9px] font-mono font-bold capitalize text-center ${
                    isCompleted || isActive ? (isMode4 ? 'text-rose-300' : 'text-blue-300') : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>

                {/* Live Stats */}
                {isCompleted && stats && (
                  <span className="text-[8px] font-mono text-slate-400 mt-0.5 text-center">
                    {s.key === 'queued' && (isMode4 ? '16B Frame' : `${(stats.original_audio_bytes / 1024).toFixed(1)}KB Raw`)}
                    {s.key === 'compressing' && (isMode4 ? 'Hex Packed' : isMode3 ? `${stats.compressed_bytes} B Text` : `${(stats.compressed_bytes / 1024).toFixed(1)}KB CELT`)}
                    {s.key === 'transmitting' && (isMode4 ? 'NavIC / 865M' : isMode1 ? '4G/5G' : isMode3 ? 'BLE/Wi-Fi' : '865MHz/2.4G')}
                    {s.key === 'delivered' && `${stats.transit_time_ms || 35}ms`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
