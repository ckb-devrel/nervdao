import React, { useState } from "react";
import { Tooltip } from "react-tooltip";
import IckbSwap from "./IckbSwap";
import { type WalletConfig } from "@/cores/config";
import IckbWithDraw from "./IckbWithDraw";

const IckbForm:   React.FC<{ walletConfig: WalletConfig }> = ({ walletConfig }) => {
    const [status, setStatus] = useState<string>("swap");
    return (
       <>
            {walletConfig &&
                <div className="bg-gray-900 rounded-lg p-6">
                    <div className="flex flex-row font-play mb-4 mt-4 border border-[#777] rounded-lg text-center">
                        <div className={`basis-1/2 py-4 rounded-l-lg cursor-pointer  ${status === 'swap' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => setStatus('swap')}>Swap</div>
                        <div className={`basis-1/2 py-4 rounded-r-lg cursor-pointer  ${status === 'withdraw' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => setStatus('withdraw')}>Withdraw</div>
                    </div>
                    {status === 'swap' ? <IckbSwap walletConfig={walletConfig} /> : <IckbWithDraw walletConfig={walletConfig} />}
                    <Tooltip id="my-tooltip" />
                </div>}
        </>
    );
};

export default IckbForm;
