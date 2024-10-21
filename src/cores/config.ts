import { ccc } from "@ckb-ccc/core";
import { Cell, Transaction, helpers } from "@ckb-lumos/lumos";
import { cellDeps, headerDeps, witness, since, ChainConfig, chainConfigFrom, I8Script, lockExpanderFrom } from "@ickb/lumos-utils";
import type { QueryClient } from "@tanstack/react-query"

export interface WalletConfig extends ChainConfig {
    address: ccc.Hex;
    accountLock: I8Script;
    expander: (c: Cell) => I8Script | undefined;
    addPlaceholders: (tx: helpers.TransactionSkeletonType) => helpers.TransactionSkeletonType;
    signer: (tx: helpers.TransactionSkeletonType) => Promise<Transaction>;
    queryClient: QueryClient;
}

let WalletConfig: WalletConfig | undefined = undefined;

export async function setupWalletConfig(signer: ccc.Signer) {
    const chain = signer.client.addressPrefix === "ckb" ? "mainnet" : "testnet";
    const chainConfig = await chainConfigFrom(chain);
    const signerAddress = await signer.getRecommendedAddressObj();
    const signerLock = I8Script.from({
        ...signerAddress.script,
        [cellDeps]: [],
        [headerDeps]: [],
        [witness]: undefined,
        [since]: "0x0",
    });
    return {
        ...chainConfig,
        address: signerAddress.toString(),
        accountLock: signerLock,
        expander: lockExpanderFrom(signerLock),
        addPlaceholders: (tx: helpers.TransactionSkeletonType) => tx,
        signer: async (tx: helpers.TransactionSkeletonType) => {
            const cccTx = ccc.Transaction.fromLumosSkeleton(tx);
            return await signer.signTransaction(cccTx);
        }
    }
}

export function getWalletConfig(): WalletConfig {
    if (!WalletConfig) {
        throw new Error("please call `setupWalletConfig` at first");
    }
    return WalletConfig;
}
