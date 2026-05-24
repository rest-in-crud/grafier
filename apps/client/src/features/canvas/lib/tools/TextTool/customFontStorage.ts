import { create } from 'zustand';

export type StoredFont = { id: string; family: string; fileName: string };

type FontRecord = StoredFont & { data: ArrayBuffer; addedAt: number };

type CustomFontState = {
  families: string[];
  _set: (families: string[]) => void;
};

export const useCustomFontStore = create<CustomFontState>((set) => ({
  families: [],
  _set: (families) => set({ families }),
}));

const DB_NAME = 'grafier-fonts';
const STORE_NAME = 'fonts';
export const MAX_FONT_FILE_SIZE = 5 * 1024 * 1024;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txGet<T>(db: IDBDatabase, id: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

function txGetAll<T>(db: IDBDatabase): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

function txPut(db: IDBDatabase, record: FontRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function txDelete(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function familyFromFileName(fileName: string): string {
  return fileName.replace(/\.(ttf|otf)$/i, '').replace(/[-_]+/g, ' ');
}

async function registerFontFace(family: string, data: ArrayBuffer): Promise<void> {
  const font = new FontFace(family, data);
  await font.load();
  document.fonts.add(font);
}

export async function loadAllCustomFonts(): Promise<void> {
  const db = await openDb();
  const records = await txGetAll<FontRecord>(db);
  await Promise.all(records.map((r) => registerFontFace(r.family, r.data)));
  useCustomFontStore.getState()._set(records.map((r) => r.family));
}

export async function saveCustomFont(file: File): Promise<StoredFont> {
  if (file.size > MAX_FONT_FILE_SIZE) {
    throw new Error('Font file exceeds 5 MB limit');
  }
  const data = await file.arrayBuffer();
  const family = familyFromFileName(file.name);
  const id = crypto.randomUUID();
  const record: FontRecord = { id, family, fileName: file.name, data, addedAt: Date.now() };

  const db = await openDb();
  await txPut(db, record);
  await registerFontFace(family, data);

  const { families, _set } = useCustomFontStore.getState();
  if (!families.includes(family)) {
    _set([...families, family]);
  }

  return { id, family, fileName: file.name };
}

export async function deleteCustomFont(id: string): Promise<void> {
  const db = await openDb();
  const record = await txGet<FontRecord>(db, id);
  await txDelete(db, id);

  if (record) {
    for (const f of document.fonts) {
      if (f.family === record.family || f.family === `"${record.family}"`) {
        document.fonts.delete(f);
        break;
      }
    }
    const { families, _set } = useCustomFontStore.getState();
    _set(families.filter((f) => f !== record.family));
  }
}
