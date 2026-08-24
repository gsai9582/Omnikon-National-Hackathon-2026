import React, { useEffect, useState } from 'react';
import { respondersAPI, tasksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useOfflineSync } from '../contexts/OfflineSyncContext';

function ResponderDashboardPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [tasks, setTasks] = useState([]);

    const { subscribe } = useWebSocket();

    const loadData = async () => {
        try {
            const profileRes = await respondersAPI.getMe();
            setProfile(profileRes.data);
            
            const tasksRes = await tasksAPI.getAll();
            setTasks(tasksRes.data);
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
        try {
            await respondersAPI.updateAvailability(profile.id, newAvailability);
            loadData();
        } catch (e) {
            alert('Failed to update availability');
        }
    };

    const { isOnline, queueAction } = useOfflineSync();

    const handleTaskStatusUpdate = async (taskId, newStatus) => {
        try {
            if (!isOnline) {
                await queueAction('UPDATE_TASK', { taskId, status: newStatus });
                // Optimistically update UI
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
                return;
            }
            await tasksAPI.updateStatus(taskId, newStatus);
            loadData();
        } catch (e) {
            alert(e.response?.data || 'Failed to update task status');
        }
    };

    if (!profile) return <div className="p-8 text-white">Loading profile...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-white mb-2">Responder Dashboard</h1>
            <p className="text-slate-400 mb-8">Manage your availability and assigned tasks.</p>

            <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-200">Current Availability</h2>
                    <p className="text-sm text-slate-400">Update your status so authorities can assign tasks.</p>
                </div>
                <div className="flex gap-2">
                    {['AVAILABLE', 'BUSY', 'OFFLINE'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleAvailabilityChange(status)}
                            className={`px-4 py-2 rounded font-medium transition ${
                                profile.availability === status 
                                ? (status === 'AVAILABLE' ? 'bg-green-600 text-white' : status === 'BUSY' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white')
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">My Assigned Tasks</h2>
            
            {tasks.length === 0 ? (
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center text-slate-400 italic">
                    You have no assigned tasks. Ensure your status is "AVAILABLE".
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-md relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${task.status === 'COMPLETED' ? 'bg-green-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-200">{task.title}</h3>
                                    <p className="text-sm text-slate-400">{task.taskCode}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                    {task.status}
                                </span>
                            </div>

                            <p className="text-slate-300 mb-4 text-sm">{task.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-slate-900/50 p-3 rounded">
                                <div><span className="text-slate-500">Target:</span> <span className="text-slate-300">{task.missingPersonName}</span></div>
                                <div><span className="text-slate-500">Case ID:</span> <span className="text-slate-300">{task.missingPersonCaseId}</span></div>
                                <div><span className="text-slate-500">Priority:</span> <span className="text-red-400">{task.priority}</span></div>
                                <div><span className="text-slate-500">Radius:</span> <span className="text-slate-300">{task.searchRadius} km</span></div>
                            </div>

                            <div className="flex gap-2 justify-end border-t border-slate-700 pt-4">
                                {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
                                    <button 
                                        onClick={() => handleTaskStatusUpdate(task.id, 'IN_PROGRESS')}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm transition"
                                    >
                                        Start Task
                                    </button>
                                )}
                                {task.status === 'IN_PROGRESS' && (
                                    <button 
                                        onClick={() => handleTaskStatusUpdate(task.id, 'COMPLETED')}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm transition"
                                    >
                                        Mark Completed
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
