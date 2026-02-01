import { VersionedTransaction } from "@solana/web3.js";

type TransactionSignature = string;
export type SendTransaction = (
    transaction: VersionedTransaction,
) => Promise<TransactionSignature>;
