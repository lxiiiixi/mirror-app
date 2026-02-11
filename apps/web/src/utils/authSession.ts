import { useAuthStore } from "../store/useAuthStore";
import { useWalletStore } from "../store/useWalletStore";
import { STORAGE_KEYS, canUseStorage, removeStorageItem } from "./localStorage";

const clearStoredToken = () => {
    if (!canUseStorage()) return;
    removeStorageItem(STORAGE_KEYS.token);
    removeStorageItem(STORAGE_KEYS.tokenExpiry);
    removeStorageItem(STORAGE_KEYS.loginMethod);
};

let handlingUnauthorized = false;

export const handleUnauthorized = () => {
    if (handlingUnauthorized) return;
    handlingUnauthorized = true;

    clearStoredToken();

    const authStore = useAuthStore.getState();
    const walletStore = useWalletStore.getState();
    const wasWalletLogin = authStore.loginMethod === "wallet";
    const wasWalletConnected = walletStore.isConnected;

    authStore.clearToken();
    authStore.setLoginMethod(null);

    walletStore.reset();
    if (wasWalletConnected && wasWalletLogin) {
        walletStore.requestDisconnect();
    }

    // allow future unauthorized handling after sync completes
    setTimeout(() => {
        handlingUnauthorized = false;
    }, 0);
};
