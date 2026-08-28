import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { casesAPI as cases } from '../services/api';

function CaseListPage() {
    const [caseList, setCaseList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [nameFilter, setNameFilter] = useState('');

    useEffect(() => {
        fetchCases();
    }, [statusFilter]);

    const fetchCases = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (nameFilter) params.name = nameFilter;
            
            const res = await cases.getAll(params);
            setCaseList(res.data.content || []);
        } catch (error) {
            console.error('Error fetching cases', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCases();
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'REPORTED': return 'bg-gray-100 text-gray-800';
            case 'UNDER_VERIFICATION': return 'bg-yellow-100 text-yellow-800';
            case 'VERIFIED': return 'bg-blue-100 text-blue-800';
            case 'SEARCHING': return 'bg-purple-100 text-purple-800';
            case 'FOUND': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-gray-800 text-white';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleResetFilters = () => {
        setNameFilter('');
        setStatusFilter('');
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Missing Persons Incidents</h1>
                    <p className="text-sm text-slate-400 mt-1">Real-time incident directory and verification tracking</p>
                </div>
                <Link to="/report" className="cursor-pointer bg-red-600 hover:bg-red-500 text-white font-medium px-5 py-2.5 rounded-lg transition shadow-lg shadow-red-900/20 flex items-center gap-2">
                    <span>➕</span>
                    <span>Report a Case</span>
                </Link>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <input 
                        type="text" 
                        placeholder="Search by full name or keywords..." 
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 flex-grow focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    >
                        <option value="">All Incident Statuses</option>
                        <option value="REPORTED">Reported</option>
                        <option value="UNDER_VERIFICATION">Under Verification</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="SEARCHING">Searching</option>
                        <option value="FOUND">Found</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <button type="submit" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
                        <span>🔍</span>
                        <span>Search</span>
                    </button>
                    {(nameFilter || statusFilter) && (
                        <button 
                            type="button" 
                            onClick={handleResetFilters} 
                            className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-2.5 rounded-lg border border-slate-700 text-sm transition"
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {isLoading ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                    <p>Loading incident records...</p>
                </div>
            ) : caseList.length === 0 ? (
                <div className="bg-slate-800 p-12 rounded-xl border border-slate-700 text-center flex flex-col items-center justify-center shadow-lg">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center text-3xl mb-4 text-slate-400">
                        🔍
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Cases Found</h3>
                    <p className="text-slate-400 text-sm max-w-md mb-6">
                        {nameFilter || statusFilter 
                            ? 'No incident reports match your active search filters. Try clearing your filters or changing the query.'
                            : 'There are currently no active missing person cases recorded in the system.'}
                    </p>
                    <div className="flex gap-3">
                        {(nameFilter || statusFilter) && (
                            <button
                                onClick={handleResetFilters}
                                className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition"
                            >
                                Reset Search Filters
                            </button>
                        )}
                        <Link
                            to="/report"
                            className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg text-sm transition"
                        >
                            Report a Missing Person
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800 shadow-xl rounded-xl border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-900">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Case ID</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Reported On</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50 bg-slate-800">
                                {caseList.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-700/30 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-amber-400">
                                            <Link to={`/cases/${c.id}`} className="hover:underline">{c.caseId}</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{c.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(c.status)}`}>
                                                {c.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                            <Link to={`/cases/${c.id}`} className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
                                                View Details →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CaseListPage;
