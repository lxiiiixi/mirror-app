import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaDevnet } from "@reown/appkit/networks";
import { envConfigs } from "@mirror/utils";

const projectId = envConfigs.REOWN_PROJECT_ID;
const network = envConfigs.SOLANA_NETWORK;

if (!projectId) {
    console.warn("[Reown] Missing VITE_REOWN_PROJECT_ID");
}

const metadata = {
    name: "Mirror",
    description: "Mirror Wallet Login",
    url: typeof window !== "undefined" ? window.location.origin : "",
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

const solanaAdapter = new SolanaAdapter();

createAppKit({
    adapters: [solanaAdapter],
    networks: [network === "devnet" ? solanaDevnet : solana],
    metadata,
    projectId: projectId ?? "",
    features: {
        analytics: true,
        email: false,
        socials: [],
    },
});
