import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from "@solana/web3.js";
import {
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    getAccount,
    getAssociatedTokenAddress,
} from "@solana/spl-token";
import { encodeBase64, parseAmountToBaseUnits, resolvePublicKey } from "./utils";
import { SendTransaction, SolanaTxError, SolanaTxErrorCode } from "./types";

export type BuildSignedSplTokenTransferParams = {
    connection: Connection;
    owner: PublicKey | string;
    destination: PublicKey | string;
    mint: PublicKey | string;
    amount: string;
    decimals: number;
    sendTransaction: SendTransaction;
    feePayer?: PublicKey | string;
    recentBlockhash?: string;
};

const isTokenAccountMissingError = (error: unknown) => {
    if (!error || typeof error !== "object") return false;
    const name = (error as { name?: string }).name;
    return name === "TokenAccountNotFoundError" || name === "TokenInvalidAccountOwnerError";
};

export const buildSignedSplTokenTransfer = async (
    params: BuildSignedSplTokenTransferParams,
): Promise<{ signature: string }> => {
    const owner = resolvePublicKey(params.owner);
    const destination = resolvePublicKey(params.destination);
    const mint = resolvePublicKey(params.mint);
    const feePayer = params.feePayer ? resolvePublicKey(params.feePayer) : owner;
    const amount = parseAmountToBaseUnits(params.amount, params.decimals);

    const sourceAta = await getAssociatedTokenAddress(mint, owner);
    const destinationAta = await getAssociatedTokenAddress(mint, destination);

    let sourceAccount;
    try {
        sourceAccount = await getAccount(params.connection, sourceAta);
    } catch (error) {
        if (isTokenAccountMissingError(error)) {
            throw new SolanaTxError(
                SolanaTxErrorCode.SOURCE_TOKEN_ACCOUNT_NOT_FOUND,
                "Source token account not found",
                error,
            );
        }
        throw new SolanaTxError(
            SolanaTxErrorCode.RPC_ERROR,
            "Failed to fetch token account",
            error,
        );
    }

    if (sourceAccount.amount < amount) {
        throw new SolanaTxError(
            SolanaTxErrorCode.INSUFFICIENT_BALANCE,
            "Insufficient token balance",
        );
    }

    const instructions: TransactionInstruction[] = [];

    try {
        const destinationInfo = await params.connection.getAccountInfo(destinationAta);
        if (!destinationInfo) {
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    feePayer,
                    destinationAta,
                    destination,
                    mint,
                ),
            );
        }
    } catch (error) {
        throw new SolanaTxError(
            SolanaTxErrorCode.RPC_ERROR,
            "Failed to fetch destination token account",
            error,
        );
    }

    instructions.push(
        createTransferCheckedInstruction(
            sourceAta,
            mint,
            destinationAta,
            owner,
            amount,
            params.decimals,
        ),
    );

    const message = new TransactionMessage({
        payerKey: feePayer,
        recentBlockhash:
            params.recentBlockhash ?? (await params.connection.getLatestBlockhash()).blockhash,
        instructions,
    });

    const transaction = new VersionedTransaction(message.compileToLegacyMessage());

    try {
        const signature = await params.sendTransaction(transaction);
        return { signature };
    } catch (error) {
        throw new SolanaTxError(
            SolanaTxErrorCode.SIGN_TRANSACTION_FAILED,
            "Failed to sign transaction",
            error,
        );
    }
};
