/**
 * this file is copied from project `v1-interface`
 * 
 * @author Phroi
 * @reference https://github.com/ickb/v1-interface/blob/master/src/transaction.ts
 */

import { helpers } from "@ckb-lumos/lumos";
import {
    addCells,
    addCkbChange,
    binarySearch,
    calculateTxFee,
    CKB,
    txSize,
    type I8Cell,
    type I8Header,
} from "@ickb/lumos-utils";
import {
    addIckbUdtChange,
    addOwnedWithdrawalRequestsChange,
    addReceiptDepositsChange,
    addWithdrawalRequestGroups,
    ickb2Ckb,
    ickbDeposit,
    ickbExchangeRatio,
    ickbRequestWithdrawalFrom,
    orderMelt,
    orderMint,
    type ExtendedDeposit,
    type MyOrder,
    type OrderRatio,
} from "@ickb/v1-core";
import {
    maxWaitTime,
    MyReceipt,
    toText,
    txInfoFrom,
    type TxInfo,
    type IckbTxInfoI18nToken,
} from "./utils";
import { ckbSoftCapPerDeposit } from "@ickb/v1-core";
import { WalletConfig } from "./config.js";
// import { ChevronsRightLeft } from "lucide-react";

export function base({
    capacities,
    udts,
    receipts,
    wrGroups,
    myOrders,
}: {
    capacities: I8Cell[];
    udts: I8Cell[];
    receipts: I8Cell[];
    wrGroups: Readonly<{
        ownedWithdrawalRequest: I8Cell;
        owner: I8Cell;
    }>[];
    myOrders: MyOrder[];
}) {
    let tx = helpers.TransactionSkeleton();
    const info: IckbTxInfoI18nToken[] = [];

    tx = orderMelt(tx, myOrders);
    const notCompleted = myOrders.reduce(
        (c, { info }) => (info.isMatchable ? c + 1 : c),
        0,
    );
    if (notCompleted > 0) {
        info.push({ 
            i18nKey: "ickbTxInfo.cancellingOrders", 
            params: { 
                count: notCompleted 
            } 
        });
    }
    const completed = myOrders.length - notCompleted;
    if (completed > 0) {
        info.push({
            i18nKey: "ickbTxInfo.meltingOrders", 
            params: {
                count: completed 
            } 
        });
    }

    tx = addCells(tx, "append", [capacities, udts, receipts].flat(), []);
    // Receipts need explanation, while capacities and udts do not
    if (receipts.length > 0) {
        info.push({
            i18nKey: "ickbTxInfo.convertingReceipts", 
            params: {
                count: receipts.length 
            }
        });
    }

    tx = addWithdrawalRequestGroups(tx, wrGroups);
    if (wrGroups.length > 0) {
        info.push({
            i18nKey: "ickbTxInfo.withdrawingRequests", 
            params: { 
                count: wrGroups.length 
            }
        });
    }

    return txInfoFrom({ tx, info });
}

type MyExtendedDeposit = ExtendedDeposit & { ickbCumulative: bigint };

export function convert(
    txInfo: TxInfo,
    isCkb2Udt: boolean,
    amount: bigint,
    deposits: Readonly<ExtendedDeposit[]>,
    tipHeader: I8Header,
    feeRate: bigint,
    walletConfig: WalletConfig,
) {
    if (txInfo.error !== null) {
        return txInfo;
    }
    const ickbPool: MyExtendedDeposit[] = [];
    if (!isCkb2Udt) {
        // Filter deposits
        let ickbCumulative = BigInt(0);
        for (const d of deposits) {
            const c = ickbCumulative + d.ickbValue;
            if (c > amount) {
                continue;
            }
            ickbCumulative = c;
            console.log(Object.freeze({ ...d, ickbCumulative }))
            ickbPool.push(Object.freeze({ ...d, ickbCumulative }));

            if (ickbPool.length >= 30) {
                break;
            }
        }
    }
    Object.freeze(ickbPool);
    const { ckbMultiplier, udtMultiplier } = ickbExchangeRatio(tipHeader);
    const ratio: OrderRatio = {
        ckbMultiplier,
        //   Pay 0.1% fee to bot
        udtMultiplier:
            udtMultiplier + (isCkb2Udt ? BigInt(1) : BigInt(-1)) * (udtMultiplier / BigInt(1000)),
    };

    const depositAmount = ckbSoftCapPerDeposit(tipHeader);
    const N = isCkb2Udt ? Number(amount / depositAmount) : ickbPool.length;
    const txCache = Array<TxInfo | undefined>(N);
    const attempt = (n: number) => {
        n = N - n;
        return (txCache[n] =
            txCache[n] ??
            convertAttempt(
                n,
                isCkb2Udt,
                amount,
                txInfo,
                ratio,
                depositAmount,
                ickbPool,
                tipHeader,
                feeRate,
                walletConfig,
            ));
    };
    return attempt(binarySearch(N, (n) => attempt(n).error === null));
}

function convertAttempt(
    quantity: number,
    isCkb2Udt: boolean,
    amount: bigint,
    txInfo: TxInfo,
    ratio: OrderRatio,
    depositAmount: bigint,
    ickbPool: Readonly<MyExtendedDeposit[]>,
    tipHeader: I8Header,
    feeRate: bigint,
    walletConfig: WalletConfig,
) {
    if (txInfo.error !== null) {
        return txInfo;
    }
    let { tx } = txInfo;
    let info: IckbTxInfoI18nToken[] = [...txInfo.info];

    const { accountLock, config } = walletConfig;
    if (quantity > 0) {
        if (isCkb2Udt) {
            amount -= depositAmount * BigInt(quantity);
            if (amount < BigInt(0)) {
                return txInfoFrom({
                    error: { 
                        i18nKey: "ickbTxInfo.errorTooManyDeposits" 
                    },
                });
            }
            tx = ickbDeposit(tx, quantity, depositAmount, config);
            tx = addReceiptDepositsChange(tx, accountLock, config);
            info = info.concat([{ 
                i18nKey: "ickbTxInfo.creatingDeposits", 
                params: { 
                    count: quantity, 
                    amount: toText(depositAmount) 
                }
            }]);
        } else {
            if (ickbPool.length < quantity) {
                return txInfoFrom({ 
                    error: { 
                        i18nKey: "ickbTxInfo.errorNotEnoughDeposits" 
                    }
                });
            }
            amount -= ickbPool[quantity - 1].ickbCumulative;
            if (amount < BigInt(0)) {
                return txInfoFrom({
                    error: {
                        i18nKey: "ickbTxInfo.errorTooManyWithdrawals" 
                    },
                });
            }
            ickbPool = ickbPool.slice(0, quantity);
            const deposits = ickbPool.map((d) => d.deposit);
            tx = ickbRequestWithdrawalFrom(tx, deposits, config);
            tx = addOwnedWithdrawalRequestsChange(tx, accountLock, config);
            const waitTime = maxWaitTime(
                ickbPool.map((d) => d.estimatedMaturity),
                tipHeader,
            );
            info = info.concat([{ 
                i18nKey: "ickbTxInfo.requestingWithdrawal", 
                params: { 
                    count: quantity, 
                    waitTime 
                }
            }]);
        }
    }

    if (amount > BigInt(0)) {
        tx = orderMint(
            tx,
            accountLock,
            config,
            isCkb2Udt ? amount : undefined,
            isCkb2Udt ? undefined : amount,
            isCkb2Udt ? ratio : undefined,
            isCkb2Udt ? undefined : ratio,
        );
        // 0.1% fee to bot
        const fee = isCkb2Udt
            ? amount -
            ickb2Ckb(
                (amount * ratio.ckbMultiplier) / ratio.udtMultiplier,
                tipHeader,
            )
            : ickb2Ckb(amount, tipHeader) -
            (amount * ratio.udtMultiplier) / ratio.ckbMultiplier;
        info = info.concat([{
            i18nKey: quantity > 0 ? "ickbTxInfo.creatingLimitOrderRemaining" : "ickbTxInfo.creatingLimitOrder",
            params: { 
                amount: toText(amount), 
                unit: isCkb2Udt ? "CKB" : "iCKB", 
                fee: toText(fee) 
            },
        }]);
    }

    return addChange(txInfoFrom({ tx, info }), feeRate, walletConfig);
}

export function addChange(
    txInfo: TxInfo,
    feeRate: bigint,
    walletConfig: WalletConfig,
) {
    if (txInfo.error !== null) {
        return txInfo;
    }
    let { tx, info } = txInfo;

    const { accountLock, addPlaceholders, config } = walletConfig;
    // eslint-disable-next-line
    let txFee, freeCkb, freeIckbUdt;
    // eslint-disable-next-line
    ({ tx, freeIckbUdt } = addIckbUdtChange(tx, accountLock, config));
    // eslint-disable-next-line
    ({ tx, txFee, freeCkb } = addCkbChange(
        tx,
        accountLock,
        (txWithDummyChange: helpers.TransactionSkeletonType) => {
            const baseFee = calculateTxFee(
                txSize(addPlaceholders(txWithDummyChange)),
                feeRate,
            );
            // Use a fee that is multiple of N=1249
            const N = BigInt(2000);
            return ((baseFee + (N - BigInt(1))) / N) * N;
        },
        config,
    ));
    if (freeCkb < BigInt(0)) {
        return txInfoFrom({ 
            info, 
            error: {
                i18nKey: "ickbTxInfo.errorNotEnoughCKB" 
            } 
        });
    }

    if (freeIckbUdt < BigInt(0)) {
        return txInfoFrom({ 
            info, 
            error: { 
                i18nKey: "ickbTxInfo.errorNotEnoughICKB" 
            } 
        });
    }

    if (tx.outputs.size > 64) {
        return txInfoFrom({
            info,
            error: { 
                i18nKey: "ickbTxInfo.errorTooManyOutputs" 
            },
        });
    }

    info = info.concat([{ 
        i18nKey: "ickbTxInfo.payingNetworkFee", 
        params: { fee: toText(txFee) } 
    }]);

    return txInfoFrom({ tx, info });
}

export function meltOrder(myOrders: MyOrder[], myReceipts: MyReceipt[], feeRate: bigint, walletConfig: WalletConfig): TxInfo {
    console.log(myOrders, myReceipts);
    const validOrders = myOrders.filter((o) => o.info.absProgress === o.info.absTotal);
    const info: IckbTxInfoI18nToken[] = validOrders.map((o) => ({
        i18nKey: "ickbTxInfo.extractFromOrder",
        params: {
            amount: toText(o.info.absTotal / CKB), 
            unit: o.info.isCkb2Udt ? "iCKB" : "CKB" 
        },
    }));
    myReceipts.forEach((receipt) => {
        const ckbValue = toText(receipt.depositAmount * BigInt(receipt.depositQuantity) / CKB);
        const ickbValue = toText(receipt.ickbAmount);
        info.push({ 
            i18nKey: "ickbTxInfo.convertFromReceipt", 
            params: { ckb: ckbValue, ickb: ickbValue } 
        });
    });
    let tx = helpers.TransactionSkeleton();
    if (myOrders.length > 0) {
        tx = orderMelt(tx, myOrders);
    }
    tx = addCells(tx, "append", myReceipts.map((r) => r.receiptCell), []);
    const txInfo = txInfoFrom({ tx, info });
    return addChange(txInfo, feeRate, walletConfig);
}
