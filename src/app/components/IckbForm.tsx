// import React, { useEffect, useState } from "react";
// import IckbSwap from "./IckbSwap";
// import { setupWalletConfig, type WalletConfig } from "@/cores/config";
// import IckbWithDraw from "./IckbWithDraw";
// import IckbStatus from "./IckbStatus";
// import IckbRecentOrders from "./IckbRecentOrders";
// import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
// import { l1StateOptions } from "@/cores/queries";
// import { ccc } from "@ckb-ccc/connector-react";

// const IckbForm: React.FC = () => {
//     const [status, setStatus] = useState<string>("swap");
//     const [walletConfig, setWalletConfig] = useState<WalletConfig>();
//     const [ickbDataAll, setIckbDataAll] = useState();
    
//     const queryClient = useQueryClient();
//     console.log(walletConfig)
//     const { data: ickbData } = useQuery(
//         //@ts-expect-error '0xstring&&string'
//         l1StateOptions(walletConfig, !walletConfig?.chain),
//     );
//     const signer = ccc.useSigner()
//     useEffect(() => {
//       if (!signer) return;
  
//       (async () => {
//         const walletConfig = await setupWalletConfig(signer)
  
//         const setupConfig = {
//           ...walletConfig,
//           queryClient:queryClient
//         }
//         console.log('获取walletConfig')
//         //@ts-expect-error '0xstring&&string'
//         setWalletConfig(setupConfig)
//         console.log(2)
//       })();
//     }, [signer]);
//     // const IckbSwapMemo = React.memo(IckbSwap)
//     // const IckbWithDrawMemo = React.memo(IckbWithDraw)
//     return (
//         <>
//             {ickbData && <>
            
//                 <div className="space-y-6 flex flex-col flex-1">
//                     <div className="bg-gray-900 rounded-lg p-6">
//                         <div className="flex flex-row font-play mb-4 mt-4 border border-[#777] rounded-lg text-center">
//                             <div className={`basis-1/2 py-4 rounded-l-lg cursor-pointer  ${status === 'swap' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => setStatus('swap')}>Swap</div>
//                             <div className={`basis-1/2 py-4 rounded-r-lg cursor-pointer  ${status === 'withdraw' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => setStatus('withdraw')}>Withdraw</div>
//                         </div>
//                         {status === 'swap' ? <IckbSwap ickbData={ickbData} /> : <IckbWithDraw ickbData={ickbData} />}
//                     </div>
//                 </div>
//                 <div className="flex-1 flex-row">
//                    {walletConfig && <IckbStatus ickbData={ickbData} />}
//                     {/* {walletConfig && <IckbRecentOrders ickbData={ickbData} walletConfig={walletConfig} />}  */}
//                 </div>
//             </>
//             }
//         </>
//     );
// };

// export default IckbForm;
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
    const { data: ickbData ,refetch} = useQuery(
        l1StateOptions(!walletConfig.chain),
        
    );
    const handleChildEvent = ()=>{
        refetch()
    }
    console.log(ickbData)
    return (
        <>
            {ickbData && <>
                <div className="space-y-6 flex flex-col flex-1">
                    <div className="bg-gray-900 rounded-lg p-6">
                        <div className="flex flex-row font-play mb-4 mt-4 border border-[#777] rounded-lg text-center">
                            <div className={`basis-1/2 py-4 rounded-l-lg cursor-pointer  ${status === 'swap' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => setStatus('swap')}>Swap</div>
                            <div className={`basis-1/2 py-4 rounded-r-lg cursor-pointer  ${status === 'withdraw' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => setStatus('withdraw')}>Withdraw</div>
                        </div>
                        {status === 'swap' ? <IckbSwap ickbData={ickbData}  onUpdate={handleChildEvent} /> : <IckbWithDraw  onUpdate={handleChildEvent} ickbData={ickbData} />}
                    </div>
                </div>
                <div className="flex-1 flex-row">
                    <IckbStatus ickbData={ickbData} />
                    {walletConfig && <IckbRecentOrders ickbData={ickbData} walletConfig={walletConfig} />}
                </div>
            </>
            }
        </>
    );
};

export default IckbForm;