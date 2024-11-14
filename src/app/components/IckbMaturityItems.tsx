import React, { useEffect, useState } from "react";
import { Download, Info } from "lucide-react";
import { HexNumber } from "@ckb-lumos/base";
import { getHeadersByNumber } from "@/cores/queries";
import { CKB, I8Cell } from "@ickb/lumos-utils";
import { WalletConfig } from "@/cores/config";
type MyMaturity = {
    daoCell: I8Cell;
    ckbAmount: bigint;
    waitTime: string;
}
interface IckbRecepitsItemProps {
    walletConfig: WalletConfig,

    item: MyMaturity
}
export function IckbMaturityItems({
    item, walletConfig
}: IckbRecepitsItemProps) {
    const [orderDate, setOrderDate] = useState<string>('')
    useEffect(() => {
        const refresh = async () => {
            const hexArray: Set<HexNumber> = new Set();

            if (item.daoCell.blockNumber) {
                hexArray.add(item.daoCell.blockNumber)
                const header = await getHeadersByNumber(hexArray, walletConfig)
                const timer = header.get(item.daoCell.blockNumber)?.timestamp;
                timer && setOrderDate(new Date(parseInt(timer, 16)).toLocaleString())
            }
        };
        refresh();
    }, [item, walletConfig]);
    return (
        <div className="flex items-center justify-between py-2 ">
            <div className="flex items-center">
                <div className={"bg-green-600 rounded-full p-2 mr-3"}>
                    <Download className="w-4 h-4" />

                </div>
                <div>
                    <p className="text-white font-work-sans text-body-2 flex items-center"> Withdraw from Nervos DAO
                        <a data-tooltip-id="my-tooltip" data-tooltip-content="Order more than 100,000 iCKB will directly withdraw from Nervos DAO">
                            <Info className="w-4 h-4 cursor-pointer ml-2" />
                        </a>
                    </p>
                    <p className="text-gray-400 font-work-sans text-sm">{orderDate}</p>
                </div>
            </div>
            <div className="text-white font-work-sans text-body-2 flex items-center" >
                <div className="mr-4">
                    <p className="text-base font-bold font-play ">
                        {parseFloat((Number(item.ckbAmount / CKB)).toString()).toFixed(2)} CKB {item.waitTime}
                    </p>
                </div>


            </div>
        </div>
    );
}
