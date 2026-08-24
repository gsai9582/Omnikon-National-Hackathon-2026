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

    const { subscribe } = useWebSocket();

    const loadData = async () => {
        try {
            // Load cases needing verification
            const casesRes = await casesAPI.getAll({ status: 'REPORTED', size: 50 });
            const casesRes2 = await casesAPI.getAll({ status: 'UNDER_VERIFICATION', size: 50 });
            setPendingCases([...casesRes.data.content, ...casesRes2.data.content]);

            // Load pending duplicates
            const dupRes = await casesAPI.getDuplicates();
            setDuplicates(dupRes.data);
        } catch (error) {
            console.error('Failed to load authority data:', error);
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
        try {
            await casesAPI.verify(id);
            loadData();
        } catch (e) {
            alert('Failed to verify case');
        }
    };

    const handleConfirmDuplicate = async (dupId) => {
        try {
            await casesAPI.confirmDuplicate(dupId);
            setSelectedDuplicate(null);
            loadData();
        } catch (e) {
            alert('Failed to confirm duplicate');
        }
    };

    const handleRejectDuplicate = async (dupId) => {
        try {
            await casesAPI.rejectDuplicate(dupId);
            setSelectedDuplicate(null);
            loadData();
        } catch (e) {
            alert('Failed to reject duplicate');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-white mb-8">Authority Verification Dashboard</h1>

            <AiSuggestionsPanel onVerifyAction={loadData} />

            {/* Duplicates Section */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-orange-400 mb-4 flex items-center gap-2">
                    Pending Duplicate Suggestions
                    <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full">
                        {duplicates.length}
                    </span>
                </h2>
                
                {duplicates.length === 0 ? (
                    <p className="text-slate-400 italic bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
                        No duplicate suggestions pending.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {duplicates.map(dup => (
                            <div key={dup.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-orange-500/50 transition">
                                <div className="text-sm text-slate-400 mb-2">Primary: {dup.primaryCase.caseId}</div>
                                <div className="text-sm text-slate-400 mb-4">Candidate: {dup.candidateCase.caseId}</div>
                                <p className="text-slate-300 font-medium mb-1">Reason: {dup.reason}</p>
                                <p className="text-xs text-orange-400 mb-4">Score: {(dup.similarityScore * 100).toFixed(0)}%</p>
                                <button
                                    onClick={() => setSelectedDuplicate(dup)}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm transition"
                                >
                                    Review Match
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cases Awaiting Verification Section */}
            <div>
                <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                    Cases Awaiting Verification
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">
                        {pendingCases.length}
                    </span>
                </h2>

                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 border-b border-slate-700">
                            <tr>
                                <th className="p-4 text-slate-300 font-medium text-sm">Case ID</th>
                                <th className="p-4 text-slate-300 font-medium text-sm">Name</th>
                                <th className="p-4 text-slate-300 font-medium text-sm">Status</th>
                                <th className="p-4 text-slate-300 font-medium text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {pendingCases.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400 italic">
                                        No cases pending verification.
                                    </td>
                                </tr>
                            ) : (
                                pendingCases.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-700/30 transition">
                                        <td className="p-4">
                                            <Link to={`/cases/${c.id}`} className="text-blue-400 hover:underline">
                                                {c.caseId}
                                            </Link>
                                        </td>
                                        <td className="p-4 text-slate-300">{c.fullName}</td>
                                        <td className="p-4">
                                            <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleVerifyCase(c.id)}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-sm transition"
                                            >
                                                Verify
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
