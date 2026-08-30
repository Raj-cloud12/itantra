import React from 'react';

interface EmergencyToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function EmergencyToggle({ enabled, onToggle }: EmergencyToggleProps) {
  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      enabled 
        ? 'bg-red-900/30 border-red-500 emergency-pulse' 
        : 'bg-gray-800 border-gray-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            enabled ? 'bg-red-600' : 'bg-gray-700 text-gray-400'
          }`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div>
            <h3 className={`font-bold ${enabled ? 'text-red-400' : 'text-gray-300'}`}>
              EMERGENCY PRIORITY
            </h3>
            <p className="text-xs text-gray-500">
              Flags next message as critical
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
            enabled ? 'bg-red-600' : 'bg-gray-600'
          }`}
        >
          <span className="sr-only">Toggle Emergency Mode</span>
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
