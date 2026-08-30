import React from 'react';

interface SignalMeterProps {
  bandwidthKbps: number;
  connected?: boolean;
}

export const SignalStrengthMeter: React.FC<SignalMeterProps> = ({ bandwidthKbps }) => {
  let bars = 1;
  let label = 'No Net (0 kbps)';
  let color = 'text-emerald-400 bg-emerald-950/80 border-emerald-800';

  if (bandwidthKbps > 10) {
    bars = 4;
    label = `4G Full (${bandwidthKbps} kbps)`;
    color = 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
  } else if (bandwidthKbps > 2) {
    bars = 3;
    label = `2G Signal (${bandwidthKbps} kbps)`;
    color = 'text-blue-400 bg-blue-950/80 border-blue-800';
  } else if (bandwidthKbps > 0) {
    bars = 2;
    label = `AI Mesh (${bandwidthKbps} kbps)`;
    color = 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
  } else {
    bars = 1;
    label = 'Offline Mesh (0 kbps)';
    color = 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border shadow-inner ${color}`}>
      {/* 4 Bar Signal Icon */}
      <div className="flex items-end space-x-0.5 h-3.5 shrink-0">
        <div className={`w-1 rounded-sm ${bars >= 1 ? 'h-1.5 bg-current' : 'h-1.5 opacity-20 bg-slate-600'}`}></div>
        <div className={`w-1 rounded-sm ${bars >= 2 ? 'h-2 bg-current' : 'h-2 opacity-20 bg-slate-600'}`}></div>
        <div className={`w-1 rounded-sm ${bars >= 3 ? 'h-2.5 bg-current' : 'h-2.5 opacity-20 bg-slate-600'}`}></div>
        <div className={`w-1 rounded-sm ${bars >= 4 ? 'h-3.5 bg-current' : 'h-3.5 opacity-20 bg-slate-600'}`}></div>
      </div>
      <span>{label}</span>
    </div>
  );
};
