import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { getPhotoUrl } from '../services/api';

function DuplicateCompareModal({ isOpen, onClose, candidate, onConfirm, onReject }) {
    const [actionPending, setActionPending] = useState(null); // 'confirm' or 'reject'

    if (!candidate) return null;

    const { primaryCase, candidateCase, similarityScore, reason } = candidate;

    const handleConfirmClick = async () => {
        if (actionPending) return;
        setActionPending('confirm');
        try {
            await onConfirm(candidate.id);
        } finally {
            setActionPending(null);
        }
    };

    const handleRejectClick = async () => {
        if (actionPending) return;
        setActionPending('reject');
        try {
            await onReject(candidate.id);
        } finally {
            setActionPending(null);
        }
    };

    return (
        <Dialog open={isOpen} onClose={actionPending ? () => {} : onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-4xl rounded-2xl bg-slate-800 p-6 sm:p-8 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto font-sans">
                    <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-center py-2.5 px-4 font-bold text-xs uppercase tracking-widest rounded-lg mb-6 flex items-center justify-center gap-2">
                        <span>🛡️</span>
                        <span>Human Authority Verification Required</span>
                    </div>

                    <DialogTitle className="text-2xl font-bold text-white mb-2">
                        Review Potential Duplicate Incident
                    </DialogTitle>
                    <p className="text-slate-400 text-sm mb-6">
                        Examine details side-by-side to verify if both records refer to the same missing individual.
                    </p>
                    
                    <div className="mb-6 p-4 bg-slate-900/70 border border-slate-700/80 rounded-xl text-slate-300 flex flex-col sm:flex-row justify-between gap-3 text-sm">
                        <div>
                            <strong className="text-slate-400">Heuristic Reason:</strong> {reason || 'Cross-referenced matching attributes'}
                        </div>
                        <div className="text-amber-400 font-bold sm:text-right">
                            Similarity Match: {(similarityScore * 100).toFixed(0)}%
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Primary Case */}
                        <div className="bg-slate-900 p-5 rounded-xl border border-emerald-500/30">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                                <h3 className="text-base font-bold text-emerald-400">Primary Case (Existing)</h3>
                                <span className="text-xs font-mono text-slate-400">{primaryCase.caseId}</span>
                            </div>
                            {primaryCase.photoUrl ? (
                                <img 
                                    src={getPhotoUrl(primaryCase.photoUrl)} 
                                    alt="Primary" 
                                    className="w-full h-48 object-cover rounded-lg mb-4 border border-slate-800" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-48 bg-slate-800/60 rounded-lg mb-4 flex items-center justify-center text-slate-500 text-sm">
                                    No photograph
                                </div>
                            )}
                            <div className="space-y-1.5 text-sm text-slate-200">
                                <p><span className="text-slate-400">Name:</span> <strong className="text-white">{primaryCase.fullName}</strong></p>
                                <p><span className="text-slate-400">Demographics:</span> {primaryCase.age ? `${primaryCase.age} yrs` : 'Age N/A'}, {primaryCase.gender}</p>
                                <p><span className="text-slate-400">Status:</span> <span className="text-amber-400">{primaryCase.status}</span></p>
                                <p><span className="text-slate-400">Last Seen:</span> {primaryCase.lastSeenAddress || 'Address N/A'}</p>
                            </div>
                        </div>

                        {/* Candidate Case */}
                        <div className="bg-slate-900 p-5 rounded-xl border border-orange-500/30">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                                <h3 className="text-base font-bold text-orange-400">Candidate Case (Incoming)</h3>
                                <span className="text-xs font-mono text-slate-400">{candidateCase.caseId}</span>
                            </div>
                            {candidateCase.photoUrl ? (
                                <img 
                                    src={getPhotoUrl(candidateCase.photoUrl)} 
                                    alt="Candidate" 
                                    className="w-full h-48 object-cover rounded-lg mb-4 border border-slate-800" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-48 bg-slate-800/60 rounded-lg mb-4 flex items-center justify-center text-slate-500 text-sm">
                                    No photograph
                                </div>
                            )}
                            <div className="space-y-1.5 text-sm text-slate-200">
                                <p><span className="text-slate-400">Name:</span> <strong className="text-white">{candidateCase.fullName}</strong></p>
                                <p><span className="text-slate-400">Demographics:</span> {candidateCase.age ? `${candidateCase.age} yrs` : 'Age N/A'}, {candidateCase.gender}</p>
                                <p><span className="text-slate-400">Status:</span> <span className="text-amber-400">{candidateCase.status}</span></p>
                                <p><span className="text-slate-400">Last Seen:</span> {candidateCase.lastSeenAddress || 'Address N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-700">
                        <button 
                            onClick={onClose}
                            disabled={!!actionPending}
                            className="cursor-pointer px-4 py-2.5 text-slate-400 hover:text-white text-sm transition disabled:opacity-50"
                        >
                            Close
                        </button>
                        <button 
                            onClick={handleRejectClick}
                            disabled={!!actionPending}
                            className="cursor-pointer px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {actionPending === 'reject' && (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            <span>Reject Suggestion (Distinct Persons)</span>
                        </button>
                        <button 
                            onClick={handleConfirmClick}
                            disabled={!!actionPending}
                            className="cursor-pointer px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-900/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {actionPending === 'confirm' && (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            <span>Confirm Duplicate (Merge Records)</span>
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default DuplicateCompareModal;
