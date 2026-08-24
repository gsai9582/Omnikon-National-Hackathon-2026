import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

function DuplicateCompareModal({ isOpen, onClose, candidate, onConfirm, onReject }) {
    if (!candidate) return null;

    const { primaryCase, candidateCase, similarityScore, reason } = candidate;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-4xl rounded-lg bg-slate-800 p-6 shadow-xl border border-slate-700 max-h-[90vh] overflow-y-auto">
                    <div className="bg-red-500 text-white text-center py-2 font-bold uppercase tracking-widest rounded mb-4">
                        HUMAN VERIFICATION REQUIRED
                    </div>

                    <DialogTitle className="text-xl font-medium text-white mb-4">
                        Review Duplicate Suggestion
                    </DialogTitle>
                    
                    <div className="mb-6 p-4 bg-slate-700/50 rounded text-slate-300">
                        <p><strong>Similarity Score:</strong> {(similarityScore * 100).toFixed(0)}%</p>
                        <p><strong>Reason:</strong> {reason}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Primary Case */}
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <h3 className="text-lg font-semibold text-emerald-400 mb-3">Primary Case (Existing)</h3>
                            <p className="text-sm text-slate-400 mb-2">ID: {primaryCase.caseId}</p>
                            {primaryCase.photoUrl && (
                                <img src={`http://localhost:8080/api${primaryCase.photoUrl}`} alt="Primary" className="w-full h-48 object-cover rounded mb-3" />
                            )}
                            <div className="space-y-1 text-slate-200">
                                <p><strong>Name:</strong> {primaryCase.fullName}</p>
                                <p><strong>Age/Gender:</strong> {primaryCase.age} / {primaryCase.gender}</p>
                                <p><strong>Status:</strong> {primaryCase.status}</p>
                                <p><strong>Last Seen:</strong> {primaryCase.lastSeenAddress}</p>
                            </div>
                        </div>

                        {/* Candidate Case */}
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <h3 className="text-lg font-semibold text-orange-400 mb-3">Candidate Case (New)</h3>
                            <p className="text-sm text-slate-400 mb-2">ID: {candidateCase.caseId}</p>
                            {candidateCase.photoUrl && (
                                <img src={`http://localhost:8080/api${candidateCase.photoUrl}`} alt="Candidate" className="w-full h-48 object-cover rounded mb-3" />
                            )}
                            <div className="space-y-1 text-slate-200">
                                <p><strong>Name:</strong> {candidateCase.fullName}</p>
                                <p><strong>Age/Gender:</strong> {candidateCase.age} / {candidateCase.gender}</p>
                                <p><strong>Status:</strong> {candidateCase.status}</p>
                                <p><strong>Last Seen:</strong> {candidateCase.lastSeenAddress}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 hover:text-white bg-transparent"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => onReject(candidate.id)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
                        >
                            Reject Suggestion
                        </button>
                        <button 
                            onClick={() => onConfirm(candidate.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded shadow transition"
                        >
                            Confirm Duplicate (Merge)
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default DuplicateCompareModal;
