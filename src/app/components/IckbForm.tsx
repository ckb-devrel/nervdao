import React, { useState } from "react";
import IckbSwap from "./IckbSwap";
import { type WalletConfig } from "@/cores/config";
import IckbWithDraw from "./IckbWithDraw";
import IckbStatus from "./IckbStatus";
import IckbRecentOrders from "./IckbRecentOrders";
import { useQuery } from "@tanstack/react-query";
import { l1StateOptions } from "@/cores/queries";

const IckbForm: React.FC<{ walletConfig: WalletConfig }> = ({ walletConfig }) => {
    const [status, setStatus] = useState<string>("swap");
    const { data: ickbData } = useQuery(
        l1StateOptions(walletConfig, !walletConfig.chain),
        
    );
    return (
        <>
            {ickbData && <>
                <div className="space-y-6 flex flex-col flex-1">
                    <div className="bg-gray-900 rounded-lg p-6">
                        <div className="flex flex-row font-play mb-4 mt-4 border border-[#777] rounded-lg text-center">
                            <div className={`basis-1/2 py-4 rounded-l-lg cursor-pointer  ${status === 'swap' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => setStatus('swap')}>Swap</div>
                            <div className={`basis-1/2 py-4 rounded-r-lg cursor-pointer  ${status === 'withdraw' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => setStatus('withdraw')}>Withdraw</div>
                        </div>
                        {status === 'swap' ? <IckbSwap ickbData={ickbData} /> : <IckbWithDraw ickbData={ickbData} />}
                    </div>
                </div>
                <div className="flex-1 flex-row">
                    {walletConfig && <IckbStatus ickbData={ickbData} />}
                    {walletConfig && <IckbRecentOrders ickbData={ickbData} walletConfig={walletConfig} />}
                </div>
            </>
            }
        </>
    );
};

export default IckbForm;
