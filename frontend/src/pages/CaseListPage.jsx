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

    return (
        <div className="max-w-6xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Missing Persons Cases</h1>
                <Link to="/report" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Report a Case
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <input 
                        type="text" 
                        placeholder="Search by name..." 
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="border border-gray-300 rounded p-2 flex-grow"
                    />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded p-2"
                    >
                        <option value="">All Statuses</option>
                        <option value="REPORTED">Reported</option>
                        <option value="UNDER_VERIFICATION">Under Verification</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="SEARCHING">Searching</option>
                        <option value="FOUND">Found</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
                        Search
                    </button>
                </form>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading cases...</div>
            ) : caseList.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    No cases found matching your criteria.
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported On</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {caseList.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                        <Link to={`/cases/${c.id}`}>{c.caseId}</Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(c.status)}`}>
                                            {c.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link to={`/cases/${c.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CaseListPage;
