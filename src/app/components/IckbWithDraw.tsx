import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import { ickb2Ckb, MyOrder } from "@ickb/v1-core";
import { Info, TriangleAlert } from "lucide-react";
import { toText } from "@/utils/stringUtils";
import { IckbDateType } from "@/cores/utils";
import { CKB } from "@ickb/lumos-utils";
import { callMelt } from "@/cores/queries";


const IckbWithDraw: React.FC<{ ickbData: IckbDateType, onUpdate: VoidFunction }> = ({ ickbData, onUpdate }) => {
    const [amount, setAmount] = useState<string>("");
    const [pendingBalance, setPendingBalance] = useState<string>("0");
    const [canMelt, setCanMelt] = useState<boolean>(false);
    const [meltTBC, setMeltTBC] = useState<boolean>(false);
    const [transTBC, setTransTBC] = useState<boolean>(false);
    const txInfo = (ickbData && amount.length > 0) ? ickbData?.txBuilder(false, ccc.fixedPointFrom(amount)) : null;

    const signerCcc = ccc.useSigner();
    // const pendingIckbs = ickbData?ickbData.myOrders;
    const { showNotification, removeNotification } = useNotification();
    async function handleWithDraw() {
        if (!txInfo || !signerCcc) {
            return
        }
        let progressId, txHash
        try {
            const cccTx = ccc.Transaction.fromLumosSkeleton(txInfo.tx);
            txHash = await signerCcc.sendTransaction(cccTx);
            setTransTBC(true)
            progressId = await showNotification("progress", `WithDraw in progress!`);
            await signerCcc.client.waitTransaction(txHash)
            showNotification("success", `WithDraw Success: ${txHash}`);
            onUpdate()
        } catch (error) {
            showNotification("error", `WithDraw Error: ${error}`);
        } finally {
            removeNotification(progressId + '')
            setAmount("")
            setTransTBC(false)
        }
    }

    function approxConversion(
        amount: bigint,
    ) {
        if (!ickbData?.tipHeader) {
            return
        }
        let [convertedAmount] = [ickb2Ckb(amount, ickbData?.tipHeader)]
        //Worst case scenario is a 0.1% fee for bot
        convertedAmount -= convertedAmount / BigInt(1000);
        return `${toText(convertedAmount)}`;
    }

    const handleMax = async () => {
        if (!ickbData) return;
        setAmount(ccc.fixedPointToString(ickbData?.ickbUdtAvailable));
    };
    const handleAmountChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {

        if (!/^-?\d+(\.\d+)?$/.test(e.target.value + '')) {
            return
        }
        setAmount(e.target.value)
    }
    const handleMelt = async (orders: MyOrder[]) => {
        const txMelt = await callMelt(orders)
        if (!txMelt || !signerCcc) {
            return
        }
        let progressId, txHash;
        setMeltTBC(true)
        try {
            const cccTx = ccc.Transaction.fromLumosSkeleton(txMelt.tx);
            txHash = await signerCcc.sendTransaction(cccTx);
            progressId = await showNotification("progress", `Melt in progress!`);

            await signerCcc.client.waitTransaction(txHash)
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
        if (!ickbData || ickbData?.myOrders.length < 1) return;
        let pending = 0;
        let canMelt = false
        ickbData.myOrders.map(item => {
            pending += ickbData.myOrders[0].info.isCkb2Udt ? Number(item.info.absProgress / CKB / CKB) : 0;
            (item.info.absTotal === item.info.absProgress) ? (canMelt = true) : (canMelt = false)
        })
        setCanMelt(canMelt && ickbData.myOrders[0].info.isCkb2Udt)
        setPendingBalance(toText(BigInt(pending)) || '-');

    }, [ickbData, meltTBC]);
    return (
        <>
            <div className="flex flex-row font-play mb-4 mt-8 text-left">
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center"><span className="w-2 h-2 bg-green-500 mr-2"></span>Withdrawable iCKB</p>
                    <p className="text-2xl font-bold font-play mb-4">{(ickbData && ickbData.ckbAvailable !== BigInt(3) * CKB * CKB) ? toText(ickbData?.ickbUdtAvailable) : '-'} <span className="text-base font-normal">iCKB</span></p>
                </div>
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center">
                        <span className={"w-2 h-2 bg-yellow-500 mr-2"}></span>
                        Pending
                    </p>
                    <p className="text-2xl font-bold font-play mb-4 flex  items-center">
                        <span>
                            {pendingBalance} <span className="text-base font-normal">iCKB</span>
                        </span>
                        {ickbData && canMelt &&
                            <button
                                className="font-bold ml-2 bg-btn-gradient text-gray-800 text-body-2 py-1 px-2 rounded-lg hover:bg-btn-gradient-hover transition duration-200 disabled:opacity-50 disabled:hover:bg-btn-gradient"
                                onClick={() => handleMelt(ickbData.myOrders)}
                            >
                                Melt
                            </button>
                        }
                    </p>
                </div>
            </div>
            <div className='relative mb-4 flex'>
                {/* <label className="flex px-2 items-center"><img src="/svg/icon-ckb.svg" alt="CKB" className="mr-2" /> CKB</label> */}
                <input className="w-full text-left rounded border no-arrows  border-[#777] bg-gray-700  hover:border-cyan-500 focus:border-cyan-500  text-lg p-3 mt-1 pr-16 pl-14"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0" />
                <img src="/svg/icon-ickb-2.svg" className="absolute left-4 top-[18px]" alt="iCKB" />
                <span className="absolute right-4 top-[10px] p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
                    MAX
                </span>
            </div>

            <p className="text-center text-large font-bold text-center text-cyan-500 mb-4 pb-2 ">
                1 iCKB ≈ {ickbData?.tipHeader && approxConversion(BigInt(1 * 100000000))}CKB
            </p>
            <div className="flex justify-between my-3 text-base">
                <span>You will Receive <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="receive info" /></span>
                <span>{amount ? <>≈{approxConversion(BigInt(Math.trunc(parseFloat(amount) * 100000000)))} CKB</> : 'Calculated after entry'}</span>
            </div>
            {txInfo && Number(amount) > 0 &&
                <div className="rounded border-1 border-yellow-500 p-4 bg-yellow-500/[.12]  my-3">
                    <h3 className="text-lg flex items-center">
                        <TriangleAlert size={24} className="block mr-1" />
                        <span className="block">NOTE</span>
                    </h3>
                    <p className="mt-2 text-sm">
                        {txInfo.info
                            .concat(txInfo.error !== "" ? [txInfo.error, ""] : [""])
                            .join(". ")}
                    </p></div>
            }
            <button
                onClick={handleWithDraw}
                className="mt-4 w-full font-bold bg-btn-gradient text-gray-800 text-body-2 py-3 rounded-lg hover:bg-btn-gradient-hover transition duration-200 disabled:opacity-50 disabled:hover:bg-btn-gradient"
                disabled={(() => {
                    try {
                        ccc.numFrom(amount);
                    } catch (error) {
                        return true;
                    }
                    return amount === "";
                })() || transTBC}
            >
                {amount ? 'WithDraw' : 'Enter an amount'}

            </button>
            {/* <div className="mt-8 w-full">
                <div className="flex items-center" onClick={togglePendingShow}>
                    {pendingShow ? <ChevronUp color="rgba(255,255,255,1)" size={18} /> : <ChevronDown color="rgba(255,255,255,1)" size={18} />}
                    Pending iCKB Details</div>
                {pendingShow && <>
                    {pendingIckbs && pendingIckbs.length > 0 ?
                        <IckbPendingDetail columns={pendingIckbs} /> : <p>You don’t have any pending iCKB </p>}


                </>}
            </div> */}
        </>
    );
};

export default IckbWithDraw;
