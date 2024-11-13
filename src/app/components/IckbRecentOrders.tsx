import { WalletConfig } from "@/cores/config";
import React from "react";
import { IckbOrderItem } from "./IckbOrderItem";
import { IckbDateType } from "@/cores/utils";
import { IckbRecepitsItems } from "./IckbRecepitsItems";

const IckbRecentOrders: React.FC<{ walletConfig: WalletConfig, ickbData: IckbDateType }> = ({ walletConfig, ickbData }) => {
    return (
        <>
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-play font-bold mb-4">Active Orders</h3>
                <div className="border-b pb-2 border-white/20 py-2">
                    {(ickbData && ickbData.myOrders.length) ? ickbData.myOrders.map((item, index) => {
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
                    }) : 'no active orders'}
                </div>

                <div className="">
                    {(ickbData && ickbData.myReceipts.length) ? ickbData.myReceipts.map((item, index) => {
                        return (
                            <IckbRecepitsItems
                                walletConfig={walletConfig}
                                key={index}
                                item={
                                    {
                                        ickbAmount: item.ickbAmount,
                                        blockNumber: item.receiptCell.blockNumber

                                    }
                                }
                            />
                        )
                    }) : null}
                </div>

            </div>
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col flex-grow mt-4">
                <h3 className="text-xl font-play font-bold mb-4">Recent Orders</h3>
                <div ></div>
            </div>
        </>
    )
}
export default IckbRecentOrders;
