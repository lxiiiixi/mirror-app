import { VersionedTransaction } from "@solana/web3.js";

export type SendTransaction = (transaction: VersionedTransaction) => Promise<string>;

export enum SolanaTxErrorCode {
    INVALID_AMOUNT = "invalid_amount",
    SOURCE_TOKEN_ACCOUNT_NOT_FOUND = "source_token_account_not_found",
    INSUFFICIENT_BALANCE = "insufficient_balance",
    RPC_ERROR = "rpc_error",
    SIGN_TRANSACTION_FAILED = "sign_transaction_failed",
}

export class SolanaTxError extends Error {
    code: SolanaTxErrorCode;
    cause?: unknown;

    constructor(code: SolanaTxErrorCode, message: string, cause?: unknown) {
        super(message);
        this.name = "SolanaTxError";
        this.code = code;
        this.cause = cause;
    }
}

export const isSolanaTxError = (error: unknown): error is SolanaTxError => {
    if (!error || typeof error !== "object") return false;
    if (error instanceof SolanaTxError) return true;
    const code = (error as { code?: unknown }).code;
    return (
        typeof code === "string" && (Object.values(SolanaTxErrorCode) as string[]).includes(code)
    );
};
