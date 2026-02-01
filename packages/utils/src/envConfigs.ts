import { SUPPORTED_NETWORK_VALUES, SupportedNetwork } from "./network";

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

const readEnv = (key: string, fallback = ""): string => {
    const source = resolveEnvSource();
    const value = source[key];
    if (value !== undefined && value !== "") return value;
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
    ARTS_API_BASE:
        readEnv("VITE_ARTS_API_BASE") ||
        readEnv("ARTS_API_BASE") ||
        readEnv("EXPO_PUBLIC_ARTS_API_BASE"),
    REOWN_PROJECT_ID: readEnv("VITE_REOWN_PROJECT_ID"),
    SOLANA_RPC_URL: readEnv("VITE_SOLANA_RPC_URL"),
    SOLANA_CHAIN_ID: parseSolanaChainId(readEnv("VITE_SOLANA_CHAIN_ID")),
    SOLANA_NETWORK: parseSolanaNetwork(readEnv("VITE_SOLANA_NETWORK")),
    NETWORK: parseNetwork(readEnv("VITE_NETWORK")),
};
