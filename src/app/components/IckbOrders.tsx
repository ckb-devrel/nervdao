import { WalletConfig } from "@/cores/config";
import React, { useEffect } from "react";
import { IckbOrderItem } from "./IckbOrderItem";
import { IckbDateType, RecentOrder } from "@/cores/utils";
import { IckbRecepitsItems } from "./IckbRecepitsItems";
import { ccc } from "@ckb-ccc/connector-react";
import { getRecentIckbOrders } from "@/cores/queries";
import { IckbHistoryOrderItems } from "./IckbHistoryOrderItems";

const IckbOrders: React.FC<{ walletConfig: WalletConfig, ickbData: IckbDateType }> = ({ walletConfig, ickbData }) => {
    const signerCcc = ccc.useSigner();
    const [limit, setLimit] = React.useState(5);
    const [txs, setTxs] = React.useState<RecentOrder[]>([]);
    const [txGenerator, setTxGenerator] = React.useState<
        AsyncGenerator | undefined
    >(undefined);
    useEffect(() => {
        if (!signerCcc) { return }
        const { config } = walletConfig;

        // setTxs([]);
        // setLimit(5);
        setTxGenerator(getRecentIckbOrders(signerCcc, config));

        // const refresh = async () => {
        //     let orders = []
        //     for await (const data of getRecentIckbOrders(signerCcc, config)) {
        //         orders.push(data)
        //     }
        //     setTxs(orders)
        // };
        // refresh()
        // const interval = setInterval(refresh, 15000);
        // return () => clearInterval(interval);


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




    return (
        <>
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-play font-bold mb-4">Active Orders</h3>
                {(ickbData && ickbData.myOrders.length) ?
                    <div className="border-b pb-2 border-white/20 py-2">

                        {ickbData.myOrders.map((item, index) => {
                            const multiplier = item.info.isCkb2Udt ? item.info.ckbToUdt.ckbMultiplier : item.info.udtToCkb.udtMultiplier;
                            return (

                                <IckbOrderItem
                                    walletConfig={walletConfig}
                                    key={index}
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
            </div>
            {(ickbData && ickbData.myReceipts.length) ? ickbData.myReceipts.map((item, index) => {
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
            }) : <></>}



        </>
    )
}
export default IckbOrders;
