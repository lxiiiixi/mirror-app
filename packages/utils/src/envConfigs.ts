import { SUPPORTED_NETWORK_VALUES, SupportedNetwork } from "./network";

type EnvSource = Record<string, string | undefined>;

const resolveEnvSource = (): EnvSource => {
    const globalEnv = (globalThis as { __APP_ENV__?: EnvSource }).__APP_ENV__;
    if (globalEnv && typeof globalEnv === "object") {
        return globalEnv;
    }

    if (typeof process !== "undefined") {
        const processEnv = (process as { env?: EnvSource }).env;
        if (processEnv) return processEnv;
    }

    return {};
};

const readEnv = (key: string, fallback = ""): string => {
    const source = resolveEnvSource();
    const value = source[key];
    if (value !== undefined && value !== "") return value;
    return fallback;
};

const readEnvAny = (keys: string[], fallback = ""): string => {
    for (const key of keys) {
        const value = readEnv(key);
        if (value) return value;
    }
    return fallback;
};

const parseNumber = (value: string | undefined, fallback?: number): number | undefined => {
    if (!value) return fallback;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

/** 环境变量中允许的 Solana 网络标识，与 reown 等使用处一致 */
export type SolanaNetworkEnv = "devnet" | "mainnet";

const SOLANA_NETWORK_VALUES: SolanaNetworkEnv[] = ["devnet", "mainnet"];

function parseSolanaNetwork(value: string): SolanaNetworkEnv {
    const normalized = value.toLowerCase().trim();
    if (SOLANA_NETWORK_VALUES.includes(normalized as SolanaNetworkEnv)) {
        return normalized as SolanaNetworkEnv;
    }
    throw new Error(`Invalid solana network: ${value}`);
}

function parseSolanaChainId(value: string | undefined): number {
    const n = parseNumber(value);
    if (n !== undefined) return n;
    throw new Error(`Invalid solana chain id: ${value}`);
}

function parseNetwork(value: string): SupportedNetwork {
    const normalized = value.toLowerCase().trim();
    if (SUPPORTED_NETWORK_VALUES.includes(normalized as SupportedNetwork)) {
        return normalized as SupportedNetwork;
    }
    throw new Error(
        `Invalid network: ${value}. Expected one of: ${SUPPORTED_NETWORK_VALUES.join(", ")}`,
    );
}

export type EnvConfigs = {
    ARTS_API_BASE: string;
    REOWN_PROJECT_ID: string;
    SOLANA_RPC_URL: string;
    SOLANA_CHAIN_ID: number;
    SOLANA_NETWORK: SolanaNetworkEnv; // devnet or mainnet
    NETWORK: SupportedNetwork; // SupportedNetwork
};

export const envConfigs: EnvConfigs = {
    ARTS_API_BASE: readEnvAny([
        "VITE_ARTS_API_BASE",
        "EXPO_PUBLIC_ARTS_API_BASE",
        "ARTS_API_BASE",
    ]),
    REOWN_PROJECT_ID: readEnvAny([
        "VITE_REOWN_PROJECT_ID",
        "EXPO_PUBLIC_REOWN_PROJECT_ID",
        "REOWN_PROJECT_ID",
    ]),
    SOLANA_RPC_URL: readEnvAny([
        "VITE_SOLANA_RPC_URL",
        "EXPO_PUBLIC_SOLANA_RPC_URL",
        "SOLANA_RPC_URL",
    ]),
    SOLANA_CHAIN_ID: parseSolanaChainId(
        readEnvAny([
            "VITE_SOLANA_CHAIN_ID",
            "EXPO_PUBLIC_SOLANA_CHAIN_ID",
            "SOLANA_CHAIN_ID",
        ]),
    ),
    SOLANA_NETWORK: parseSolanaNetwork(
        readEnvAny([
            "VITE_SOLANA_NETWORK",
            "EXPO_PUBLIC_SOLANA_NETWORK",
            "SOLANA_NETWORK",
        ]),
    ),
    NETWORK: parseNetwork(
        readEnvAny([
            "VITE_NETWORK",
            "EXPO_PUBLIC_NETWORK",
            "NETWORK",
        ]),
    ),
};
