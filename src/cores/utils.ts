/**
 * this file is copied from project `v1-interface`
 * 
 * @author Phroi
 * @reference https://github.com/ickb/v1-interface/blob/master/src/utils.ts
 */

import { helpers } from "@ckb-lumos/lumos";
import type { QueryClient } from "@tanstack/react-query";
import {
    CKB,
    epochSinceCompare,
    I8Cell,
    isPopulated,
    type ChainConfig,
    type I8Header,
} from "@ickb/lumos-utils";
import { parseEpoch, type EpochSinceValue } from "@ckb-lumos/base/lib/since";
import { MyOrder } from "@ickb/v1-core";

export interface RootConfig extends ChainConfig {
    queryClient: QueryClient;
}

export type IckbDateType = {
    ickbDaoBalance: bigint;
    ickbUdtPoolBalance: bigint;
    myOrders: MyOrder[];
    myReceipts: MyReceipt[];
    myMaturity: MyMaturity[];
    ckbBalance: bigint;
    ckbPendingBalance: bigint;
    ickbPendingBalance: bigint;
    ckbAvailable: bigint;
    ickbRealUdtBalance: bigint;
    tipHeader: Readonly<I8Header>;
    txBuilder: (direction: IckbDirection, amount: bigint) => Readonly<TxInfo>;
    hasMatchable: boolean;

} | undefined

export type IckbDirection = "ckb2ickb" | "ickb2ckb" | "melt";

export type MyReceipt = {
    receiptCell: I8Cell;
    depositQuantity: number;
    depositAmount: bigint;
    ckbAmount: bigint;
    ickbAmount: bigint;
}

export type MyMaturity = {
    daoCell: I8Cell,
    ckbAmount: bigint;
    waitTime: string;
}

export type RecentOrder = {
    timestamp: bigint;
    operation: "order_deposit" | "order_withdraw" | "dao_deposit" | "dao_withdraw";
    amount: bigint;
    unit: "CKB" | "iCKB";
}

export function symbol2Direction(s: string) {
    return s === "C";
}

export function direction2Symbol(d: boolean) {
    return d ? "C" : "I";
}

export function sanitize(text: string) {
    // Filter leading zeros
    let i = 0;
    for (; i < text.length; i++) {
        const c = text[i];
        if ("1" <= c && c <= "9" || c === ".") {
            break;
        }
    }

    //Filter decimal part
    let dot = "";
    const decimalChars: string[] = [];
    for (; i < text.length; i++) {
        const c = text[i];
        if ("0" <= c && c <= "9") {
            decimalChars.push(c);
        } else if (c == ".") {
            dot = ".";
            break;
        }
    }

    //Filter fractional part
    const fractionalChars: string[] = [];
    for (; i < text.length && fractionalChars.length < 8; i++) {
        const c = text[i];
        if ("0" <= c && c <= "9") {
            fractionalChars.push(c);
        }
    }

    return [decimalChars, [dot], fractionalChars].flat().join("");
}

export function toText(n: bigint) {
    return String(n / CKB) + String(Number(n % CKB) / Number(CKB)).slice(1);
}

export function toBigInt(text: string) {
    const [decimal, ...fractionals] = text.split(".");
    return BigInt(
        (decimal ?? "0") + ((fractionals ?? []).join("") + "00000000").slice(0, 8),
    );
}

export function maxWaitTime(ee: EpochSinceValue[], tipHeader: I8Header) {
    const e = ee.reduce((a, b) => (epochSinceCompare(a, b) === -1 ? b : a));
    return maturityWaitTime(e, tipHeader);
}

export function maturityWaitTime(e: EpochSinceValue, tipHeader: I8Header) {
    const t = parseEpoch(tipHeader.epoch);
    const epochs = e.index / e.length - t.index / t.length + e.number - t.number;
    if (epochs <= 0.375) {
        //90 minutes
        return `${String(1 + Math.ceil(epochs * 4 * 60))} minutes`;
    }

    if (epochs <= 6) {
        //24 hours
        return `${String(1 + Math.ceil(epochs * 4))} hours`;
    }

    return `${String(1 + Math.ceil(epochs / 6))} days`;
}

export type TxInfo = {
    tx: helpers.TransactionSkeletonType;
    info: readonly string[];
    error: string;
    isEmpty: boolean;
};

export function txInfoFrom({
    tx = helpers.TransactionSkeleton(),
    info = <readonly string[]>[],
    error = "",
}): Readonly<TxInfo> {
    if (error.length > 0) {
        tx = helpers.TransactionSkeleton();
    }

    const isEmpty = !isPopulated(tx) && info.length === 0 && error.length === 0;
    return Object.freeze({ tx, info: Object.freeze(info), error, isEmpty });
}
