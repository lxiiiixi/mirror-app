import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
    plugins: [react(), tailwindcss()],
    esbuild:
        mode === "production"
            ? {
                  pure: ["console.log", "console.info", "console.debug", "console.warn"],
              }
            : undefined,
}));
