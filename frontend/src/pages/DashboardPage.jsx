import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { casesAPI as cases } from '../services/api';

function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalCases: 0,
        reported: 0,
        underVerification: 0,
        searching: 0,
        found: 0,
        closed: 0,
        availableResponders: 0,
        activeTasks: 0,
        completedTasks: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const { subscribe } = useWebSocket();

    const fetchStats = async () => {
        try {
            const res = await cases.getStats();
            setStats(res.data || {});
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (!subscribe) return;
        
        const sub = subscribe('/topic/stats', () => {
            fetchStats();
        });

        return () => {
            if (sub) sub.unsubscribe();
        };
    }, [subscribe]);

    const statCards = [
        { label: 'Total Incidents', value: stats.totalCases || 0, color: 'border-blue-500/40 bg-blue-500/10 text-blue-400', icon: '📁' },
        { label: 'Reported', value: stats.reported || 0, color: 'border-slate-600 bg-slate-800/80 text-slate-300', icon: '📝' },
        { label: 'Under Verification', value: stats.underVerification || 0, color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400', icon: '⏳' },
        { label: 'Active Search', value: stats.searching || 0, color: 'border-purple-500/40 bg-purple-500/10 text-purple-400', icon: '🔍' },
        { label: 'Persons Found', value: stats.found || 0, color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400', icon: '✅' }
    ];

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
            {/* User Welcome Banner */}
            <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name || 'Authorized Responder'}</h1>
                    </div>
                    <p className="text-slate-400 text-sm">{user?.email}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider">
                            Role: {user?.role || 'AUTHENTICATED'}
                        </span>
                        <span className="px-3 py-1 bg-slate-700/60 text-slate-300 rounded-full text-xs font-medium">
                            Status: Online & Connected
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link to="/report" className="cursor-pointer bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-lg shadow-red-900/30 flex items-center gap-2">
                        <span>🚨</span> Report Incident
                    </Link>
                    <Link to="/map" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2.5 rounded-lg text-xs transition flex items-center gap-2 border border-slate-600">
                        <span>🗺️</span> Live Map
                    </Link>
                    <Link to="/cases" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2.5 rounded-lg text-xs transition flex items-center gap-2 border border-slate-600">
                        <span>📋</span> Case Directory
                    </Link>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📊</span> Incident Operations & Metrics
                </h2>
                <span className="text-xs text-slate-400">Live WebSocket Sync</span>
            </div>
            
            {isLoading ? (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                    <p>Loading real-time statistics...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {statCards.map((stat, idx) => (
                            <div key={idx} className={`p-5 rounded-xl border shadow-lg flex flex-col justify-between ${stat.color}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.label}</span>
                                    <span className="text-lg">{stat.icon}</span>
                                </div>
                                <p className="text-3xl font-extrabold mt-1">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {user?.role !== 'CITIZEN' && (
                        <div className="pt-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Field Coordination & Tactical Readiness
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Field Responders</div>
                                        <div className="text-3xl font-bold text-teal-400 mt-1">{stats.availableResponders || 0}</div>
                                    </div>
                                    <span className="text-3xl text-teal-400/30">👥</span>
                                </div>
                                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Search Tasks</div>
                                        <div className="text-3xl font-bold text-blue-400 mt-1">{stats.activeTasks || 0}</div>
                                    </div>
                                    <span className="text-3xl text-blue-400/30">🎯</span>
                                </div>
                                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasks Completed & Resolved</div>
                                        <div className="text-3xl font-bold text-emerald-400 mt-1">{stats.completedTasks || 0}</div>
                                    </div>
                                    <span className="text-3xl text-emerald-400/30">🏆</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DashboardPage;
