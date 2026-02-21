import * as FileSystem from "expo-file-system";

type StorageMap = Record<string, string>;

const STORAGE_FILE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}mirror-mobile-storage.json`
  : null;

const memoryStorage: StorageMap = {};
let cachedStorage: StorageMap | null = null;
let loadPromise: Promise<StorageMap> | null = null;

const canUseLocalStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const parseStorageContent = (raw: string): StorageMap => {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const result: StorageMap = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string") {
        result[key] = value;
      }
    }

    return result;
  } catch {
    return {};
  }
};

const loadFromDisk = async (): Promise<StorageMap> => {
  if (!STORAGE_FILE_URI) {
    return {};
  }

  try {
    const info = await FileSystem.getInfoAsync(STORAGE_FILE_URI);
    if (!info.exists) {
      return {};
    }

    const raw = await FileSystem.readAsStringAsync(STORAGE_FILE_URI);
    if (!raw.trim()) {
      return {};
    }

    return parseStorageContent(raw);
  } catch {
    return {};
  }
};

const persistToDisk = async (nextStorage: StorageMap): Promise<void> => {
  if (canUseLocalStorage()) {
    for (const [key, value] of Object.entries(nextStorage)) {
      window.localStorage.setItem(key, value);
    }
    return;
  }

  if (!STORAGE_FILE_URI) {
    return;
  }

  try {
    await FileSystem.writeAsStringAsync(STORAGE_FILE_URI, JSON.stringify(nextStorage));
  } catch {
    // Ignore write errors to avoid breaking app flow.
  }
};

const ensureStorageLoaded = async (): Promise<StorageMap> => {
  if (cachedStorage) {
    return cachedStorage;
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      if (canUseLocalStorage()) {
        const fromLocalStorage: StorageMap = {};
        for (let i = 0; i < window.localStorage.length; i += 1) {
          const key = window.localStorage.key(i);
          if (!key) continue;
          const value = window.localStorage.getItem(key);
          if (value == null) continue;
          fromLocalStorage[key] = value;
        }
        return fromLocalStorage;
      }

      const fromDisk = await loadFromDisk();
      return { ...memoryStorage, ...fromDisk };
    })();
  }

  cachedStorage = await loadPromise;
  loadPromise = null;
  return cachedStorage;
};

export const getStorageItem = async (key: string): Promise<string | null> => {
  const storage = await ensureStorageLoaded();
  return storage[key] ?? null;
};

export const setStorageItem = async (key: string, value: string): Promise<void> => {
  const storage = await ensureStorageLoaded();
  const nextStorage = {
    ...storage,
    [key]: value,
  };

  cachedStorage = nextStorage;
  memoryStorage[key] = value;
  await persistToDisk(nextStorage);
};

export const removeStorageItem = async (key: string): Promise<void> => {
  const storage = await ensureStorageLoaded();
  const nextStorage = { ...storage };
  delete nextStorage[key];

  cachedStorage = nextStorage;
  delete memoryStorage[key];

  if (canUseLocalStorage()) {
    window.localStorage.removeItem(key);
  }

  await persistToDisk(nextStorage);
};
