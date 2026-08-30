import React from 'react';
import { SessionStats } from '../types';

interface StatsPanelProps {
  stats: SessionStats | null;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) {
    return (
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <p className="text-gray-400 text-sm">Waiting for stats update...</p>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gray-900/50 p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">Session Statistics</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bandwidth</p>
          <p className="text-lg font-mono text-emerald-400">{stats.current_bandwidth_kbps.toFixed(1)} kbps</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Latency</p>
          <p className="text-lg font-mono text-emerald-400">{stats.current_latency_ms.toFixed(0)} ms</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Packet Loss</p>
          <p className="text-lg font-mono text-emerald-400">{stats.current_packet_loss_pct.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Data Transmitted</p>
          <p className="text-lg font-mono text-emerald-400">{formatBytes(stats.total_bytes_transmitted)}</p>
        </div>
        <div className="col-span-2 mt-2 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Efficiency vs Raw Audio</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-blue-400">{stats.bytes_saved_pct.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mb-1">Saved</p>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, stats.bytes_saved_pct))}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
