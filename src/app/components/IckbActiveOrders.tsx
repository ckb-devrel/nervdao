import { WalletConfig } from "@/cores/config";
import React, { useEffect, useState } from "react";
import { IckbOrderItem } from "./IckbOrderItem";
import { IckbDateType } from "@/cores/utils";
import { IckbRecepitsItems } from "./IckbRecepitsItems";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import { TailSpin } from "react-loader-spinner";
import ReactDOMServer from "react-dom/server";
import { Info } from "lucide-react";
import IckbOrderInfo from "./IckbOrderInfo";
import { IckbModal } from "./IckbModal";

const IckbActiveOrders: React.FC<{ walletConfig: WalletConfig, ickbData: IckbDateType, onUpdate: VoidFunction }> = ({ walletConfig, ickbData, onUpdate }) => {
    const signerCcc = ccc.useSigner();

    const [meltTBC, setMeltTBC] = useState<boolean>(false);
    const [canMelt, setCanMelt] = useState<boolean>(false);
    const { showNotification, removeNotification } = useNotification();
    const [infoOpen, setInfoOpen] = useState(false);

    const handleMelt = async () => {
        const txMelt = ickbData?.txBuilder("melt", BigInt(0));
        if (!txMelt || !signerCcc) {
            return
        }
        let progressId, txHash;
        setMeltTBC(true)
        try {
            const cccTx = ccc.Transaction.fromLumosSkeleton(txMelt.tx);
            txHash = await signerCcc.sendTransaction(cccTx);
            progressId = await showNotification("progress", `Melt in progress, wait for 60s`);

            await signerCcc.client.waitTransaction(txHash, 0, 60000)
            removeNotification(progressId + '')

            onUpdate()
            // setMeltTBC(false)
            showNotification("success", `Melt Success: ${txHash}`);
        } catch (error) {
            showNotification("error", `${error}`);

        } finally {
            removeNotification(progressId + '')
            setMeltTBC(false)

        }
    }

    useEffect(() => {
        if (!ickbData) return;
        let canMelt = false
        if (ickbData.myOrders.length > 0) {
            ickbData.myOrders.map(item => {
                if (item.info.absTotal === item.info.absProgress) {
                    canMelt = true;
                } else {
                    canMelt = false
                }
            })
        }
        setCanMelt(canMelt)

    }, [ickbData, meltTBC]);
    return (
        <>
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col mb-4 flex-grow">
                <h3 className="text-xl font-play font-bold mb-4 flex items-center justify-between pr-4">
                    <span>Active Orders  
                    <a
                        className="hidden sm:inline-block "
                        data-tooltip-id="order-tooltip"
                        data-tooltip-html={ReactDOMServer.renderToStaticMarkup(IckbOrderInfo())}
                    >
                        <Info className="w-5 h-5 cursor-pointer ml-1 inline-block" />
                    </a>
                    <a
                        className="inline-block sm:hidden "
                        onClick={()=>{setInfoOpen(true)}}
                    >
                        <Info className="w-5 h-5 cursor-pointer ml-1 inline-block" />
                    </a>
                    </span>
                    {canMelt &&
                        <button
                            className="font-bold ml-2 bg-melt-gradient text-gray-800 text-body-2 w-[123px] h-[36px] rounded-lg hover:bg-melt-gradient-hover transition duration-200  disabled:melt-disabled-gradient disabled:hover:bg-btn-gradient hidden sm:block "

                            onClick={() => handleMelt()}
                            disabled={meltTBC}
                        >
                            {meltTBC && <TailSpin
                                height="12"
                                width="12"
                                color="#333333"
                                ariaLabel="tail-spin-loading"
                                radius="1"
                                wrapperStyle={{ 'display': 'inline-block', 'marginRight': '10px' }}
                                wrapperClass="inline-block"
                            />}
                            Melt all
                        </button>}
                </h3>
                <div className="pb-2  grid lg:grid-cols-2 gap-2">
                    {(ickbData && ickbData.myOrders.length) ?
                        <>
                            {ickbData.myOrders.map((item, index) => {
                                const multiplier = item.info.isCkb2Udt ? item.info.ckbToUdt.ckbMultiplier : item.info.udtToCkb.udtMultiplier;
                                return (
                                    <IckbOrderItem
                                        walletConfig={walletConfig}
                                        key={index}
                                        item={
                                            {
                                                total: item.info.absTotal / multiplier,
                                                progress: item.info.absProgress / multiplier,
                                                blockNumber: item.master.blockNumber,
                                                isCkb2Udt: item.info.isCkb2Udt,
                                            }
                                        }
                                    />

                                )
                            })}  
                        </> : 'no active orders'
                    }
               
                </div>
                {(ickbData && ickbData.myReceipts.length) ?
                    <div className="border-t border-white/20 py-2">
                        {ickbData.myReceipts.map((item, index) => {
                            return (
                                <IckbRecepitsItems
                                    walletConfig={walletConfig}
                                    key={index}
                                    item={
                                        {
                                            ickbAmount: item.ickbAmount,
                                            ckbAmount: item.ckbAmount,
                                            blockNumber: item.receiptCell.blockNumber
                                        }
                                    }
                                />
                            )
                        })}
                    </div>
                    : <></>}
                    {canMelt &&

                        <button
                            className="font-bold ml-2 bg-melt-gradient text-gray-800 text-body-2 w-full h-[44px] rounded-lg hover:bg-melt-gradient-hover transition duration-200 disabled:melt-disabled-gradient disabled:hover:bg-btn-gradient block sm:hidden "
                            onClick={() => handleMelt()}
                            disabled={meltTBC}
                        >
                            {meltTBC && <TailSpin
                                height="12"
                                width="12"
                                color="#333333"
                                ariaLabel="tail-spin-loading"
                                radius="1"
                                wrapperStyle={{ 'display': 'inline-block', 'marginRight': '10px' }}
                                wrapperClass="inline-block"
                            />}
                            Melt all
                        </button>}
            </div>
            {infoOpen&& <IckbModal isOpen={infoOpen} onClose={()=>setInfoOpen(false)} infos={IckbOrderInfo()} />}
             

        </>
    )
}
export default IckbActiveOrders;
