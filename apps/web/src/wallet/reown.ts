import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solanaDevnet } from "@reown/appkit/networks";
import { envConfigs } from "@mirror/utils";

const projectId = envConfigs.REOWN_PROJECT_ID;

if (!projectId) {
    console.warn("[Reown] Missing VITE_REOWN_PROJECT_ID");
}

const metadata = {
    name: "Mirror",
    description: "Mirror Wallet Login",
    url: envConfigs.APP_URL || (typeof window !== "undefined" ? window.location.origin : ""),
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

const solanaAdapter = new SolanaAdapter(
    envConfigs.SOLANA_RPC_URL ? { rpcUrl: envConfigs.SOLANA_RPC_URL } : undefined,
);

createAppKit({
    adapters: [solanaAdapter],
    networks: [solanaDevnet],
    metadata,
    projectId: projectId ?? "",
    features: {
        analytics: true,
    },
});
