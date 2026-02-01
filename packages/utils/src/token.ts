import { SupportedNetwork } from "./network";

export enum SupportedToken {
    USDT = "USDT",
    ENT = "ENT",
}

type TokenInfo = {
    address: string;
    decimals: number;
};

const tokenList: Record<SupportedNetwork, Record<SupportedToken, TokenInfo>> = {
    [SupportedNetwork.SOLANA_DEVNET]: {
        [SupportedToken.USDT]: {
            address: "Ac4Bj8JpbjGWgQcTEF7aG16V5r8F77BPSwyGwSMTojXF",
            decimals: 6,
        },
        [SupportedToken.ENT]: {
            address: "EntToken",
            decimals: 6,
        },
    },
    [SupportedNetwork.SOLANA_MAINNET]: {
        [SupportedToken.USDT]: {
            address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
            decimals: 6,
        },
        [SupportedToken.ENT]: {
            address: "EntToken",
            decimals: 6,
        },
    },
};

export const getTokenInfo = (token: SupportedToken, network: SupportedNetwork) => {
    return tokenList[network][token];
};
