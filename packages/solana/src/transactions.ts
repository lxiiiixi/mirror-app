import {
    Connection,
    PublicKey,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from "@solana/web3.js";
import {
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    getAssociatedTokenAddress,
} from "@solana/spl-token";
import { resolvePublicKey, parseAmountToBaseUnits } from "./utils";
import { SendTransaction } from "./types";

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

export const buildSignedSplTokenTransfer = async (
    params: BuildSignedSplTokenTransferParams,
): Promise<{ signature: string }> => {
    console.log("[Solana] buildSignedSplTokenTransfer params", params);
    const owner = resolvePublicKey(params.owner);
    const destination = resolvePublicKey(params.destination);
    const mint = resolvePublicKey(params.mint);
    const feePayer = params.feePayer ? resolvePublicKey(params.feePayer) : owner;

    const amount = parseAmountToBaseUnits(params.amount, params.decimals);

    const sourceAta = await getAssociatedTokenAddress(mint, owner);
    const destinationAta = await getAssociatedTokenAddress(mint, destination);

    const instructions: TransactionInstruction[] = [];

    const destinationInfo = await params.connection.getAccountInfo(destinationAta);
    if (!destinationInfo) {
        instructions.push(
            createAssociatedTokenAccountInstruction(feePayer, destinationAta, destination, mint),
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

    const recentBlockhash =
        params.recentBlockhash ?? (await params.connection.getLatestBlockhash()).blockhash;

    const message = new TransactionMessage({
        payerKey: feePayer,
        recentBlockhash,
        instructions,
    }).compileToLegacyMessage();

    const versionedTransaction = new VersionedTransaction(message);
    const signature = await params.sendTransaction(versionedTransaction);

    return { signature };
};
