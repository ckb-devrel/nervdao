import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import { ckb2Ickb, MyOrder } from "@ickb/v1-core";
import { Info, ArrowDown, TriangleAlert } from "lucide-react";
import { toText } from "@/utils/stringUtils";
import { IckbDateType } from "@/cores/utils";
import { CKB } from "@ickb/lumos-utils";
import { callMelt } from "@/cores/queries";


const IckbSwap: React.FC<{ ickbData: IckbDateType, onUpdate: VoidFunction }> = ({ ickbData, onUpdate }) => {
    const [amount, setAmount] = useState<string>("");
    const [pendingBalance, setPendingBalance] = useState<string>("");
    const [meltTBC, setMeltTBC] = useState<boolean>(false);
    const [transTBC, setTransTBC] = useState<boolean>(false);
    const txInfo = (ickbData && amount.length > 0) ? ickbData?.txBuilder(true, ccc.fixedPointFrom(amount)) : null;
    const signerCcc = ccc.useSigner();
    const [canMelt, setCanMelt] = useState<boolean>(false);
    const { showNotification, removeNotification } = useNotification();
    async function handleSwap() {
        if (!txInfo || !signerCcc) {
            return
        }
        if (txInfo.error) {
            showNotification("error", txInfo.error);
            return
        }
        let progressId, txHash;
        setTransTBC(true)
        try {
            const cccTx = ccc.Transaction.fromLumosSkeleton(txInfo.tx);
            txHash = await signerCcc.sendTransaction(cccTx);
            progressId = await showNotification("progress", `Deposit in progress!`);
            
            await signerCcc.client.waitTransaction(txHash)

            onUpdate()
            showNotification("success", `Deposit Success: ${txHash}`);
        } catch (error) {
            setTransTBC(false)
            
            setAmount("")
        } finally {
            setTransTBC(false)

            removeNotification(progressId + '')
            setAmount("")
        }
    }

    function approxConversion(
        amount: bigint,
    ) {
        if (!ickbData?.tipHeader) {
            return
        }
        let [convertedAmount] = [ckb2Ickb(amount, ickbData?.tipHeader)]
        //Worst case scenario is a 0.1% fee for bot
        convertedAmount -= convertedAmount / BigInt(1000);
        return `${toText(convertedAmount)}`;
    }

    const handleMax = async () => {
        if (!ickbData) return;
        setAmount(ccc.fixedPointToString(ickbData?.ckbAvailable));
    };
    const handleAmountChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {


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
            pending += ickbData.myOrders[0].info.isCkb2Udt ? 0:Number(item.info.absProgress / CKB / CKB) ;
            (item.info.absTotal === item.info.absProgress) ? (canMelt = true) : (canMelt = false)
        })
        setCanMelt(canMelt&&!ickbData.myOrders[0].info.isCkb2Udt)
        setPendingBalance(toText(BigInt(pending)) || '-');

    }, [ickbData]);

    return (
        <>
            <div className="flex flex-row font-play mb-4 mt-8 text-left">
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center"><span className="w-2 h-2 bg-green-500 mr-2"></span>CKB Available <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-html="<div>Ckb Balance minus the the CKB locked in Withdrawal requests not yet mature <br />and minus 1000 CKB</div>" /></p>
                    <p className="text-2xl font-bold font-play mb-4">{(ickbData && ickbData.ckbAvailable !== BigInt(6)*CKB*CKB) ? toText(ickbData?.ckbAvailable) : "-"} <span className="text-base font-normal">CKB</span></p>
                    {/* <p className="text-2xl font-bold font-play mb-4">{balance} <span className="text-base font-normal">CKB</span></p> */}

                </div>
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center">
                        <span className={ "w-2 h-2 bg-yellow-500 mr-2"}></span>
                        Pending
                    </p>
                    <p className="text-2xl font-bold font-play mb-4 flex  items-center">
                        <span>
                            {pendingBalance} <span className="text-base font-normal">CKB</span>
                        </span>
                        {ickbData && canMelt &&
                            <button
                                className="font-bold ml-2 bg-btn-gradient text-gray-800 text-body-2 py-1 px-2 rounded-lg hover:bg-btn-gradient-hover transition duration-200 disabled:opacity-50 disabled:hover:bg-btn-gradient"
                                onClick={() => handleMelt(ickbData.myOrders)}
                                disabled={!meltTBC}
                            >
                                Melt
                            </button>
                        }
                    </p>
                </div>

            </div>
            <div className='relative mb-4  bg-gray-700 p-4 rounded'>
                <label className="flex px-2 items-center"><img src="/svg/icon-ckb.svg" alt="CKB" className="mr-2" /> CKB</label>
                <input className="w-full text-left no-arrows border-none hover:border-none  focus:border-none bg-gray-700  text-lg p-3 mt-1 pr-16"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0" />
                <span className="absolute right-4 bottom-2 p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
                    MAX
                </span>
                <div className="absolute bottom-[-30px] w-full text-center left-0 z-50"><div className="rounded-full bg-gray-500 p-1 inline-block"><ArrowDown className="inline-block" size={36} /></div></div>
            </div>
            <div className='relative mb-4  bg-gray-700 p-4 rounded'>
                <label htmlFor="ickb" className="flex items-center px-2">
                    <img src="/svg/icon-ickb-1.svg" className="mr-2" alt="iCKB" />
                    iCKB
                </label>
                <input className="w-full text-left border-none hover:border-none focus:border-none bg-gray-700 text-lg mt-1 p-3 pr-16"
                    type="text"
                    value={amount && approxConversion(BigInt(Math.trunc(parseFloat(amount) * 100000000)))}
                    id="ickb"
                    readOnly
                    placeholder="0" />

            </div>
            <p className="text-center text-large font-bold text-center text-cyan-500 mb-4 pb-2 ">
                1 CKB ≈ {ickbData?.tipHeader && approxConversion(BigInt(1 * 100000000))}iCKB
            </p>
            <div className="flex justify-between my-3 text-base">
                <span>You will Receive <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="receive info" /></span>
                {/* 扣除0.1% 交易bot fee */}
                <span>{amount ? <>≈{approxConversion(BigInt(Math.trunc(parseFloat(amount) * 99900000)))} iCKB</> : 'Calculated after entry'}</span>
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
            {/* <div className="flex justify-between my-3 text-base">
                <span>Transaction Fee <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="Transaction Fee info" /></span>
                <span>{amount ? <>{transactionFee} CKB</> : 'Calculated after entry'}</span>
            </div> */}
            {/* <div className="flex justify-between my-3 text-base">
                    <span>Additional Fee <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="Additional Fee info" /></span>
                    <span>{amount ? <>{transactionFee} CKB</> : 'Calculated after entry'}</span>
                </div>
                <div className="flex justify-between my-3 text-base">
                    <span>Completion time</span>
                    <span>~5 days</span>
                </div> */}

            <button
                onClick={handleSwap}
                className="mt-4 w-full font-bold bg-btn-gradient text-gray-800 text-body-2 py-3 rounded-lg hover:bg-btn-gradient-hover transition duration-200 disabled:opacity-50 disabled:hover:bg-btn-gradient"
                disabled={(() => {
                    try {
                        ccc.numFrom(amount);
                    } catch (error) {
                        return true;
                    }
                    return amount === "";
                })()||transTBC}
            >
                {amount ? 'Swap' : 'Enter an amount'}

            </button>
            
            </>
    );
};

export default IckbSwap;
