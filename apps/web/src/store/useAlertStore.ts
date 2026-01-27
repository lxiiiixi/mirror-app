import { create } from "zustand";
import type { AlertVariant } from "../ui/Alert/Alert";

interface AlertState {
    open: boolean;
    title?: string;
    message?: string;
    variant: AlertVariant;
    show: (payload: {
        title?: string;
        message: string;
        variant?: AlertVariant;
        durationMs?: number;
    }) => void;
    hide: () => void;
}

let hideTimer: number | null = null;

export const useAlertStore = create<AlertState>((set) => ({
    open: false,
    title: undefined,
    message: undefined,
    variant: "info",
    show: ({ title, message, variant = "info", durationMs = 2500 }) => {
        if (hideTimer) {
            window.clearTimeout(hideTimer);
        }
        set({ open: true, title, message, variant });
        hideTimer = window.setTimeout(() => {
            set({ open: false });
            hideTimer = null;
        }, durationMs);
    },
    hide: () => {
        if (hideTimer) {
            window.clearTimeout(hideTimer);
            hideTimer = null;
        }
        set({ open: false });
    },
}));
