type EnvSource = Record<string, string | undefined>;

const resolveEnvSource = (): EnvSource => {
    if (typeof import.meta !== "undefined") {
        const viteEnv = (import.meta as { env?: EnvSource }).env;
        if (viteEnv) return viteEnv;
    }

    if (typeof process !== "undefined") {
        const processEnv = (process as { env?: EnvSource }).env;
        if (processEnv) return processEnv;
    }

    return {};
};

const readEnv = (key: string, fallback = "") => {
    const source = resolveEnvSource();
    const value = source[key];
    if (value !== undefined && value !== "") return value;
    return fallback;
};

const parseNumber = (value: string | undefined, fallback?: number) => {
    if (!value) return fallback;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

export const envConfigs = {
    ARTS_API_BASE:
        readEnv("VITE_ARTS_API_BASE") ||
        readEnv("ARTS_API_BASE") ||
        readEnv("EXPO_PUBLIC_ARTS_API_BASE"),
    REOWN_PROJECT_ID: readEnv("VITE_REOWN_PROJECT_ID"),
    SOLANA_RPC_URL: readEnv("VITE_SOLANA_RPC_URL"),
    SOLANA_CHAIN_ID: parseNumber(readEnv("VITE_SOLANA_CHAIN_ID")),
    SOLANA_NETWORK: readEnv("VITE_SOLANA_NETWORK", "devnet"),
    APP_URL: readEnv("VITE_APP_URL"),
};
