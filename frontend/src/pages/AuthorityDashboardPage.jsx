import React, { useEffect, useState } from 'react';
import { casesAPI } from '../services/api';
import DuplicateCompareModal from '../components/DuplicateCompareModal';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Link } from 'react-router-dom';
import AiSuggestionsPanel from '../components/AiSuggestionsPanel';

function AuthorityDashboardPage() {
    const [pendingCases, setPendingCases] = useState([]);
    const [duplicates, setDuplicates] = useState([]);
    const [selectedDuplicate, setSelectedDuplicate] = useState(null);
    const [verifyingId, setVerifyingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { subscribe } = useWebSocket();

    const loadData = async () => {
        try {
            // Load cases needing verification
            const casesRes = await casesAPI.getAll({ status: 'REPORTED', size: 50 });
            const casesRes2 = await casesAPI.getAll({ status: 'UNDER_VERIFICATION', size: 50 });
            setPendingCases([...casesRes.data.content, ...casesRes2.data.content]);

            // Load pending duplicates
            const dupRes = await casesAPI.getDuplicates();
            setDuplicates(dupRes.data || []);
        } catch (error) {
            console.error('Failed to load authority data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!subscribe) return;
        const sub = subscribe('/topic/cases', () => loadData());
        return () => { if (sub) sub.unsubscribe(); };
    }, [subscribe]);

    const handleVerifyCase = async (id) => {
        if (verifyingId) return;
        setVerifyingId(id);
        try {
            await casesAPI.verify(id);
            await loadData();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to verify case');
        } finally {
            setVerifyingId(null);
        }
    };

    const handleConfirmDuplicate = async (dupId) => {
        try {
            await casesAPI.confirmDuplicate(dupId);
            setSelectedDuplicate(null);
            await loadData();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to confirm duplicate');
        }
    };

    const handleRejectDuplicate = async (dupId) => {
        try {
            await casesAPI.rejectDuplicate(dupId);
            setSelectedDuplicate(null);
            await loadData();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to reject duplicate');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Authority Verification Dashboard</h1>
                <p className="text-sm text-slate-400 mt-1">Review AI matches, detect duplicate reports, and certify missing person records</p>
            </div>

            <AiSuggestionsPanel onVerifyAction={loadData} />

            {/* Duplicates Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-orange-400 flex items-center gap-2">
                        <span>🔍</span>
                        <span>Pending Duplicate Suggestions</span>
                        <span className="bg-orange-500/20 text-orange-400 text-xs px-2.5 py-0.5 rounded-full border border-orange-500/30">
                            {duplicates.length}
                        </span>
                    </h2>
                </div>
                
                {duplicates.length === 0 ? (
                    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-slate-700/40 rounded-full flex items-center justify-center text-xl mb-3 text-slate-400">
                            ✨
                        </div>
                        <p className="text-slate-300 font-medium text-sm">No duplicate records detected</p>
                        <p className="text-slate-500 text-xs mt-1">Incoming incidents are automatically checked for attribute cross-matches.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {duplicates.map(dup => (
                            <div key={dup.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-orange-500/50 transition shadow-md">
                                <div className="text-xs text-slate-400 mb-1 font-mono">Primary: <span className="text-emerald-400">{dup.primaryCase?.caseId}</span></div>
                                <div className="text-xs text-slate-400 mb-3 font-mono">Candidate: <span className="text-orange-400">{dup.candidateCase?.caseId}</span></div>
                                <p className="text-slate-200 text-sm font-medium mb-1 line-clamp-2">{dup.reason}</p>
                                <div className="flex items-center justify-between mb-4 mt-2">
                                    <span className="text-xs text-slate-400">Match Confidence</span>
                                    <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                                        {(dup.similarityScore * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedDuplicate(dup)}
                                    className="cursor-pointer w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-semibold transition"
                                >
                                    Compare & Review →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cases Awaiting Verification Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                        <span>📋</span>
                        <span>Cases Awaiting Official Verification</span>
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            {pendingCases.length}
                        </span>
                    </h2>
                </div>

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700 text-left">
                            <thead className="bg-slate-900">
                                <tr>
                                    <th className="p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Case ID</th>
                                    <th className="p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Name</th>
                                    <th className="p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Current Status</th>
                                    <th className="p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {pendingCases.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-slate-400">
                                            <div className="w-12 h-12 bg-slate-700/40 rounded-full flex items-center justify-center text-xl mx-auto mb-3 text-slate-400">
                                                ✅
                                            </div>
                                            <p className="text-slate-300 font-medium text-sm">All pending cases are currently verified</p>
                                            <p className="text-slate-500 text-xs mt-1">New citizen incident reports will appear here for validation.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    pendingCases.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-700/30 transition">
                                            <td className="p-4">
                                                <Link to={`/cases/${c.id}`} className="text-amber-400 hover:underline font-mono font-medium text-sm">
                                                    {c.caseId}
                                                </Link>
                                            </td>
                                            <td className="p-4 text-slate-200 font-medium text-sm">{c.fullName}</td>
                                            <td className="p-4">
                                                <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleVerifyCase(c.id)}
                                                    disabled={verifyingId === c.id}
                                                    className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 inline-flex items-center gap-1.5 shadow-md shadow-emerald-900/20"
                                                >
                                                    {verifyingId === c.id ? (
                                                        <>
                                                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                                            <span>Verifying...</span>
                                                        </>
                                                    ) : (
                                                        <span>Certify & Verify</span>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DuplicateCompareModal 
                isOpen={!!selectedDuplicate} 
                onClose={() => setSelectedDuplicate(null)}
                candidate={selectedDuplicate}
                onConfirm={handleConfirmDuplicate}
                onReject={handleRejectDuplicate}
            />
        </div>
    );
}

export default AuthorityDashboardPage;
