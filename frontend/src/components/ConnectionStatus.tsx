import React from 'react';

interface ConnectionStatusProps {
  connected: boolean;
  peerOnline?: boolean;
}

export function ConnectionStatus({ connected, peerOnline }: ConnectionStatusProps) {
  if (!connected) {
    return (
      <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-sm font-medium text-gray-300">Offline / Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
        <span className="text-sm font-medium text-gray-300">Connected</span>
      </div>
      
      {peerOnline !== undefined && (
        <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
          <div className={`w-2.5 h-2.5 rounded-full ${peerOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-300">
            {peerOnline ? 'Peer Online' : 'Peer Offline'}
          </span>
        </div>
      )}
    </div>
  );
}
