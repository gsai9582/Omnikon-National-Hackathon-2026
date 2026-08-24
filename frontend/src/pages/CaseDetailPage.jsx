import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { casesAPI as cases } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CaseDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [caseData, setCaseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchCase();
    }, [id]);

    const fetchCase = async () => {
        try {
            const res = await cases.getById(id);
            setCaseData(res.data);
        } catch (err) {
            setError('Failed to load case details or you do not have permission.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        try {
            const res = await cases.updateStatus(id, newStatus);
            setCaseData(res.data);
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
    if (!caseData) return null;

    const canUpdateStatus = user && (user.role === 'ADMIN' || user.role === 'AUTHORITY');

    return (
        <div className="max-w-4xl mx-auto mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Case Information
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {caseData.caseId}
                    </p>
                </div>
                <div>
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {caseData.status.replace('_', ' ')}
                    </span>
                </div>
            </div>
            <div className="px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                    
                    {caseData.photoUrl && (
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Photo</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <img src={`http://localhost:8080${caseData.photoUrl}`} alt={caseData.fullName} className="max-w-xs rounded-md shadow-sm" />
                            </dd>
                        </div>
                    )}

                    {caseData.priorityCategory && (
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-yellow-50/50">
                            <dt className="text-sm font-medium text-gray-700">Prototype Priority Score</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                        caseData.priorityCategory === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' :
                                        caseData.priorityCategory === 'MEDIUM' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                        'bg-blue-100 text-blue-700 border border-blue-200'
                                    }`}>
                                        {caseData.priorityCategory} ({caseData.priorityScore})
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mb-2 italic">
                                    "Prototype priority score. Configurable decision-support model. Not a scientifically validated risk prediction."
                                </div>
                                {caseData.priorityExplanation && caseData.priorityExplanation.length > 0 && (
                                    <ul className="list-disc list-inside text-xs text-gray-600">
                                        {caseData.priorityExplanation.map((expl, idx) => (
                                            <li key={idx}>{expl}</li>
                                        ))}
                                    </ul>
                                )}
                            </dd>
                        </div>
                    )}

                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Full name</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{caseData.fullName}</dd>
                    </div>
                    
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Age & Gender</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {caseData.age ? `${caseData.age} years old, ` : ''} {caseData.gender}
                        </dd>
                    </div>

                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{caseData.description || 'N/A'}</dd>
                    </div>

                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Last Seen Date & Time</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {caseData.lastSeenDateTime ? new Date(caseData.lastSeenDateTime).toLocaleString() : 'N/A'}
                        </dd>
                    </div>

                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Last Seen Address</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {caseData.lastSeenAddress || 'N/A'} 
                            {caseData.latitude && caseData.longitude && ` (Lat: ${caseData.latitude}, Lng: ${caseData.longitude})`}
                        </dd>
                    </div>

                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Reported By</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {caseData.createdByName} on {new Date(caseData.createdAt).toLocaleDateString()}
                        </dd>
                    </div>

                </dl>
            </div>

            {canUpdateStatus && (
                <div className="px-4 py-5 bg-gray-50 border-t border-gray-200 sm:px-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Update Status (Authority/Admin Only)</h4>
                    <div className="flex flex-wrap gap-2">
                        {['REPORTED', 'UNDER_VERIFICATION', 'VERIFIED', 'SEARCHING', 'FOUND', 'CLOSED'].map(status => (
                            <button
                                key={status}
                                disabled={isUpdating || caseData.status === status}
                                onClick={() => handleStatusChange(status)}
                                className={`px-3 py-1.5 rounded text-sm font-medium 
                                    ${caseData.status === status 
                                        ? 'bg-blue-600 text-white cursor-default' 
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    } disabled:opacity-50`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CaseDetailPage;
