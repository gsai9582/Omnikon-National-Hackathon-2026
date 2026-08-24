import Dexie from 'dexie';

export const db = new Dexie('ResQTraceDB');

db.version(1).stores({
    syncQueue: '++id, type, status, createdAt, idempotencyKey'
});
