import { WalletConfig } from "@/cores/config";
import React from "react";
import { IckbOrderItem } from "./IckbOrderItem";
import { IckbDateType } from "@/cores/utils";
import { IckbRecepitsItems } from "./IckbRecepitsItems";

const IckbOrders: React.FC<{ walletConfig: WalletConfig, ickbData: IckbDateType }> = ({ walletConfig, ickbData }) => {
    
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
