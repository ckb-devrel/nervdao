import React, { useEffect, useState } from "react";
import { ArrowUp, Download, Info } from "lucide-react";
import { WalletConfig } from "@/cores/config";
import { HexNumber } from "@ckb-lumos/base";
import { getHeadersByNumber } from "@/cores/queries";
import CircularProgress from "./CircularProgress";
import { CKB } from "@ickb/lumos-utils";

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
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
                <div className={item.isCkb2Udt ? "bg-cyan-600 rounded-full p-2 mr-3" : "bg-green-600 rounded-full p-2 mr-3"}>
                    {item.isCkb2Udt ? <Download className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}

                </div>
                <div>
                    <p className="text-white font-work-sans text-body-2 flex items-center"> {item.isCkb2Udt ? "Swap CKB to iCKB" : "Withdraw CKB from iCKB"}
                        <a data-tooltip-id="my-tooltip" data-tooltip-content="Order less than 100,000 iCKB relies on the 3rd-party market maker's participation">
                            <Info className="w-4 h-4 cursor-pointer ml-2" />
                        </a>
                    </p>
                    <p className="text-gray-400 font-work-sans text-sm">{orderDate}</p>
                </div>
            </div>
            <div className="text-white font-work-sans text-body-2 flex items-center" >
                <CircularProgress
                    percentage={parseFloat(((Number(item.progress) / Number(item.total)) * 100).toFixed(2))}
                    size={48}
                    strokeWidth={3}
                    progressColor={'#3CFF97'}
                />
                <div className="ml-4">
                    <p className="text-gray-400 flex items-center">{
                        (item.progress === item.total) ?
                            <>Complete
                                <a data-tooltip-id="my-tooltip" className="inline-flex" data-tooltip-content={`You can switch to the ${item.isCkb2Udt ? 'Withdraw' : ' Deposit'} tab to Melt`}>
                                    <Info className="w-4 h-4 cursor-pointer ml-2" />
                                </a></>
                            : 'Pending'}</p>
                    {/* <p className="text-2xl font-bold font-play mb-4">{ickbData ? toText(ickbData?.ckbAvailable):"-"} <span className="text-base font-normal">CKB</span></p> */}
                    <p className="text-base font-bold font-play ">
                        {parseFloat((Number(item.progress / CKB)).toString()).toFixed(2)}
                        /
                        {parseFloat((Number(item.total / CKB)).toString()).toFixed(2)}
                        {item.isCkb2Udt ? ' CKB' : ' iCKB'}</p>
                </div>


            </div>
        </div>
    );
}
