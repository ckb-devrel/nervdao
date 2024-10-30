import { WalletConfig } from "@/cores/config";
import { l1StateOptions } from "@/cores/queries";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { IckbOrderItem } from "./IckbOrderItem";
import { toText } from "@/utils/stringUtils";

const IckbRecentOrders: React.FC<{ walletConfig: WalletConfig }> = ({ walletConfig }) => {

    const { data: ickbData } = useQuery(
        l1StateOptions(walletConfig, false),
    );

    return (
        <>
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-play font-bold mb-4">Recent Orders</h3>
                <div>
                    {(ickbData && ickbData.myOrders.length) ? ickbData.myOrders.map((item, index) => {
                        return (
                            <IckbOrderItem 
                            walletConfig={walletConfig} 
                            key={index} 
                            item={
                                { 
                                    total: item.info.absTotal,
                                    progress: item.info.absProgress,
                                    blockNumber: item.master.blockNumber, 
                                    isCkb2Udt: item.info.isCkb2Udt,
                                    pendingIckb:toText(item.info.udtAmount),
                                    pendingCkb:toText(item.info.ckbUnoccupied)
                                }
                            }
                            />
                        )
                    }):'No Recent Orders'}



                </div>
            </div>
        </>
    )
}
export default IckbRecentOrders;
