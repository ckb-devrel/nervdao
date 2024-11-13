import React, { useEffect, useState } from "react";
import { Download, Info } from "lucide-react";
import { HexNumber } from "@ckb-lumos/base";
import { getHeadersByNumber } from "@/cores/queries";
import { CKB } from "@ickb/lumos-utils";

interface IckbRecepitsItemProps {
    item: {
        ckbAmount: bigint;
        waitTime: string;
    }
}
export function IckbMaturityItems({
     item
}: IckbRecepitsItemProps) {
    
    return (
        <div className="flex items-center justify-between py-2 ">
            <div className="flex items-center">
                <div className={"bg-green-600 rounded-full p-2 mr-3"}>
                    <Download className="w-4 h-4" />

                </div>
                <div>
                    <p className="text-white font-work-sans text-body-2 flex items-center"> Maturity CKB
                        <a data-tooltip-id="my-tooltip" data-tooltip-content="More than 100,000 iCKB will deposit to NervDao">
                            <Info className="w-4 h-4 cursor-pointer ml-2" />
                        </a>
                    </p>
                    <p className="text-gray-400 font-work-sans text-sm">{item.waitTime}</p>
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
