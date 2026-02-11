export const STORAGE_KEYS = {
    token: "userToken",
    tokenExpiry: "timestamp",
    loginMethod: "loginMethod",
    userLang: "user-lang",
    skipWhitepaperRedirect: "skip-whitepaper-redirect",
    clubInvite: "club_invite",
    vipMiningTab: "su",
    pendingInviteUid: "mirror_pending_invite_uid",
    pendingWorkInviteCode: "mirror_pending_work_invite_code",
};

export const getStorage = (): Storage | null =>
    typeof window !== "undefined" ? window.localStorage : null;

export const canUseStorage = () => Boolean(getStorage());

export const getStorageItem = (key: string): string | null => {
    const storage = getStorage();
    return storage ? storage.getItem(key) : null;
};

export const setStorageItem = (key: string, value: string): void => {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(key, value);
};

export const removeStorageItem = (key: string): void => {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(key);
};
