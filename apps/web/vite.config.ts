import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const appEnv = {
        VITE_ARTS_API_BASE: env.VITE_ARTS_API_BASE,
        EXPO_PUBLIC_ARTS_API_BASE: env.EXPO_PUBLIC_ARTS_API_BASE,
        ARTS_API_BASE: env.ARTS_API_BASE,
        VITE_REOWN_PROJECT_ID: env.VITE_REOWN_PROJECT_ID,
        EXPO_PUBLIC_REOWN_PROJECT_ID: env.EXPO_PUBLIC_REOWN_PROJECT_ID,
        REOWN_PROJECT_ID: env.REOWN_PROJECT_ID,
        VITE_SOLANA_RPC_URL: env.VITE_SOLANA_RPC_URL,
        EXPO_PUBLIC_SOLANA_RPC_URL: env.EXPO_PUBLIC_SOLANA_RPC_URL,
        SOLANA_RPC_URL: env.SOLANA_RPC_URL,
        VITE_SOLANA_CHAIN_ID: env.VITE_SOLANA_CHAIN_ID,
        EXPO_PUBLIC_SOLANA_CHAIN_ID: env.EXPO_PUBLIC_SOLANA_CHAIN_ID,
        SOLANA_CHAIN_ID: env.SOLANA_CHAIN_ID,
        VITE_SOLANA_NETWORK: env.VITE_SOLANA_NETWORK,
        EXPO_PUBLIC_SOLANA_NETWORK: env.EXPO_PUBLIC_SOLANA_NETWORK,
        SOLANA_NETWORK: env.SOLANA_NETWORK,
        VITE_NETWORK: env.VITE_NETWORK,
        EXPO_PUBLIC_NETWORK: env.EXPO_PUBLIC_NETWORK,
        NETWORK: env.NETWORK,
    };

    return {
        plugins: [
            react({
                babel: {
                    plugins: ["styled-jsx/babel"],
                },
            }),
        ],
        css: {
            postcss: "./postcss.config.cjs",
        },
        define: {
            __APP_ENV__: JSON.stringify(appEnv),
        },
        // 生产构建时移除 console.log/info/debug/warn，保留 console.error
        esbuild:
            mode === "production"
                ? {
                      pure: ["console.log", "console.info", "console.debug", "console.warn"],
                  }
                : undefined,
    };
});
