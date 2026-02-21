import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { artsApiClient } from "../api/artsClient";
import { STORAGE_KEYS, getStorageItem, removeStorageItem, setStorageItem } from "../utils/localStorage";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type LoginMethod = "email" | "wallet" | null;

interface AuthContextValue {
  token: string | null;
  loginMethod: LoginMethod;
  hydrated: boolean;
  isLoggedIn: boolean;
  isEmailLogin: boolean;
  saveToken: (nextToken: string, method?: Exclude<LoginMethod, null>) => Promise<void>;
  clearToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredToken = async (): Promise<string | null> => {
  const token = await getStorageItem(STORAGE_KEYS.token);
  if (!token) {
    return null;
  }

  const expiryRaw = await getStorageItem(STORAGE_KEYS.tokenExpiry);
  const expiry = expiryRaw ? Number(expiryRaw) : 0;
  if (expiry && Date.now() > expiry) {
    await Promise.all([
      removeStorageItem(STORAGE_KEYS.token),
      removeStorageItem(STORAGE_KEYS.tokenExpiry),
      removeStorageItem(STORAGE_KEYS.loginMethod),
    ]);
    return null;
  }

  return token;
};

const readStoredLoginMethod = async (): Promise<LoginMethod> => {
  const method = await getStorageItem(STORAGE_KEYS.loginMethod);
  if (method === "email" || method === "wallet") {
    return method;
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const storedToken = await readStoredToken();
      if (!active) return;

      if (storedToken) {
        setToken(storedToken);
        const storedMethod = await readStoredLoginMethod();
        if (!active) return;
        setLoginMethod(storedMethod);
      } else {
        setToken(null);
        setLoginMethod(null);
      }

      setHydrated(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    artsApiClient.setToken(token ?? undefined);
  }, [token]);

  const saveToken = useCallback(async (nextToken: string, method?: Exclude<LoginMethod, null>) => {
    await Promise.all([
      setStorageItem(STORAGE_KEYS.token, nextToken),
      setStorageItem(STORAGE_KEYS.tokenExpiry, String(Date.now() + TOKEN_TTL_MS)),
      method
        ? setStorageItem(STORAGE_KEYS.loginMethod, method)
        : Promise.resolve(),
    ]);

    setToken(nextToken);
    if (method) {
      setLoginMethod(method);
    }
  }, []);

  const clearToken = useCallback(async () => {
    await Promise.all([
      removeStorageItem(STORAGE_KEYS.token),
      removeStorageItem(STORAGE_KEYS.tokenExpiry),
      removeStorageItem(STORAGE_KEYS.loginMethod),
    ]);

    setToken(null);
    setLoginMethod(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      loginMethod,
      hydrated,
      isLoggedIn: Boolean(token),
      isEmailLogin: loginMethod === "email",
      saveToken,
      clearToken,
    }),
    [clearToken, hydrated, loginMethod, saveToken, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
