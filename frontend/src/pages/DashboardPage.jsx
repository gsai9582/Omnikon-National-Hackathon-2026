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
        closed: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const { subscribe } = useWebSocket();

    const fetchStats = async () => {
        try {
            const res = await cases.getStats();
            setStats(res.data);
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
        { label: 'Total Cases', value: stats.totalCases, color: 'bg-blue-500' },
        { label: 'Reported', value: stats.reported, color: 'bg-gray-500' },
        { label: 'Under Verification', value: stats.underVerification, color: 'bg-yellow-500' },
        { label: 'Searching', value: stats.searching, color: 'bg-purple-500' },
        { label: 'Found', value: stats.found, color: 'bg-green-500' }
    ];

    return (
        <div className="max-w-6xl mx-auto mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}</h1>
                <p className="text-gray-600">Email: {user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    Role: {user?.role}
                </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Statistics</h2>
            
            {isLoading ? (
                <div className="text-gray-500">Loading statistics...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {statCards.map((stat, idx) => (
                        <div key={idx} className={`${stat.color} text-white p-6 rounded-lg shadow-md flex flex-col justify-between`}>
                            <h3 className="text-lg font-medium opacity-90">{stat.label}</h3>
                            <p className="text-4xl font-bold mt-2">{stat.value}</p>
                        </div>
                    ))}
                    {user.role !== 'CITIZEN' && (
                        <>
                            <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 flex flex-col items-center justify-center">
                                <div className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Available Responders</div>
                                <div className="text-4xl font-bold text-teal-400">{stats.availableResponders || 0}</div>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 flex flex-col items-center justify-center">
                                <div className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Active Tasks</div>
                                <div className="text-4xl font-bold text-blue-400">{stats.activeTasks || 0}</div>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 flex flex-col items-center justify-center">
                                <div className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Tasks Completed</div>
                                <div className="text-4xl font-bold text-green-500">{stats.completedTasks || 0}</div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default DashboardPage;
