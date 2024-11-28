import React, { useState } from "react";
import IckbDeposit from "./IckbDeposit";
import { type WalletConfig } from "@/cores/config";
import IckbWithDraw from "./IckbWithdraw";
import IckbStatus from "./IckbStatus";
import { useQuery } from "@tanstack/react-query";
import { l1StateOptions } from "@/cores/queries";
import { IckbMaturityItems } from "./IckbMaturityItems";
import IckbActiveOrders from "./IckbActiveOrders";
import IckbHistoryOrders from "./IckbHistoryOrders";

const IckbForm: React.FC<{ walletConfig: WalletConfig }> = ({ walletConfig }) => {
    const [status, setStatus] = useState<string>("deposit");
    const { data: ickbData, refetch } = useQuery(
        l1StateOptions(!walletConfig.chain),

    );

    const handleChildEvent = () => {
        refetch()
    }
    return (
        <>
            {ickbData && <>
                <div className="space-y-6 flex flex-col flex-1">
                    <div className="bg-gray-900 rounded-lg p-6">
                        <div className="flex flex-row font-play mb-4 mt-4 border border-[#777] rounded-lg text-center">
                            <div className={`basis-1/2 py-4 rounded-l-lg cursor-pointer  ${status === 'deposit' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => setStatus('deposit')}>Deposit</div>
                            <div className={`basis-1/2 py-4 rounded-r-lg cursor-pointer  ${status === 'withdraw' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => setStatus('withdraw')}>Withdraw</div>
                        </div>
                        <div className={status === 'deposit' ? 'block' : 'hidden'}><IckbDeposit ickbData={ickbData} onUpdate={handleChildEvent} /></div>
                        <div className={status !== 'deposit' ? 'block' : 'hidden'}><IckbWithDraw ickbData={ickbData} onUpdate={handleChildEvent} /></div>

                    </div>
                    {(ickbData && ickbData.myMaturity.length) ?
                        <div className="bg-gray-900 rounded-lg p-6 flex flex-col  mt-6">
                            <h3 className="text-xl font-play font-bold mb-4">Pending Nervos DAO Withdraw</h3>
                            <div>
                                {ickbData.myMaturity.map((item, index) => {
                                    return (
                                        <IckbMaturityItems
                                            walletConfig={walletConfig}
                                            key={index}
                                            item={
                                                item
                                            }
                                        />
                                    )
                                })}
                            </div>
                        </div>
                        : <></>}
                </div>
                <div className="flex-1 flex-row">
                    <IckbActiveOrders  ickbData={ickbData} walletConfig={walletConfig} onUpdate={handleChildEvent} />
                    <IckbStatus ickbData={ickbData} />
                    {walletConfig && <IckbHistoryOrders  walletConfig={walletConfig}  />}
                </div>
            </>
            }
        </>
    );
};

export default IckbForm;
