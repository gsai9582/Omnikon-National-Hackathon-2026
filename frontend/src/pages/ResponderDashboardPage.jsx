import React, { useEffect, useState } from 'react';
import { respondersAPI, tasksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useOfflineSync } from '../contexts/OfflineSyncContext';

function ResponderDashboardPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [updatingAvailability, setUpdatingAvailability] = useState(false);
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    const { subscribe } = useWebSocket();

    const loadData = async () => {
        try {
            const profileRes = await respondersAPI.getMe();
            setProfile(profileRes.data);
            
            const tasksRes = await tasksAPI.getAll();
            setTasks(tasksRes.data || []);
        } catch (error) {
            console.error('Failed to load responder data', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!subscribe) return;
        
        const sub = subscribe('/user/queue/tasks', (msg) => {
            console.log('Task update received:', msg);
            loadData(); // refresh tasks
        });

        return () => {
            if (sub) sub.unsubscribe();
        };
    }, [subscribe]);

    const handleAvailabilityChange = async (newAvailability) => {
        if (updatingAvailability || profile?.availability === newAvailability) return;
        setUpdatingAvailability(true);
        try {
            await respondersAPI.updateAvailability(profile.id, newAvailability);
            await loadData();
        } catch (e) {
            alert('Failed to update availability');
        } finally {
            setUpdatingAvailability(false);
        }
    };

    const { isOnline, queueAction } = useOfflineSync();

    const handleTaskStatusUpdate = async (taskId, newStatus) => {
        if (updatingTaskId) return;
        setUpdatingTaskId(taskId);
        try {
            if (!isOnline) {
                await queueAction('UPDATE_TASK', { taskId, status: newStatus });
                // Optimistically update UI
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
                return;
            }
            await tasksAPI.updateStatus(taskId, newStatus);
            await loadData();
        } catch (e) {
            alert(e.response?.data?.message || e.response?.data || 'Failed to update task status');
        } finally {
            setUpdatingTaskId(null);
        }
    };

    if (!profile) {
        return (
            <div className="max-w-6xl mx-auto py-16 px-4 text-center text-slate-400 flex flex-col items-center justify-center gap-3 font-sans">
                <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                <p>Loading responder profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-1">Responder Tactical Dashboard</h1>
                <p className="text-slate-400 text-sm">Manage active deployment status and field task execution</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>📡</span> Real-Time Deployment Status
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Set to "AVAILABLE" to receive high-priority search task assignments.</p>
                </div>
                <div className="flex gap-2">
                    {['AVAILABLE', 'BUSY', 'OFFLINE'].map((status) => (
                        <button
                            key={status}
                            disabled={updatingAvailability}
                            onClick={() => handleAvailabilityChange(status)}
                            className={`cursor-pointer px-4 py-2 rounded-lg font-semibold text-xs transition flex items-center gap-1.5 ${
                                profile.availability === status 
                                ? (status === 'AVAILABLE' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' : status === 'BUSY' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30' : 'bg-red-600 text-white shadow-lg shadow-red-900/30')
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            } disabled:opacity-50`}
                        >
                            {updatingAvailability && profile.availability === status && (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            <span>{status}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🎯</span> My Assigned Search Tasks
                    <span className="text-xs font-bold bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </h2>
            </div>
            
            {tasks.length === 0 ? (
                <div className="bg-slate-800 p-12 rounded-xl border border-slate-700 text-center flex flex-col items-center justify-center shadow-lg">
                    <div className="w-16 h-16 bg-slate-700/40 rounded-2xl flex items-center justify-center text-2xl mb-4 text-slate-400">
                        🛡️
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">No Active Tasks Assigned</h3>
                    <p className="text-slate-400 text-sm max-w-md">
                        Ensure your availability is set to <strong className="text-emerald-400">AVAILABLE</strong> so emergency coordinators can dispatch search missions to you.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${task.status === 'COMPLETED' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                            
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{task.title}</h3>
                                        <p className="text-xs font-mono text-amber-400 mt-0.5">{task.taskCode}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                        {task.status}
                                    </span>
                                </div>

                                <p className="text-slate-300 mb-4 text-xs leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                                    {task.description || 'No specific briefing details provided.'}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs mb-6 bg-slate-900/70 p-3.5 rounded-lg border border-slate-700">
                                    <div><span className="text-slate-400 block mb-0.5">Target Individual:</span> <span className="text-white font-semibold">{task.missingPersonName}</span></div>
                                    <div><span className="text-slate-400 block mb-0.5">Incident ID:</span> <span className="text-amber-400 font-mono">{task.missingPersonCaseId}</span></div>
                                    <div><span className="text-slate-400 block mb-0.5">Priority Level:</span> <span className="text-red-400 font-bold">{task.priority}</span></div>
                                    <div><span className="text-slate-400 block mb-0.5">Search Perimeter:</span> <span className="text-slate-200">{task.searchRadius} km</span></div>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end border-t border-slate-700 pt-4">
                                {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
                                    <button 
                                        disabled={updatingTaskId === task.id}
                                        onClick={() => handleTaskStatusUpdate(task.id, 'IN_PROGRESS')}
                                        className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-900/20"
                                    >
                                        {updatingTaskId === task.id && (
                                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                        )}
                                        <span>Start Mission Task</span>
                                    </button>
                                )}
                                {task.status === 'IN_PROGRESS' && (
                                    <button 
                                        disabled={updatingTaskId === task.id}
                                        onClick={() => handleTaskStatusUpdate(task.id, 'COMPLETED')}
                                        className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-900/20"
                                    >
                                        {updatingTaskId === task.id && (
                                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                        )}
                                        <span>Mark Completed & Secured</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ResponderDashboardPage;
