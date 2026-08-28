import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { casesAPI as cases, getPhotoUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CaseDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [caseData, setCaseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => {
        fetchCase();
    }, [id]);

    const fetchCase = async () => {
        try {
            const res = await cases.getById(id);
            setCaseData(res.data);
        } catch (err) {
            setError('Failed to load incident details or you do not have authorization to view this case.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (updatingStatus || caseData?.status === newStatus) return;
        setUpdatingStatus(newStatus);
        try {
            const res = await cases.updateStatus(id, newStatus);
            setCaseData(res.data);
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data?.error || 'Failed to update case status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'REPORTED': return 'bg-slate-700 text-slate-300';
            case 'UNDER_VERIFICATION': return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
            case 'VERIFIED': return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
            case 'SEARCHING': return 'bg-purple-500/20 text-purple-400 border border-purple-500/40';
            case 'FOUND': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
            case 'CLOSED': return 'bg-slate-800 text-slate-500 border border-slate-700';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto my-12 p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                <p>Loading incident file...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto my-12 bg-slate-800 border border-red-500/30 p-8 rounded-xl text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Unable to Load Case</h3>
                <p className="text-red-400 text-sm mb-6">{error}</p>
                <Link to="/cases" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-lg text-sm transition inline-block">
                    ← Return to Case Directory
                </Link>
            </div>
        );
    }

    if (!caseData) return null;

    const canUpdateStatus = user && (user.role === 'ADMIN' || user.role === 'AUTHORITY');

    return (
        <div className="max-w-4xl mx-auto my-8 px-4 font-sans">
            <div className="mb-4">
                <button
                    onClick={() => navigate('/cases')}
                    className="cursor-pointer text-sm text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                    <span>←</span>
                    <span>Back to Case Directory</span>
                </button>
            </div>

            <div className="bg-slate-800 shadow-xl rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700 bg-slate-800/80">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-white">
                                {caseData.fullName}
                            </h3>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(caseData.status)}`}>
                                {caseData.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-xs font-mono text-amber-400 mt-1">
                            ID: {caseData.caseId}
                        </p>
                    </div>
                    {caseData.needsMedicalAttention && (
                        <div className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 animate-pulse">
                            <span>🚨</span> High Medical Vulnerability
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {caseData.photoUrl ? (
                            <div className="md:col-span-1">
                                <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
                                    <img 
                                        src={getPhotoUrl(caseData.photoUrl)} 
                                        alt={caseData.fullName} 
                                        className="w-full h-64 object-cover" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="md:col-span-1 flex flex-col items-center justify-center h-64 bg-slate-900/60 rounded-xl border border-slate-700 text-slate-500">
                                <span className="text-4xl mb-2">👤</span>
                                <span className="text-xs">No photograph attached</span>
                            </div>
                        )}

                        <div className={`space-y-4 ${caseData.photoUrl ? 'md:col-span-2' : 'md:col-span-2'}`}>
                            {caseData.priorityCategory && (
                                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Decision-Support Priority Score
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                            caseData.priorityCategory === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                                            caseData.priorityCategory === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                                            'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                        }`}>
                                            {caseData.priorityCategory} ({caseData.priorityScore || 0})
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 italic mb-2">
                                        "Prototype priority decision-support model. Not a certified statistical risk prediction."
                                    </p>
                                    {caseData.priorityExplanation && caseData.priorityExplanation.length > 0 && (
                                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                            {caseData.priorityExplanation.map((expl, idx) => (
                                                <li key={idx}>{expl}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                                    <span className="text-xs text-slate-400 block">Age & Gender</span>
                                    <span className="text-slate-200 font-medium">{caseData.age ? `${caseData.age} yrs, ` : ''}{caseData.gender}</span>
                                </div>
                                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                                    <span className="text-xs text-slate-400 block">Last Seen Date & Time</span>
                                    <span className="text-slate-200 font-medium">
                                        {caseData.lastSeenDateTime ? new Date(caseData.lastSeenDateTime).toLocaleString() : 'Not Specified'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-700 text-sm">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Physical Description & Identifying Traits
                            </span>
                            <div className="p-3.5 bg-slate-900/50 rounded-lg text-slate-200 border border-slate-700/60 leading-relaxed">
                                {caseData.description || 'No specific physical description provided.'}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Last Known Location
                            </span>
                            <div className="p-3.5 bg-slate-900/50 rounded-lg text-slate-200 border border-slate-700/60 flex flex-col sm:flex-row justify-between gap-2">
                                <div>
                                    <p className="font-medium text-white">{caseData.lastSeenAddress || 'Address not logged'}</p>
                                    {caseData.latitude && caseData.longitude && (
                                        <p className="text-xs font-mono text-amber-400 mt-0.5">
                                            Coordinates: {caseData.latitude}, {caseData.longitude}
                                        </p>
                                    )}
                                </div>
                                {caseData.latitude && caseData.longitude && (
                                    <Link 
                                        to="/map" 
                                        className="cursor-pointer text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition"
                                    >
                                        <span>📍</span> View on Map
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/40 text-xs text-slate-400 flex justify-between items-center">
                            <span>Reported by: <strong className="text-slate-200">{caseData.createdByName || 'Anonymous User'}</strong></span>
                            <span>Report Date: <strong className="text-slate-200">{new Date(caseData.createdAt).toLocaleDateString()}</strong></span>
                        </div>
                    </div>
                </div>

                {canUpdateStatus && (
                    <div className="px-6 py-5 bg-slate-900/90 border-t border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Authority Action: Update Incident Lifecycle Status
                            </h4>
                            {updatingStatus && (
                                <span className="text-xs text-amber-400 flex items-center gap-1.5">
                                    <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                                    Saving status update...
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['REPORTED', 'UNDER_VERIFICATION', 'VERIFIED', 'SEARCHING', 'FOUND', 'CLOSED'].map(status => {
                                const isActive = caseData.status === status;
                                const isThisUpdating = updatingStatus === status;
                                return (
                                    <button
                                        key={status}
                                        disabled={!!updatingStatus || isActive}
                                        onClick={() => handleStatusChange(status)}
                                        className={`cursor-pointer px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5
                                            ${isActive 
                                                ? 'bg-red-600 text-white cursor-default shadow-md shadow-red-900/30' 
                                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isThisUpdating && (
                                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                        )}
                                        <span>{status.replace('_', ' ')}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CaseDetailPage;
