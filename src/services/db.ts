/**
 * IndexedDB storage engine for photos
 * Provides reliable, high-capacity client-side persistence for uploaded photos,
 * avoiding the 5MB localStorage quota limit.
 */

const DB_NAME = 'ApertureLiveDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos_blobs';

const memoryStore = new Map<string, string>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      const timeout = setTimeout(() => {
        reject(new Error('IndexedDB open timeout'));
      }, 1500);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        clearTimeout(timeout);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timeout);
        reject(request.error);
      };
      request.onblocked = () => {
        clearTimeout(timeout);
        reject(new Error('IndexedDB blocked'));
      };
    } catch (e) {
      reject(e);
    }
  });
}

export async function savePhotoBlob(id: string, dataUrl: string): Promise<void> {
  memoryStore.set(id, dataUrl);
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const req = store.put({ id, dataUrl, savedAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Saved in memory store fallback', err);
  }
}

export async function getPhotoBlob(id: string): Promise<string | null> {
  if (memoryStore.has(id)) {
    return memoryStore.get(id) || null;
  }
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, 'readonly');
      const store = transaction.objectStore(PHOTO_STORE);
      const req = store.get(id);

      req.onsuccess = () => {
        resolve(req.result ? req.result.dataUrl : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to get from IndexedDB, checking memory', err);
    return memoryStore.get(id) || null;
  }
}

export async function deletePhotoBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete from IndexedDB', err);
  }
}

export async function deletePhotoBlobsForAlbum(photoIds: string[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      photoIds.forEach((id) => store.delete(id));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Failed to batch delete from IndexedDB', err);
  }
}
