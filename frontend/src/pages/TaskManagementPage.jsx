import React, { useEffect, useState } from 'react';
import { casesAPI, respondersAPI, tasksAPI } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';

function TaskManagementPage() {
    const [cases, setCases] = useState([]);
    const [responders, setResponders] = useState([]);
    const [tasks, setTasks] = useState([]);
    
    // Form state
    const [selectedCase, setSelectedCase] = useState('');
    const [selectedResponder, setSelectedResponder] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('HIGH');
    const [searchRadius, setSearchRadius] = useState(2.0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taskSuccess, setTaskSuccess] = useState('');
    const [taskError, setTaskError] = useState('');

    const { subscribe } = useWebSocket();

    const loadData = async () => {
        try {
            // Load searchable cases
            const searchCases = await casesAPI.getAll({ status: 'SEARCHING' });
            const verifiedCases = await casesAPI.getAll({ status: 'VERIFIED' });
            setCases([...searchCases.data.content, ...verifiedCases.data.content]);

            // Load available responders
            const resResponders = await respondersAPI.getAll();
            setResponders(resResponders.data.filter(r => r.availability === 'AVAILABLE'));

            // Load active tasks
            const resTasks = await tasksAPI.getAll();
            setTasks(resTasks.data || []);
        } catch (error) {
            console.error('Failed to load coordination data', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!subscribe) return;
        
        const subTasks = subscribe('/topic/tasks', () => loadData());
        const subResponders = subscribe('/topic/responders', () => loadData());
        const subCases = subscribe('/topic/cases', () => loadData());

        return () => {
            if (subTasks) subTasks.unsubscribe();
            if (subResponders) subResponders.unsubscribe();
            if (subCases) subCases.unsubscribe();
        };
    }, [subscribe]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!selectedCase || !title.trim()) {
            setTaskError('Please select a target case and specify a task title.');
            return;
        }

        setIsSubmitting(true);
        setTaskError('');
        setTaskSuccess('');

        try {
            await tasksAPI.create({
                missingPersonId: selectedCase,
                assignedResponderId: selectedResponder || null,
                title: title.trim(),
                description: description.trim(),
                priority,
                searchRadius: parseFloat(searchRadius)
            });
            // Reset form
            setSelectedCase('');
            setSelectedResponder('');
            setTitle('');
            setDescription('');
            setTaskSuccess('Search task created and dispatched successfully!');
            await loadData();
            setTimeout(() => setTaskSuccess(''), 4000);
        } catch (err) {
            setTaskError(err.response?.data?.message || err.response?.data?.error || 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Search Task Coordination</h1>
                <p className="text-sm text-slate-400 mt-1">Dispatch tactical grid search tasks to available field responders</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Task Form */}
                <div className="lg:col-span-1 bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 h-fit">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>🎯</span> Create Search Task
                    </h2>

                    {taskError && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{taskError}</span>
                        </div>
                    )}

                    {taskSuccess && (
                        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2">
                            <span>✅</span>
                            <span>{taskSuccess}</span>
                        </div>
                    )}

                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Target Case *</label>
                            <select 
                                required
                                disabled={isSubmitting}
                                value={selectedCase}
                                onChange={(e) => setSelectedCase(e.target.value)}
                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-60"
                            >
                                <option value="">Select an active case...</option>
                                {cases.map(c => (
                                    <option key={c.id} value={c.id}>{c.caseId} - {c.fullName} ({c.status})</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Task Title *</label>
                            <input 
                                required
                                type="text"
                                disabled={isSubmitting}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. North Sector 2km Perimeter Search"
                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Tactical Briefing / Description</label>
                            <textarea 
                                disabled={isSubmitting}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Key search points, shelter locations, last observed bearings..."
                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 h-24 disabled:opacity-60"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Priority</label>
                                <select 
                                    disabled={isSubmitting}
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-60"
                                >
                                    <option value="HIGH">HIGH</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="LOW">LOW</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Radius (km)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    min="0.1"
                                    max="50"
                                    disabled={isSubmitting}
                                    value={searchRadius}
                                    onChange={(e) => setSearchRadius(e.target.value)}
                                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Assign Responder</label>
                            <select 
                                disabled={isSubmitting}
                                value={selectedResponder}
                                onChange={(e) => setSelectedResponder(e.target.value)}
                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-60"
                            >
                                <option value="">Leave Unassigned (Open Pool)</option>
                                {responders.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} ({r.availability})</option>
                                ))}
                            </select>
                            {responders.length === 0 && (
                                <p className="text-[11px] text-amber-400 mt-1">No active responders currently marked "AVAILABLE".</p>
                            )}
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-lg shadow-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Dispatching Task...</span>
                                </>
                            ) : (
                                'Dispatch Search Task'
                            )}
                        </button>
                    </form>
                </div>

                {/* Task List */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>📋</span> All Assigned & Open Tasks
                            <span className="text-xs font-bold bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
                                {tasks.length}
                            </span>
                        </h2>
                    </div>

                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 border-b border-slate-700">
                                    <tr>
                                        <th className="p-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Code</th>
                                        <th className="p-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Title</th>
                                        <th className="p-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Case</th>
                                        <th className="p-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Responder</th>
                                        <th className="p-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {tasks.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center text-slate-400">
                                                <div className="w-12 h-12 bg-slate-700/40 rounded-full flex items-center justify-center text-xl mx-auto mb-3 text-slate-400">
                                                    📌
                                                </div>
                                                <p className="text-slate-300 font-medium text-sm">No tasks dispatched yet</p>
                                                <p className="text-slate-500 text-xs mt-1">Select a verified case on the left to assign tasks to responders.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        tasks.map(t => (
                                            <tr key={t.id} className="hover:bg-slate-700/30 transition">
                                                <td className="p-3.5 text-amber-400 text-xs font-mono font-bold">{t.taskCode}</td>
                                                <td className="p-3.5 text-white text-sm font-medium">{t.title}</td>
                                                <td className="p-3.5 text-slate-300 text-xs font-mono">{t.missingPersonCaseId}</td>
                                                <td className="p-3.5 text-slate-300 text-xs">{t.assignedResponderName || <span className="text-slate-500 italic">Unassigned</span>}</td>
                                                <td className="p-3.5">
                                                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                                        t.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                                        t.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                                                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    }`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskManagementPage;
