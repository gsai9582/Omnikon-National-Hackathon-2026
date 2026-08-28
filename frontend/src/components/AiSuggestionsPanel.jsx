import React, { useEffect, useState } from 'react';
import { aiAPI } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';

function AiSuggestionsPanel({ onVerifyAction }) {
    const [suggestions, setSuggestions] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const { subscribe } = useWebSocket();

    const loadSuggestions = async () => {
        try {
            const res = await aiAPI.getPendingMatches();
            setSuggestions(res.data || []);
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
        if (processingId) return;
        setProcessingId(`accept-${id}`);
        try {
            await aiAPI.acceptMatch(id);
            await loadSuggestions();
            if (onVerifyAction) onVerifyAction();
        } catch (error) {
            console.error('Failed to accept AI match:', error);
            alert('Failed to accept AI suggestion');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        if (processingId) return;
        setProcessingId(`reject-${id}`);
        try {
            await aiAPI.rejectMatch(id);
            await loadSuggestions();
        } catch (error) {
            console.error('Failed to reject AI match:', error);
            alert('Failed to reject AI suggestion');
        } finally {
            setProcessingId(null);
        }
    };

    if (suggestions.length === 0) return null;

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-amber-500/40 mb-6 font-sans">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-xl font-bold text-amber-500 flex items-center">
                    <span className="text-2xl mr-2">🤖</span> AI Match Suggestions
                </h2>
                <span className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full font-bold border border-amber-500/30 uppercase tracking-wider">
                    Human Verification Required
                </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-5 bg-slate-900/60 p-3.5 rounded-lg border border-slate-700 leading-relaxed">
                <strong className="text-slate-300">Responsible AI Notice:</strong> These suggestions are generated using vector similarity embeddings. 
                They are advisory candidates for decision-support and require human verification before being merged or actioned.
            </p>

            <div className="space-y-4">
                {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-slate-700/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-600/70">
                        <div className="flex flex-1 items-center justify-around w-full gap-4">
                            <div className="text-center">
                                <span className="text-xs text-slate-400 uppercase tracking-wider">Primary Case</span>
                                <div className="font-bold text-slate-200 mt-1 font-mono">{suggestion.primaryCaseCode}</div>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <div className="h-[2px] w-16 bg-slate-600 relative">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-2 rounded-full border border-slate-600 text-xs font-bold text-slate-300">
                                        VS
                                    </div>
                                </div>
                                <div className={`mt-3 text-xs font-bold ${
                                    suggestion.confidenceCategory === 'HIGH' ? 'text-emerald-400' :
                                    suggestion.confidenceCategory === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                    {(suggestion.similarityScore * 100).toFixed(1)}% Match ({suggestion.confidenceCategory})
                                </div>
                            </div>

                            <div className="text-center">
                                <span className="text-xs text-slate-400 uppercase tracking-wider">Candidate Case</span>
                                <div className="font-bold text-slate-200 mt-1 font-mono">{suggestion.candidateCaseCode}</div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                            <button
                                onClick={() => handleAccept(suggestion.id)}
                                disabled={!!processingId}
                                className="cursor-pointer flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {processingId === `accept-${suggestion.id}` && (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                <span>Send to Verification</span>
                            </button>
                            <button
                                onClick={() => handleReject(suggestion.id)}
                                disabled={!!processingId}
                                className="cursor-pointer flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-medium text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {processingId === `reject-${suggestion.id}` && (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                <span>Dismiss Match</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AiSuggestionsPanel;
