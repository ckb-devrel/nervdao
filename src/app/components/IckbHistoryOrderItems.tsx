import React from "react";
import { icons } from "lucide-react";
import { RecentOrder } from "@/cores/utils";
import { ccc } from "@ckb-ccc/connector-react";

interface IckbRecepitsItemProps {
    item: RecentOrder
}

export function IckbHistoryOrderItems({
    item
}: IckbRecepitsItemProps) {


    const iconColor = {
        order_withdraw: "bg-green-600",
        dao_deposit: "bg-cyan-600",
        dao_withdraw: "bg-green-600",
        order_deposit: "bg-cyan-600",

    }[item.operation];
    const actionText = {
        order_deposit: "Swap CKB to iCKB",
        order_withdraw: "Withdraw CKB from iCKB",
        dao_deposit: "Nervos DAO Deposit",
        dao_withdraw: "Nervos DAO Withdraw",
    }[item.operation];
    const Icon = {
        order_deposit: icons["ArrowUp"],
        order_withdraw: icons["Download"],
        dao_deposit: icons["ArrowUp"],
        dao_withdraw: icons["Download"],
    }[item.operation];

    return (
        <div className="flex items-center justify-between py-2 ">
            <div className="flex items-center">
                <div className={`${iconColor}  rounded-full p-2 mr-3`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-white font-work-sans text-body-2 flex items-center"> {actionText}

                    </p>
                    <p className="text-gray-400 font-work-sans text-sm">{new Date(Number(item.timestamp)).toLocaleString()}</p>
                </div>
            </div>
            <div className="text-white font-work-sans text-body-2 flex items-center" >
                <div className="mr-4">
                    <p className="text-base font-bold font-play ">
                        
                        {Number(ccc.fixedPointToString(item.amount)).toFixed(2)} {item.unit}
                        {/* {parseFloat((Number(item.amount / CKB)).toString()).toFixed(2)} {item.unit} */}
                    </p>
                </div>


            </div>
        </div>
    );
}
