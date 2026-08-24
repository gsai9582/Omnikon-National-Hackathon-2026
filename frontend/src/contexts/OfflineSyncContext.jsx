import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services/db';
import { casesAPI, tasksAPI } from '../services/api';

export const OfflineSyncContext = createContext();

export const useOfflineSync = () => useContext(OfflineSyncContext);

export const OfflineSyncProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState(''); // 'pending', 'syncing', 'success', 'failed'

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            processSyncQueue();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (isOnline) {
            processSyncQueue();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const processSyncQueue = async () => {
        if (!navigator.onLine) return;

        const pendingItems = await db.syncQueue.where('status').equals('PENDING').toArray();
        if (pendingItems.length === 0) return;

        setSyncStatus('syncing');

        let successCount = 0;
        let failCount = 0;

        for (const item of pendingItems) {
            try {
                if (item.type === 'CREATE_CASE') {
                    const formData = new FormData();
                    formData.append('caseData', JSON.stringify(item.payload.fields));
                    if (item.payload.file) {
                        formData.append('photo', item.payload.file);
                    }
                    await casesAPI.create(formData);
                } else if (item.type === 'UPDATE_TASK') {
                    await tasksAPI.updateStatus(item.payload.taskId, item.payload.status);
                }

                await db.syncQueue.update(item.id, { status: 'COMPLETED' });
                successCount++;
            } catch (error) {
                console.error('Failed to sync item:', item, error);
                failCount++;
            }
        }

        if (failCount > 0) {
            setSyncStatus('failed');
        } else if (successCount > 0) {
            setSyncStatus('success');
            setTimeout(() => setSyncStatus(''), 3000);
        } else {
            setSyncStatus('');
        }
    };

    const queueAction = async (type, payload, idempotencyKey = null) => {
        await db.syncQueue.add({
            type,
            payload,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            idempotencyKey
        });
        
        if (isOnline) {
            processSyncQueue();
        } else {
            setSyncStatus('pending');
        }
    };

    return (
        <OfflineSyncContext.Provider value={{ isOnline, syncStatus, queueAction, processSyncQueue }}>
            {children}
            
            {/* Global Sync Banner */}
            {!isOnline && (
                <div className="fixed bottom-0 w-full bg-slate-900 border-t border-amber-500 text-amber-500 p-2 text-center text-sm z-50">
                    Offline — operations will be saved locally
                </div>
            )}
            {isOnline && syncStatus === 'pending' && (
                <div className="fixed bottom-0 w-full bg-slate-800 border-t border-blue-500 text-blue-400 p-2 text-center text-sm z-50">
                    Sync pending...
                </div>
            )}
            {isOnline && syncStatus === 'syncing' && (
                <div className="fixed bottom-0 w-full bg-blue-900 border-t border-blue-500 text-blue-200 p-2 text-center text-sm z-50">
                    Syncing...
                </div>
            )}
            {isOnline && syncStatus === 'success' && (
                <div className="fixed bottom-0 w-full bg-emerald-900 border-t border-emerald-500 text-emerald-200 p-2 text-center text-sm z-50">
                    Synced successfully
                </div>
            )}
            {isOnline && syncStatus === 'failed' && (
                <div className="fixed bottom-0 w-full bg-rose-900 border-t border-rose-500 text-rose-200 p-2 text-center text-sm z-50 flex justify-center items-center gap-4">
                    <span>Sync failed — please try again</span>
                    <button onClick={processSyncQueue} className="bg-rose-700 hover:bg-rose-600 px-3 py-1 rounded text-white font-bold">Retry</button>
                </div>
            )}
        </OfflineSyncContext.Provider>
    );
};
