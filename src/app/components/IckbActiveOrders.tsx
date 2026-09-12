import { WalletConfig } from "@/cores/config";
import React, { useEffect, useState } from "react";
import { IckbOrderItem } from "./IckbOrderItem";
import { IckbDateType } from "@/cores/utils";
import { IckbRecepitsItems } from "./IckbRecepitsItems";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import ReactDOMServer from "react-dom/server";
import { Info } from "lucide-react";
import IckbOrderInfo from "./IckbOrderInfo";
import { IckbModal } from "./IckbModal";
import { useTranslation } from "react-i18next";
import { formatError } from "@/utils/errorUtils";
import { ButtonLoadingContent } from "./ButtonLoadingContent";

const IckbActiveOrders: React.FC<{ walletConfig: WalletConfig, ickbData: IckbDateType, onUpdate: VoidFunction }> = ({ walletConfig, ickbData, onUpdate }) => {
    const signerCcc = ccc.useSigner();
    const { t } = useTranslation();
    const [meltTBC, setMeltTBC] = useState<boolean>(false);
    const [canMelt, setCanMelt] = useState<boolean>(false);
    const { showNotification, removeNotification } = useNotification();
    const [infoOpen, setInfoOpen] = useState(false);

    const handleMelt = async () => {
        const txMelt = ickbData?.txBuilder("melt", BigInt(0));
        if (!txMelt || !signerCcc || meltTBC) {
            return
        }
        setMeltTBC(true)
        let progressId: string | undefined;
        try {
            const cccTx = ccc.Transaction.fromLumosSkeleton(txMelt.tx);
            const txHash = await signerCcc.sendTransaction(cccTx);
            progressId = showNotification("progress", t("ickbActiveOrders.meltInProgress"));

            await signerCcc.client.waitTransaction(txHash, 0, 60000)

            onUpdate()
            // setMeltTBC(false)
            showNotification("success", t("ickbActiveOrders.meltSuccess", { hash: txHash }));
        } catch (error) {
            showNotification("error", formatError(error));

        } finally {
            if (progressId) removeNotification(progressId)
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
                    <span className="flex items-center">{t("ickbActiveOrders.activeOrders")}
                    <a
                        className="hidden sm:flex"
                        data-tooltip-id="order-tooltip"
                        data-tooltip-html={ReactDOMServer.renderToStaticMarkup(IckbOrderInfo({ whatAreActiveOrders: t("ickbOrderInfo.whatAreActiveOrders"), desc: t("ickbOrderInfo.desc"), pendingOrders: t("ickbOrderInfo.pendingOrders"), pendingOrdersDesc: t("ickbOrderInfo.pendingOrdersDesc"), completedOrders: t("ickbOrderInfo.completedOrders"), completedOrdersDesc: t("ickbOrderInfo.completedOrdersDesc"), tip: t("ickbOrderInfo.tip"), tipDesc: t("ickbOrderInfo.tipDesc") }))}
                    >
                        <Info className="w-5 h-5 cursor-pointer ml-1 inline-block" />
                    </a>
                    <a
                        className="flex sm:hidden"
                        onClick={()=>{setInfoOpen(true)}}
                    >
                        <Info className="w-5 h-5 cursor-pointer ml-1 inline-block" />
                    </a>
                    </span>
                    {canMelt &&
                        <button
                            className="ml-2 hidden h-[36px] w-[123px] items-center justify-center rounded-lg bg-melt-gradient font-bold text-body-2 text-gray-800 transition duration-200 hover:bg-melt-gradient-hover disabled:melt-disabled-gradient disabled:hover:bg-btn-gradient sm:flex"

                            onClick={() => handleMelt()}
                            disabled={meltTBC}
                        >
                            {meltTBC ? (
                                <ButtonLoadingContent size={12}>
                                    {t("ickbActiveOrders.extract")}
                                </ButtonLoadingContent>
                            ) : t("ickbActiveOrders.extract")}
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
                        </> : t("ickbActiveOrders.noActiveOrders")
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
                            className="flex h-[44px] w-full items-center justify-center rounded-lg bg-melt-gradient font-bold text-body-2 text-gray-800 transition duration-200 hover:bg-melt-gradient-hover disabled:melt-disabled-gradient disabled:hover:bg-btn-gradient sm:ml-2 sm:hidden"
                            onClick={() => handleMelt()}
                            disabled={meltTBC}
                        >
                            {meltTBC ? (
                                <ButtonLoadingContent size={12}>
                                    {t("ickbActiveOrders.meltAll")}
                                </ButtonLoadingContent>
                            ) : t("ickbActiveOrders.meltAll")}
                        </button>}
            </div>
            {infoOpen&& <IckbModal isOpen={infoOpen} onClose={()=>setInfoOpen(false)} infos={IckbOrderInfo({ whatAreActiveOrders: t("ickbOrderInfo.whatAreActiveOrders"), desc: t("ickbOrderInfo.desc"), pendingOrders: t("ickbOrderInfo.pendingOrders"), pendingOrdersDesc: t("ickbOrderInfo.pendingOrdersDesc"), completedOrders: t("ickbOrderInfo.completedOrders"), completedOrdersDesc: t("ickbOrderInfo.completedOrdersDesc"), tip: t("ickbOrderInfo.tip"), tipDesc: t("ickbOrderInfo.tipDesc") })} />}
             

        </>
    )
}
export default IckbActiveOrders;
