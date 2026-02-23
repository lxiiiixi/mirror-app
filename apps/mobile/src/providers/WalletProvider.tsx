import { envConfigs } from "@mirror/utils";
import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Alert } from "react-native";
import { artsApiClient } from "../api/artsClient";
import { clearPendingInviteParams, getPendingInviteParams } from "../utils/inviteParams";
import { useAuth } from "./AuthProvider";
import {
    reownAvailable,
    useReownAccount,
    useReownAppKit,
    useReownProvider,
} from "../wallet/reown";

interface WalletContextValue {
    available: boolean;
    address: string | null;
    isConnected: boolean;
    status: string;
    isLoggingIn: boolean;
    openWallet: () => void;
    disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const buildLoginMessage = () => `Login Time ${Date.now()}`;

const isUint8Array = (value: unknown): value is Uint8Array =>
    typeof Uint8Array !== "undefined" && value instanceof Uint8Array;

const normalizeSignatureBytes = (raw: unknown): Uint8Array => {
    if (isUint8Array(raw)) {
        return raw;
    }

    if (raw instanceof ArrayBuffer) {
        return new Uint8Array(raw);
    }

    if (ArrayBuffer.isView(raw)) {
        const view = raw as ArrayBufferView;
        return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    }

    if (Array.isArray(raw)) {
        return Uint8Array.from(raw.map(item => Number(item) & 0xff));
    }

    if (raw && typeof raw === "object") {
        const payload = raw as Record<string, unknown>;
        if ("signature" in payload) {
            return normalizeSignatureBytes(payload.signature);
        }
        if ("data" in payload) {
            return normalizeSignatureBytes(payload.data);
        }
    }

    if (typeof raw === "string") {
        return new TextEncoder().encode(raw);
    }

    throw new Error("Unsupported signature payload");
};

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const encodeBase64 = (bytes: Uint8Array) => {
    let output = "";
    for (let i = 0; i < bytes.length; i += 3) {
        const byte1 = bytes[i];
        const byte2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
        const byte3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

        const chunk = (byte1 << 16) | (byte2 << 8) | byte3;

        output += BASE64_ALPHABET[(chunk >> 18) & 63];
        output += BASE64_ALPHABET[(chunk >> 12) & 63];
        output += i + 1 < bytes.length ? BASE64_ALPHABET[(chunk >> 6) & 63] : "=";
        output += i + 2 < bytes.length ? BASE64_ALPHABET[chunk & 63] : "=";
    }
    return output;
};

const signWithWalletProvider = async (provider: unknown, message: string) => {
    const typedProvider = provider as {
        signMessage?: (payload: Uint8Array) => Promise<unknown>;
        request?: (payload: { method: string; params?: unknown }) => Promise<unknown>;
        disconnect?: () => Promise<void> | void;
    };

    const messageBytes = new TextEncoder().encode(message);

    if (typeof typedProvider.signMessage === "function") {
        return typedProvider.signMessage(messageBytes);
    }

    if (typeof typedProvider.request === "function") {
        return typedProvider.request({
            method: "solana_signMessage",
            params: {
                message: messageBytes,
            },
        });
    }

    throw new Error("Wallet does not support signMessage");
};

const getReadableErrorMessage = (error: unknown) => {
    if (error && typeof error === "object" && "message" in error) {
        return String((error as { message?: unknown }).message ?? "Unknown error");
    }
    return String(error ?? "Unknown error");
};

export function WalletProvider({ children }: { children: ReactNode }) {
    const { token, loginMethod, saveToken } = useAuth();
    const { open, disconnect } = useReownAppKit() as {
        open?: (params?: unknown) => unknown;
        disconnect?: () => Promise<void> | void;
    };
    const { address, isConnected, status } = useReownAccount() as {
        address?: string | null;
        isConnected?: boolean;
        status?: string;
    };
    const providerResult = useReownProvider("solana") as {
        walletProvider?: unknown;
        provider?: unknown;
    };

    const walletProvider = providerResult.walletProvider ?? providerResult.provider ?? null;

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const lastSignAttemptRef = useRef<string | null>(null);
    const prevTokenRef = useRef<string | null>(token);
    const prevLoginMethodRef = useRef(loginMethod);

    const disconnectWallet = useCallback(async () => {
        try {
            if (typeof disconnect === "function") {
                await disconnect();
            }
        } catch (error) {
            console.warn("[WalletProvider] AppKit disconnect failed", error);
        }

        try {
            const typedProvider = walletProvider as { disconnect?: () => Promise<void> | void };
            if (typeof typedProvider?.disconnect === "function") {
                await typedProvider.disconnect();
            }
        } catch (error) {
            console.warn("[WalletProvider] Wallet provider disconnect failed", error);
        }
    }, [disconnect, walletProvider]);

    const signInWithWallet = useCallback(async () => {
        if (!address || !walletProvider || isLoggingIn) {
            return;
        }

        if (!envConfigs.SOLANA_CHAIN_ID) {
            Alert.alert("Wallet", "Missing EXPO_PUBLIC_SOLANA_CHAIN_ID");
            return;
        }

        setIsLoggingIn(true);
        try {
            const message = buildLoginMessage();
            const signatureRaw = await signWithWalletProvider(walletProvider, message);
            const signatureBytes = normalizeSignatureBytes(signatureRaw);
            const sign = encodeBase64(signatureBytes);
            const pending = await getPendingInviteParams();

            const response = await artsApiClient.user.solanaWalletLogin({
                wallet_address: address,
                chain_id: envConfigs.SOLANA_CHAIN_ID,
                login_type: "wallet",
                message,
                sign,
                ...(pending.workInviteCode ? { work_invite_code: pending.workInviteCode } : {}),
                ...(pending.inviteUid ? { invite_uid_code: pending.inviteUid } : {}),
            });

            const nextToken = response.data?.token;
            if (!nextToken) {
                throw new Error("Wallet login response missing token");
            }

            await saveToken(nextToken, "wallet");
            await clearPendingInviteParams();
        } catch (error) {
            console.error("[WalletProvider] wallet login failed", error);
            Alert.alert("Wallet", getReadableErrorMessage(error));
            await disconnectWallet();
        } finally {
            setIsLoggingIn(false);
        }
    }, [address, disconnectWallet, isLoggingIn, saveToken, walletProvider]);

    const openWallet = useCallback(() => {
        if (!reownAvailable) {
            Alert.alert("Wallet", "Reown is not configured. Please install dependencies first.");
            return;
        }

        try {
            const result = typeof open === "function" ? open({ view: "Connect" }) : undefined;
            if (result && typeof (result as Promise<unknown>).then === "function") {
                void (result as Promise<unknown>);
            }
        } catch (error) {
            console.error("[WalletProvider] open wallet failed", error);
            Alert.alert("Wallet", "Failed to open wallet modal");
        }
    }, [open]);

    useEffect(() => {
        if (!isConnected || !address || token || isLoggingIn) {
            return;
        }

        if (lastSignAttemptRef.current === address) {
            return;
        }

        lastSignAttemptRef.current = address;
        void signInWithWallet();
    }, [address, isConnected, isLoggingIn, signInWithWallet, token]);

    useEffect(() => {
        if (!isConnected || !address) {
            lastSignAttemptRef.current = null;
            return;
        }

        if (lastSignAttemptRef.current && lastSignAttemptRef.current !== address) {
            lastSignAttemptRef.current = null;
        }
    }, [address, isConnected]);

    useEffect(() => {
        const hadWalletSession = Boolean(prevTokenRef.current) && prevLoginMethodRef.current === "wallet";
        if (!token && hadWalletSession && isConnected) {
            void disconnectWallet();
        }

        prevTokenRef.current = token;
        prevLoginMethodRef.current = loginMethod;
    }, [disconnectWallet, isConnected, loginMethod, token]);

    const value = useMemo<WalletContextValue>(
        () => ({
            available: reownAvailable,
            address: address ?? null,
            isConnected: Boolean(isConnected),
            status: String(status ?? "disconnected"),
            isLoggingIn,
            openWallet,
            disconnectWallet,
        }),
        [address, disconnectWallet, isConnected, isLoggingIn, openWallet, status],
    );

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used inside WalletProvider");
    }
    return context;
}
