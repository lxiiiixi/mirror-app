type StorageMap = Record<string, string>;

const STORAGE_PREFIX = "mirror:reown:";

const memoryStorage: StorageMap = {};

const safeJsonParse = <T>(raw: string): T | undefined => {
    try {
        return JSON.parse(raw) as T;
    } catch {
        return undefined;
    }
};

const toStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

const getAsyncStorage = () => {
    try {
        const loaded = require("@react-native-async-storage/async-storage");
        return loaded?.default ?? loaded;
    } catch {
        return null;
    }
};

export const reownStorage = {
    async getKeys(): Promise<string[]> {
        const asyncStorage = getAsyncStorage();
        if (!asyncStorage?.getAllKeys) {
            return Object.keys(memoryStorage);
        }

        const keys = (await asyncStorage.getAllKeys()) as string[];
        return keys
            .filter(key => key.startsWith(STORAGE_PREFIX))
            .map(key => key.slice(STORAGE_PREFIX.length));
    },

    async getEntries<T = unknown>(): Promise<[string, T][]> {
        const asyncStorage = getAsyncStorage();
        if (!asyncStorage?.getAllKeys || !asyncStorage?.multiGet) {
            return Object.entries(memoryStorage)
                .map(([key, value]) => [key, safeJsonParse<T>(value)] as const)
                .filter((entry): entry is [string, T] => entry[1] !== undefined);
        }

        const keys = await this.getKeys();
        if (!keys.length) {
            return [];
        }

        const result = (await asyncStorage.multiGet(keys.map(toStorageKey))) as [string, string | null][];
        return result
            .map(([rawKey, value]) => {
                if (value == null) {
                    return null;
                }
                const key = rawKey.slice(STORAGE_PREFIX.length);
                const parsed = safeJsonParse<T>(value);
                if (parsed === undefined) {
                    return null;
                }
                return [key, parsed] as [string, T];
            })
            .filter((entry): entry is [string, T] => entry !== null);
    },

    async getItem<T = unknown>(key: string): Promise<T | undefined> {
        const asyncStorage = getAsyncStorage();
        if (!asyncStorage?.getItem) {
            const value = memoryStorage[key];
            return value ? safeJsonParse<T>(value) : undefined;
        }

        const value = (await asyncStorage.getItem(toStorageKey(key))) as string | null;
        if (value == null) {
            return undefined;
        }
        return safeJsonParse<T>(value);
    },

    async setItem<T = unknown>(key: string, value: T): Promise<void> {
        const rawValue = JSON.stringify(value);
        memoryStorage[key] = rawValue;

        const asyncStorage = getAsyncStorage();
        if (!asyncStorage?.setItem) {
            return;
        }

        await asyncStorage.setItem(toStorageKey(key), rawValue);
    },

    async removeItem(key: string): Promise<void> {
        delete memoryStorage[key];

        const asyncStorage = getAsyncStorage();
        if (!asyncStorage?.removeItem) {
            return;
        }

        await asyncStorage.removeItem(toStorageKey(key));
    },
};
