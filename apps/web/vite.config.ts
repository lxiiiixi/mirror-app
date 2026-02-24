import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // 始终从 vite.config 所在目录（apps/web）加载 .env，避免从 monorepo 根目录执行时读不到 .env.test
    const env = loadEnv(mode, __dirname, "");
    // 构建时 @mirror/utils/envConfigs 会在 Node 侧被求值，此时 __APP_ENV__ 尚未注入，只能读 process.env，故把加载结果写回
    for (const [key, val] of Object.entries(env)) {
        if (val !== undefined && val !== "") process.env[key] = val;
    }
    const appEnv = {
        VITE_ARTS_API_BASE: env.VITE_ARTS_API_BASE,
        ARTS_API_BASE: env.ARTS_API_BASE,
        VITE_REOWN_PROJECT_ID: env.VITE_REOWN_PROJECT_ID,
        REOWN_PROJECT_ID: env.REOWN_PROJECT_ID,
        VITE_SOLANA_RPC_URL: env.VITE_SOLANA_RPC_URL,
        SOLANA_RPC_URL: env.SOLANA_RPC_URL,
        VITE_SOLANA_CHAIN_ID: env.VITE_SOLANA_CHAIN_ID,
        SOLANA_CHAIN_ID: env.SOLANA_CHAIN_ID,
        VITE_SOLANA_NETWORK: env.VITE_SOLANA_NETWORK,
        SOLANA_NETWORK: env.SOLANA_NETWORK,
        VITE_NETWORK: env.VITE_NETWORK,
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
            // packages/utils/envConfigs 读取的是 globalThis.__APP_ENV__
            // 因此需要注入到该路径，避免运行时读不到环境变量
            "globalThis.__APP_ENV__": JSON.stringify(appEnv),
            // 兼容历史代码中直接引用 __APP_ENV__ 的场景
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
