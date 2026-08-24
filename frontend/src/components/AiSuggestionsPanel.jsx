import React, { useEffect, useState } from 'react';
import { aiAPI } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';

function AiSuggestionsPanel({ onVerifyAction }) {
    const [suggestions, setSuggestions] = useState([]);
    const { subscribe } = useWebSocket();

    const loadSuggestions = async () => {
        try {
            const res = await aiAPI.getPendingMatches();
            setSuggestions(res.data);
        } catch (error) {
            console.error('Failed to load AI suggestions', error);
        }
    };

    useEffect(() => {
        loadSuggestions();
    }, []);

    useEffect(() => {
        if (!subscribe) return;
        const sub = subscribe('/topic/cases', () => loadSuggestions());
        return () => { if (sub) sub.unsubscribe(); };
    }, [subscribe]);

    const handleAccept = async (id) => {
        try {
            await aiAPI.acceptMatch(id);
            loadSuggestions();
            if (onVerifyAction) onVerifyAction();
        } catch (error) {
            console.error(error);
        }
    };

    const handleReject = async (id) => {
        try {
            await aiAPI.rejectMatch(id);
            loadSuggestions();
        } catch (error) {
            console.error(error);
        }
    };

    if (suggestions.length === 0) return null;

    return (
        <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-amber-500/50 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-amber-500 flex items-center">
                    <span className="text-2xl mr-2">🤖</span> AI Match Suggestions
                </h2>
                <span className="bg-amber-500/20 text-amber-500 text-xs px-2 py-1 rounded-full font-semibold border border-amber-500/30 uppercase tracking-wider">
                    Human Verification Required
                </span>
            </div>
            
            <p className="text-sm text-slate-400 mb-4 bg-slate-900/50 p-3 rounded-md border border-slate-700">
                <strong className="text-slate-300">Responsible AI Notice:</strong> These suggestions are generated based on facial similarity embeddings using `{suggestions[0]?.thresholdConfig || 'Config'}`. 
                They do not definitively confirm identity and must never be used to automatically merge cases. Please review carefully.
            </p>

            <div className="space-y-4">
                {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-slate-700/50 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-600">
                        <div className="flex flex-1 items-center justify-around w-full gap-4">
                            <div className="text-center">
                                <span className="text-xs text-slate-400 uppercase">Primary Case</span>
                                <div className="font-bold text-slate-200 mt-1">{suggestion.primaryCaseCode}</div>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <div className="h-[2px] w-16 bg-slate-600 relative">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-2 rounded-full border border-slate-600 text-xs font-bold text-slate-300">
                                        VS
                                    </div>
                                </div>
                                <div className={`mt-3 text-sm font-bold ${
                                    suggestion.confidenceCategory === 'HIGH' ? 'text-emerald-400' :
                                    suggestion.confidenceCategory === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                    {(suggestion.similarityScore * 100).toFixed(1)}% Match
                                </div>
                            </div>

                            <div className="text-center">
                                <span className="text-xs text-slate-400 uppercase">Candidate Case</span>
                                <div className="font-bold text-slate-200 mt-1">{suggestion.candidateCaseCode}</div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                            <button
                                onClick={() => handleAccept(suggestion.id)}
                                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
                            >
                                Send to Verification
                            </button>
                            <button
                                onClick={() => handleReject(suggestion.id)}
                                className="flex-1 md:flex-none bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AiSuggestionsPanel;
