import React, { useEffect, useState } from "react";
import { Download, Info } from "lucide-react";
import { WalletConfig } from "@/cores/config";
import { HexNumber } from "@ckb-lumos/base";
import { getHeadersByNumber } from "@/cores/queries";
import { CKB } from "@ickb/lumos-utils";

interface IckbRecepitsItemProps {
    walletConfig: WalletConfig
    item: {
        ickbAmount: bigint;
        ckbAmount: bigint;
        blockNumber: string | undefined;
    }
}
export function IckbRecepitsItems({
    walletConfig, item
}: IckbRecepitsItemProps) {
    const [orderDate, setOrderDate] = useState<string>('')
    useEffect(() => {
        const refresh = async () => {
            const hexArray: Set<HexNumber> = new Set();

            if (item.blockNumber) {
                hexArray.add(item.blockNumber)
                const header = await getHeadersByNumber(hexArray, walletConfig)
                const timer = header.get(item.blockNumber)?.timestamp;
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
                    <p className="text-white font-work-sans flex items-center"> <span>Deposit into Nervos DAO</span>
                        <a data-tooltip-id="my-tooltip" data-tooltip-content="Order more than 100,000 iCKB will directly deposit into Nervos DAO">
                            <Info className="w-4 h-4 cursor-pointer ml-2" />
                        </a>
                    </p>
                    <p className="text-gray-400 font-work-sans text-sm">{orderDate}</p>
                </div>
            </div>
            <div className="text-white font-work-sans text-body-2 flex items-center" >
                <div className="mr-4">
                    <p className="text-base font-bold font-play ">
                        {parseFloat((Number(item.ckbAmount / CKB)).toString()).toFixed(2)} CKB
                    </p>
                </div>


            </div>
        </div>
    );
}
