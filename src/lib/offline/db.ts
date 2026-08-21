import type { QueuedAction } from './types';

const DB_NAME = 'nakamacar-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-actions';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const request = fn(tx.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export function putAction(action: QueuedAction): Promise<void> {
  return withStore('readwrite', (store) => store.put(action)).then(() => undefined);
}

export function getAllActions(): Promise<QueuedAction[]> {
  return withStore('readonly', (store) => store.getAll());
}

export function deleteAction(id: string): Promise<void> {
  return withStore('readwrite', (store) => store.delete(id)).then(() => undefined);
}
