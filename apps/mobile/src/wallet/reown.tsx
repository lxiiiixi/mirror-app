import "@walletconnect/react-native-compat";
import "react-native-get-random-values";
import "text-encoding";

import {
    createAppKit,
    solana,
    solanaDevnet,
    AppKitProvider,
    AppKit,
    useAppKit as useAppKitHook,
    useAccount as useAccountHook,
    useProvider as useProviderHook,
    useAppKitState,
} from "@reown/appkit-react-native";
import { SolanaAdapter } from "@reown/appkit-solana-react-native";
import { envConfigs } from "@mirror/utils";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { reownStorage } from "./reownStorage";

const APP_SCHEME = "mirrorapp";

function createAppKitInstance() {
    const projectId = envConfigs.REOWN_PROJECT_ID;
    if (!projectId) {
        console.warn("[Reown] Missing EXPO_PUBLIC_REOWN_PROJECT_ID");
        return null;
    }

    const selectedNetwork =
        envConfigs.SOLANA_NETWORK === "devnet" ? solanaDevnet : solana;

    try {
        return createAppKit({
            projectId,
            adapters: [new SolanaAdapter()],
            networks: [selectedNetwork],
            defaultNetwork: selectedNetwork,
            storage: reownStorage,
            metadata: {
                name: "Mirror",
                description: "Mirror Wallet Login",
                url: "https://mirror.fan",
                icons: ["https://avatars.githubusercontent.com/u/179229932"],
                redirect: {
                    native: `${APP_SCHEME}://`,
                },
            },
            features: {
                swaps: false,
                onramp: false,
            },
        });
    } catch (error) {
        console.error("[Reown] createAppKit failed", error);
        return null;
    }
}

const appKitInstance = createAppKitInstance();

export const reownAvailable = Boolean(appKitInstance);

export function ReownProvider({ children }: { children: ReactNode }) {
    if (!appKitInstance) {
        return <>{children}</>;
    }

    return (
        <AppKitProvider instance={appKitInstance}>{children}</AppKitProvider>
    );
}

export function ReownModalPortal() {
    if (!appKitInstance) {
        return null;
    }

    return <ReownModalPortalInner />;
}

function ReownModalPortalInner() {
    const { isOpen } = useAppKitState();
    const [remountKey, setRemountKey] = useState(0);
    const wasOpenRef = useRef(false);

    useEffect(() => {
        if (isOpen) {
            wasOpenRef.current = true;
        } else if (wasOpenRef.current) {
            wasOpenRef.current = false;
            setRemountKey(k => k + 1);
        }
    }, [isOpen]);

    if (Platform.OS === "android") {
        return (
            <View pointerEvents="box-none" style={styles.portalWrap} key={remountKey}>
                <AppKit />
            </View>
        );
    }

    return <AppKit key={remountKey} />;
}

const appKitFallback = {
    open: () => undefined,
    disconnect: async () => undefined,
};

const accountFallback = {
    address: null as string | null,
    isConnected: false,
    status: "disconnected",
};

const providerFallback = {
    walletProvider: null as unknown,
    providerType: null as unknown,
    provider: null as unknown,
};

export function useReownAppKit() {
    const result = useAppKitHook();
    if (!appKitInstance) return appKitFallback;
    return result ?? appKitFallback;
}

export function useReownAccount() {
    const result = useAccountHook();
    if (!appKitInstance) return accountFallback;
    return result ?? accountFallback;
}

export function useReownProvider(_namespace = "solana") {
    const result = useProviderHook();
    if (!appKitInstance) return providerFallback;
    if (!result) return providerFallback;
    return {
        ...result,
        walletProvider: result.provider,
    };
}

const styles = StyleSheet.create({
    // AppKit 模态容器（Expo Router Android 需要绝对定位，见文档）
    portalWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
    },
});
