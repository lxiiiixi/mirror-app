import { PublicKey } from "@solana/web3.js";

export const resolvePublicKey = (value: PublicKey | string) =>
    typeof value === "string" ? new PublicKey(value) : value;

export const encodeBase64 = (bytes: Uint8Array) => {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(bytes).toString("base64");
    }
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
};

export const parseAmountToBaseUnits = (amount: string, decimals: number) => {
    const normalized = amount.trim();
    if (!normalized) {
        throw new Error("Amount is required");
    }
    if (!/^\d+(\.\d*)?$/.test(normalized)) {
        throw new Error("Invalid amount format");
    }
    const [whole, fraction = ""] = normalized.split(".");
    if (fraction.length > decimals) {
        throw new Error("Too many decimal places");
    }
    const paddedFraction = fraction.padEnd(decimals, "0");
    const combined = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, "");
    const value = BigInt(combined || "0");
    if (value <= 0n) {
        throw new Error("Amount must be greater than zero");
    }
    return value;
};
