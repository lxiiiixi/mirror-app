import { create } from "zustand";
import type { WorkSummary } from "@mirror/api";

export interface HomeWorkListCache {
    items: WorkSummary[];
    total: number;
    page: number;
    hasMore: boolean;
    language: string | null;
    updatedAt: number;
    hasFetched: boolean;
}

interface HomeWorkListState extends HomeWorkListCache {
    setCache: (next: Omit<HomeWorkListCache, "updatedAt">) => void;
    clear: () => void;
}

const initialState: HomeWorkListCache = {
    items: [],
    total: 0,
    page: 1,
    hasMore: true,
    language: null,
    updatedAt: 0,
    hasFetched: false,
};

export const useHomeWorkListStore = create<HomeWorkListState>((set) => ({
    ...initialState,
    setCache: (next) =>
        set({
            ...next,
            updatedAt: Date.now(),
            hasFetched: true,
        }),
    clear: () => set({ ...initialState }),
}));
