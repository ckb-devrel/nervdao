import { WalletConfig } from "@/cores/config";
import React, { useEffect, useState } from "react";
import { IckbOrderItem } from "./IckbOrderItem";
import { IckbDateType, RecentOrder } from "@/cores/utils";
import { IckbRecepitsItems } from "./IckbRecepitsItems";
import { ccc } from "@ckb-ccc/connector-react";
import { getRecentIckbOrders } from "@/cores/queries";
import { IckbHistoryOrderItems } from "./IckbHistoryOrderItems";
import { useNotification } from "@/context/NotificationProvider";
import { TailSpin } from "react-loader-spinner";

const IckbOrders: React.FC<{ walletConfig: WalletConfig, ickbData: IckbDateType, onUpdate: VoidFunction }> = ({ walletConfig, ickbData, onUpdate }) => {
    const signerCcc = ccc.useSigner();
    const [limit, setLimit] = React.useState(5);
    const [txs, setTxs] = React.useState<RecentOrder[]>([]);
    const [txGenerator, setTxGenerator] = React.useState<
        AsyncGenerator | undefined
    >(undefined);
    const [meltTBC, setMeltTBC] = useState<boolean>(false);
    const [canMelt, setCanMelt] = useState<boolean>(false);
    const { showNotification, removeNotification } = useNotification();

    const handleMelt = async () => {
        const txMelt = ickbData?.txBuilder("melt", BigInt(0));
        if (!txMelt || !signerCcc) {
            return
        }
        let progressId, txHash;
        setMeltTBC(true)
        try {
            const cccTx = ccc.Transaction.fromLumosSkeleton(txMelt.tx);
            txHash = await signerCcc.sendTransaction(cccTx);
            progressId = await showNotification("progress", `Melt in progress, wait for 60s`);

            await signerCcc.client.waitTransaction(txHash, 0, 60000)
            removeNotification(progressId + '')

            onUpdate()
            // setMeltTBC(false)
            showNotification("success", `Melt Success: ${txHash}`);
        } catch (error) {
            showNotification("error", `${error}`);

        } finally {
            removeNotification(progressId + '')
            setMeltTBC(false)

        }
    }
    useEffect(() => {
        if (!signerCcc) { return }
        const { config } = walletConfig;

        setTxs([]);
        setLimit(5);
        setTxGenerator(getRecentIckbOrders(signerCcc, config));

        const refresh = async () => {
            setTxs((txs) => {
                if (txs.length === 0) {
                    return txs;
                }

                (async () => {
                    for await (const data of getRecentIckbOrders(signerCcc, config)) {
                        if (!data) { return }

                        if (txs.find((t) => t.timestamp === data?.timestamp)) {
                            break;
                        }

                        setTxs((txs) => {
                            if (txs.find((t) => t.timestamp === data?.timestamp)) {
                                return txs;
                            }
                            return [data, ...txs];
                        });
                    }
                })();

                return txs;
            });
        };
        refresh()
        const interval = setInterval(refresh, 15000);
        return () => clearInterval(interval);


    }, [signerCcc]);
    useEffect(() => {
        if (!txGenerator || !signerCcc || txs.length >= limit) {
            return;
        }

        (async () => {
            const { value, done } = await txGenerator.next();
            if (done) {
                setTxGenerator(undefined);
                return;
            }
            if (!value) {
                return;
            }
            //@ts-expect-error 暂时屏蔽
            setTxs((txs) => [...txs, value]);
        })();
    }, [txGenerator, limit, txs, signerCcc]);
    useEffect(() => {
        if (!ickbData) return;
        let canMelt = false
        if (ickbData.myOrders.length > 0) {
            ickbData.myOrders.map(item => {
                if (item.info.absTotal === item.info.absProgress) {
                    canMelt = true;
                } else {
                    canMelt = false
                }
            })
        }

        setCanMelt(canMelt)

    }, [ickbData, meltTBC]);
    return (
        <>
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-play font-bold mb-4 flex items-center justify-between pr-4">Active Orders
                    {canMelt &&
                        <button
                            className="font-bold ml-2 bg-btn-gradient text-gray-800 text-body-2  py-1 px-4 rounded-lg hover:bg-btn-gradient-hover transition duration-200 disabled:opacity-50 disabled:hover:bg-btn-gradient"
                            onClick={() => handleMelt()}
                            disabled={meltTBC}
                        >
                            {meltTBC && <TailSpin
                                height="12"
                                width="12"
                                color="#333333"
                                ariaLabel="tail-spin-loading"
                                radius="1"
                                wrapperStyle={{ 'display': 'inline-block', 'marginRight': '10px' }}
                                wrapperClass="inline-block"
                            />}
                            Melt
                        </button>}
                </h3>
                {(ickbData && ickbData.myOrders.length) ?
                    <div className={" py-2"}>

                        {ickbData.myOrders.map((item, index) => {
                            const multiplier = item.info.isCkb2Udt ? item.info.ckbToUdt.ckbMultiplier : item.info.udtToCkb.udtMultiplier;
                            return (

                                <IckbOrderItem
                                    walletConfig={walletConfig}
                                    key={index}
                                    ickbData={ickbData}
                                    onUpdate={onUpdate}
                                    item={
                                        {
                                            total: item.info.absTotal / multiplier,
                                            progress: item.info.absProgress / multiplier,
                                            blockNumber: item.master.blockNumber,
                                            isCkb2Udt: item.info.isCkb2Udt,
                                        }
                                    }
                                />

                            )
                        })} </div> : 'no active orders'}

                {(ickbData && ickbData.myReceipts.length) ?
                    <div className="border-t border-white/20 py-2">
                        {ickbData.myReceipts.map((item, index) => {
                            return (
                                <IckbRecepitsItems
                                    walletConfig={walletConfig}
                                    key={index}
                                    item={
                                        {
                                            ickbAmount: item.ickbAmount,
                                            ckbAmount: item.ckbAmount,
                                            blockNumber: item.receiptCell.blockNumber
                                        }
                                    }
                                />
                            )
                        })}
                    </div>
                    : <></>}
            </div>
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col flex-grow mt-6 text-left">
                <h3 className="text-xl font-play font-bold mb-4">Recent Orders</h3>
                {txs && txs.length > 0 ? <>
                    {txs.map((item, index) => {
                        return (
                            <IckbHistoryOrderItems
                                key={index}
                                item={item}

                            />
                        )
                    })}
                    {txGenerator ? (
                        <button
                            className="text-cyan-400 mt-4 hover:underline"
                            onClick={() => setLimit(limit + 5)}
                        >
                            View all history
                        </button>
                    ) : undefined}</>
                    : <div className={`flex flex-grow items-center justify-center bg-gray-800 rounded-lg p-4`}>
                        <p className="text-gray-400">No recent transactions</p>
                    </div>}
            </div>

        </>
    )
}
export default IckbOrders;
