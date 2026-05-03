import { createDefaultAppData, hydrateAppData } from "../model/types";
import type { AppData } from "../model/types";

const DB_NAME = "breathe-remake";
const DB_VERSION = 1;
const STORE_NAME = "app";
const STATE_KEY = "singleton";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAppData(): Promise<AppData> {
  try {
    const db = await openDatabase();
    const result = await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(STATE_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return hydrateAppData(result);
  } catch {
    return createDefaultAppData();
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).put(data, STATE_KEY);
  });
  db.close();
}

