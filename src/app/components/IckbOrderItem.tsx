import React, { useEffect, useState } from "react";
import { WalletConfig } from "@/cores/config";
import { HexNumber } from "@ckb-lumos/base";
import { getHeadersByNumber } from "@/cores/queries";
import { ccc } from "@ckb-ccc/connector-react";
import { useTranslation } from "react-i18next";
interface IckbOrderItemItemProps {
    walletConfig: WalletConfig
    item: {
        total: bigint;
        progress: bigint;
        blockNumber: string | undefined;
        isCkb2Udt: boolean;
    }
}
export function IckbOrderItem({
    walletConfig, item
}: IckbOrderItemItemProps) {
    const [orderDate, setOrderDate] = useState<string>('')
    const { t } = useTranslation();
    useEffect(() => {
       
        if(!item||!walletConfig) return 
        const refresh = async () => {
            console.log(walletConfig)
            const hexArray: Set<HexNumber> = new Set();

            if (item.blockNumber) {
                hexArray.add(item.blockNumber)
                console.log(1111,hexArray)
                const header = await getHeadersByNumber(hexArray, walletConfig)
                const timer = header.get(item.blockNumber)?.timestamp;
                timer && setOrderDate(new Date(parseInt(timer, 16)).toLocaleString())
            }
        };
        refresh();
    }, []);

    return (
        <div className="bg-gray-800 rounded-lg p-4 ">
            <div className="flex items-center justify-between">
                <span className="text-white text-body-2">{item.isCkb2Udt ? t("ickbOrderItem.youSwap") : t("ickbOrderItem.youWithdraw")}</span>
                {item.progress === item.total ?
                    <span className="px-2 py-0.5 rounded text-xs bg-green-500/[.12] rounded text-green-500" >{t("ickbOrderItem.completed")}</span>
                    :
                    <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/[.12] rounded text-yellow-500">{t("ickbOrderItem.pending")}</span>
                }
            </div>
            <div className="text-2xl font-bold text-white mb-4">
            {Number(ccc.fixedPointToString(item.total)).toFixed(2)} 
                {item.isCkb2Udt ? ' CKB' : ' iCKB'}</div>
            <div className="divide-y divide-white-200">
                <p className="text-white font-work-sans mb-2 flex items-center">
                    {item.isCkb2Udt ? t("ickbOrderItem.swapCkbToIckb") : t("ickbOrderItem.withdrawCkbFromIckb")}
                </p>
                <p className="text-gray-400 font-work-sans  pt-2 text-sm">{orderDate}</p>
            </div>

        </div>
    );
}
