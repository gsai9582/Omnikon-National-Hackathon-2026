import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { casesAPI } from '../services/api';
import { useOfflineSync } from '../contexts/OfflineSyncContext';
import { v4 as uuidv4 } from 'uuid';

function ReportMissingPersonPage() {
    const navigate = useNavigate();
    const { isOnline, queueAction } = useOfflineSync();
    
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: 'MALE',
        description: '',
        lastSeenDateTime: '',
        lastSeenAddress: '',
        latitude: '',
        longitude: '',
        needsMedicalAttention: false
    });
    
    const [photo, setPhoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successId, setSuccessId] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const idempotencyKey = uuidv4();
            
            if (!isOnline) {
                // Queue for offline processing
                await queueAction('CREATE_CASE', {
                    fields: { ...formData, idempotencyKey },
                    file: photo
                }, idempotencyKey);
                
                setSuccessId('OFFLINE_PENDING');
                setTimeout(() => navigate('/cases'), 3000);
            } else {
                // Online processing
                const data = new FormData();
                data.append('caseData', JSON.stringify({
                    ...formData,
                    idempotencyKey,
                    age: formData.age ? parseInt(formData.age, 10) : null,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : null
                }));
                
                if (photo) {
                    data.append('photo', photo);
                }

                const response = await casesAPI.create(data);
                setSuccessId(response.data.caseId);
                setTimeout(() => navigate('/cases'), 3000);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to report case.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 bg-slate-800 p-8 rounded-lg shadow-md border border-slate-700">
            <h2 className="text-2xl font-bold text-amber-500 mb-6">Report a Missing Person</h2>
            
            {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">{error}</div>}
            {successId && (
                <div className="mb-4 bg-emerald-900 border border-emerald-500 text-emerald-300 p-4 rounded">
                    {successId === 'OFFLINE_PENDING' 
                        ? 'Report saved locally! It will automatically sync when you are online.'
                        : `Case reported successfully! Case ID: ${successId}`}
                    <br />Redirecting to cases...
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                        <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
                               className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange}
                               className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender *</label>
                        <select name="gender" required value={formData.gender} onChange={handleChange}
                                className="mt-1 w-full border border-gray-300 rounded-md p-2">
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Seen Date & Time</label>
                        <input type="datetime-local" name="lastSeenDateTime" value={formData.lastSeenDateTime} onChange={handleChange}
                               className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" rows="3" value={formData.description} onChange={handleChange}
                              className="mt-1 w-full border border-gray-300 rounded-md p-2"
                              placeholder="Physical appearance, clothing, identifying marks..."></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Seen Address</label>
                    <input type="text" name="lastSeenAddress" value={formData.lastSeenAddress} onChange={handleChange}
                           className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange}
                               className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Longitude</label>
                        <input
                            type="number"
                            step="any"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md bg-slate-800 border-slate-600 text-slate-100 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="needsMedicalAttention"
                        checked={formData.needsMedicalAttention || false}
                        onChange={(e) => setFormData({...formData, needsMedicalAttention: e.target.checked})}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-600 rounded bg-slate-800"
                    />
                    <label className="ml-2 block text-sm text-slate-300">
                        Requires Immediate Medical Attention
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300">Photo</label>
                    <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handlePhotoChange}
                           className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    <p className="mt-1 text-xs text-gray-500">Max size 5MB. JPEG, PNG, WEBP.</p>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReportMissingPersonPage;
