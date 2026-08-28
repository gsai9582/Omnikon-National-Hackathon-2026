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
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationNotice, setLocationNotice] = useState(null);
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
        const file = e.target.files[0];
        if (!file) return;

        // Max 5MB check
        if (file.size > 5 * 1024 * 1024) {
            setError('Photo file size exceeds the 5MB limit. Please choose a smaller image.');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image (JPEG, PNG, or WEBP).');
            return;
        }

        setError('');
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleRemovePhoto = () => {
        setPhoto(null);
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
            setPhotoPreview(null);
        }
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setLocationNotice({
                type: 'error',
                message: 'Geolocation is not supported by your browser. Please enter coordinates or address manually.'
            });
            return;
        }

        setIsLocating(true);
        setLocationNotice(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                }));
                setIsLocating(false);
                setLocationNotice({
                    type: 'success',
                    message: `Location detected accurately (Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)})`
                });
            },
            (err) => {
                setIsLocating(false);
                let message = 'Location access failed. Please enter the last seen address or coordinates manually.';
                if (err.code === 1) {
                    message = 'Location permission denied. Please enter the address or coordinates manually below.';
                } else if (err.code === 3) {
                    message = 'Location request timed out. Please enter the details manually.';
                }
                setLocationNotice({ type: 'warning', message });
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!formData.fullName.trim()) {
            setError('Full Name is required');
            return;
        }

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
                setTimeout(() => navigate('/cases'), 2500);
            } else {
                // Online processing
                const data = new FormData();
                data.append('caseData', JSON.stringify({
                    ...formData,
                    fullName: formData.fullName.trim(),
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
                setTimeout(() => navigate('/cases'), 2500);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to report case. Please verify the information.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto my-8 bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-700 font-sans">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                <div>
                    <h2 className="text-2xl font-bold text-amber-500">Report a Missing Person</h2>
                    <p className="text-sm text-slate-400 mt-1">Submit high-priority incident details for rapid mobilization</p>
                </div>
                <span className="text-2xl">🚨</span>
            </div>
            
            {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {successId && (
                <div className="mb-6 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 p-4 rounded-lg">
                    <div className="font-bold flex items-center gap-2">
                        <span>✅</span>
                        <span>
                            {successId === 'OFFLINE_PENDING' 
                                ? 'Report saved locally in offline sync queue! It will upload automatically once online.'
                                : `Case reported successfully! Incident ID: ${successId}`}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Redirecting to active cases list...</p>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
                        <input 
                            type="text" 
                            name="fullName" 
                            required 
                            disabled={isSubmitting}
                            value={formData.fullName} 
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:opacity-60" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                        <input 
                            type="number" 
                            name="age" 
                            min="0"
                            max="130"
                            disabled={isSubmitting}
                            value={formData.age} 
                            onChange={handleChange}
                            placeholder="e.g. 34"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:opacity-60" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Gender *</label>
                        <select 
                            name="gender" 
                            required 
                            disabled={isSubmitting}
                            value={formData.gender} 
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:opacity-60"
                        >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Last Seen Date & Time</label>
                        <input 
                            type="datetime-local" 
                            name="lastSeenDateTime" 
                            disabled={isSubmitting}
                            value={formData.lastSeenDateTime} 
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:opacity-60" 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description & Identifying Features</label>
                    <textarea 
                        name="description" 
                        rows="3" 
                        disabled={isSubmitting}
                        value={formData.description} 
                        onChange={handleChange}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:opacity-60"
                        placeholder="Physical appearance, clothing, identifying marks, glasses, tattoos..."
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-slate-300">Last Seen Address / Landmark</label>
                        <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={isLocating || isSubmitting}
                            className="cursor-pointer text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                            {isLocating ? (
                                <>
                                    <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                                    <span>Detecting GPS...</span>
                                </>
                            ) : (
                                <>
                                    <span>📍</span>
                                    <span>Use Current GPS Location</span>
                                </>
                            )}
                        </button>
                    </div>
                    <input 
                        type="text" 
                        name="lastSeenAddress" 
                        disabled={isSubmitting}
                        value={formData.lastSeenAddress} 
                        onChange={handleChange}
                        placeholder="e.g. Near Central Metro Station, Gate 2"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:opacity-60" 
                    />
                </div>

                {locationNotice && (
                    <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        locationNotice.type === 'success' 
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                            : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                    }`}>
                        <span>{locationNotice.type === 'success' ? '📍' : 'ℹ️'}</span>
                        <span>{locationNotice.message}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Latitude (Optional)</label>
                        <input 
                            type="number" 
                            step="any" 
                            name="latitude" 
                            disabled={isSubmitting}
                            value={formData.latitude} 
                            onChange={handleChange}
                            placeholder="e.g. 40.7128"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:opacity-60" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Longitude (Optional)</label>
                        <input
                            type="number"
                            step="any"
                            name="longitude"
                            disabled={isSubmitting}
                            value={formData.longitude}
                            onChange={handleChange}
                            placeholder="e.g. -74.0060"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:opacity-60"
                        />
                    </div>
                </div>

                <div className="flex items-center bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60">
                    <input
                        type="checkbox"
                        id="needsMedicalAttention"
                        name="needsMedicalAttention"
                        disabled={isSubmitting}
                        checked={formData.needsMedicalAttention || false}
                        onChange={(e) => setFormData({...formData, needsMedicalAttention: e.target.checked})}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-700 rounded bg-slate-800 cursor-pointer"
                    />
                    <label htmlFor="needsMedicalAttention" className="ml-3 block text-sm font-medium text-red-400 cursor-pointer">
                        Requires Immediate Medical Attention / High Vulnerability
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Photo Identification</label>
                    <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp" 
                        disabled={isSubmitting}
                        onChange={handlePhotoChange}
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600 file:cursor-pointer" 
                    />
                    <p className="mt-1 text-xs text-slate-500">Supported formats: JPEG, PNG, WEBP. Max file size: 5MB.</p>

                    {photoPreview && (
                        <div className="mt-3 flex items-center gap-4 p-3 bg-slate-900/80 border border-slate-700 rounded-lg">
                            <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-slate-700" />
                            <div className="flex-1">
                                <p className="text-xs text-slate-300 font-medium">{photo?.name}</p>
                                <p className="text-xs text-slate-500">{(photo?.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="cursor-pointer text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded transition"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="cursor-pointer w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Submitting Incident Report...</span>
                            </>
                        ) : (
                            'Submit Official Report'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReportMissingPersonPage;
