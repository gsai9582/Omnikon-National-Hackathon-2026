import React from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

function LiveIndicator() {
    const ws = useWebSocket();
    
    // If we're not inside the provider or it's not ready, don't show anything
    if (!ws) return null;

    return (
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 shadow-sm ml-4">
            <span className="relative flex h-3 w-3">
                {ws.connected ? (
                    <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </>
                ) : (
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                )}
            </span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {ws.connected ? 'Live' : 'Reconnecting...'}
            </span>
        </div>
    );
}

export default LiveIndicator;
