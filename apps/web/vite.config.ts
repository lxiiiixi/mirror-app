import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
    // 生产构建时移除 console.log/info/debug/warn，保留 console.error
    esbuild:
        mode === "production"
            ? {
                  pure: ["console.log", "console.info", "console.debug", "console.warn"],
              }
            : undefined,
}));
