import { WalletConfig } from "@/cores/config";
import React from "react";
import { IckbOrderItem } from "./IckbOrderItem";
import { IckbDateType } from "@/cores/utils";

const IckbRecentOrders: React.FC<{ walletConfig: WalletConfig, ickbData: IckbDateType }> = ({ walletConfig, ickbData }) => {
    return (
        <>
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-play font-bold mb-4">Recent Orders</h3>
                <div>
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
                    }) : 'No Recent orders'}
                </div>
            </div>
        </>
    )
}
export default IckbRecentOrders;
