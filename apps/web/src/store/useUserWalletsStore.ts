import { create } from "zustand";
import type { UserWalletRecord, UserWalletsResponseData } from "@mirror/api";

interface UserWalletsState {
    wallets: UserWalletRecord[];
    total: number;
    boundEmail: string;
    primaryWallet: UserWalletRecord | null;
    loading: boolean;
    lastFetchedAt: number | null;
    setWallets: (data: UserWalletsResponseData | null | undefined) => void;
    setLoading: (loading: boolean) => void;
    clear: () => void;
}

const getPrimaryWallet = (wallets: UserWalletRecord[]) =>
    wallets.find(wallet => wallet.is_primary) ?? wallets[0] ?? null;

export const useUserWalletsStore = create<UserWalletsState>(set => ({
    wallets: [],
    total: 0,
    boundEmail: "",
    primaryWallet: null,
    loading: false,
    lastFetchedAt: null,
    setWallets: data => {
        const wallets = data?.wallets ?? [];
        set({
            wallets,
            total: data?.total ?? wallets.length,
            boundEmail: data?.bound_email ?? "",
            primaryWallet: getPrimaryWallet(wallets),
            lastFetchedAt: Date.now(),
        });
    },
    setLoading: loading => set({ loading }),
    clear: () =>
        set({
            wallets: [],
            total: 0,
            boundEmail: "",
            primaryWallet: null,
            loading: false,
            lastFetchedAt: null,
        }),
}));
