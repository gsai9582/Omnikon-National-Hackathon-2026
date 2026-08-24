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
            setTasks(resTasks.data);
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
        try {
            await tasksAPI.create({
                missingPersonId: selectedCase,
                assignedResponderId: selectedResponder || null,
                title,
                description,
                priority,
                searchRadius: parseFloat(searchRadius)
            });
            // Reset form
            setSelectedCase('');
            setSelectedResponder('');
            setTitle('');
            setDescription('');
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create task');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-white mb-8">Task Coordination</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Task Form */}
                <div className="lg:col-span-1 bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4">Create Search Task</h2>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Target Case *</label>
                            <select 
                                required
                                value={selectedCase}
                                onChange={(e) => setSelectedCase(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-red-500"
                            >
                                <option value="">Select a Case...</option>
                                {cases.map(c => (
                                    <option key={c.id} value={c.id}>{c.caseId} - {c.fullName}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Task Title *</label>
                            <input 
                                required
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. North Sector Grid Search"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-red-500 h-24"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                                <select 
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-red-500"
                                >
                                    <option value="HIGH">HIGH</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="LOW">LOW</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Radius (km)</label>
                                <input 
                                    type="number" step="0.1"
                                    value={searchRadius}
                                    onChange={(e) => setSearchRadius(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Assign Responder</label>
                            <select 
                                value={selectedResponder}
                                onChange={(e) => setSelectedResponder(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-red-500"
                            >
                                <option value="">Leave Unassigned</option>
                                {responders.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} ({r.availability})</option>
                                ))}
                            </select>
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition shadow"
                        >
                            Create & Assign Task
                        </button>
                    </form>
                </div>

                {/* Task List */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-4">All Tasks</h2>
                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 border-b border-slate-700">
                                <tr>
                                    <th className="p-3 text-slate-300 font-medium text-sm">Code</th>
                                    <th className="p-3 text-slate-300 font-medium text-sm">Title</th>
                                    <th className="p-3 text-slate-300 font-medium text-sm">Case</th>
                                    <th className="p-3 text-slate-300 font-medium text-sm">Responder</th>
                                    <th className="p-3 text-slate-300 font-medium text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {tasks.length === 0 ? (
                                    <tr><td colSpan="5" className="p-6 text-center text-slate-400 italic">No tasks created yet.</td></tr>
                                ) : (
                                    tasks.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-700/30 transition">
                                            <td className="p-3 text-slate-300 text-sm font-mono">{t.taskCode}</td>
                                            <td className="p-3 text-white text-sm">{t.title}</td>
                                            <td className="p-3 text-slate-400 text-sm">{t.missingPersonCaseId}</td>
                                            <td className="p-3 text-slate-400 text-sm">{t.assignedResponderName || '-'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-bold rounded ${t.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : t.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
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
    );
}

export default TaskManagementPage;
