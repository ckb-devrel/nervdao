import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import { ckb2Ickb } from "@ickb/v1-core";
import { Info, ArrowDown, TriangleAlert } from "lucide-react";
import { toText } from "@/utils/stringUtils";
import { IckbDateType } from "@/cores/utils";
import { CKB } from "@ickb/lumos-utils";
import { TailSpin } from "react-loader-spinner";


const IckbSwap: React.FC<{ ickbData: IckbDateType, onUpdate: VoidFunction }> = ({ ickbData, onUpdate }) => {
    const [amount, setAmount] = useState<string>("");
    const [pendingBalance, setPendingBalance] = useState<string>("0");
    const [meltTBC, setMeltTBC] = useState<boolean>(false);
    const [transTBC, setTransTBC] = useState<boolean>(false);
    const txInfo = (ickbData && amount.length > 0) ? ickbData?.txBuilder("ckb2ickb", ccc.fixedPointFrom(amount)) : null;
    const signerCcc = ccc.useSigner();
    const [canMelt, setCanMelt] = useState<boolean>(false);
    const { showNotification, removeNotification } = useNotification();
    const [balance, setBalance] = useState<bigint>(BigInt(0));
    const [balanceShow, setBalanceShow] = useState<string>("");
    const [depositPending, setDepositPending] = useState<boolean>(false);
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
            progressId = await showNotification("progress", `Deposit in progress, wait for 60s`);
            setDepositPending(true)
            await signerCcc.client.waitTransaction(txHash, 0, 60000);
            onUpdate()
            showNotification("success", `Deposit Success: ${txHash}`);
        } catch (error) {
            showNotification("error", `${error}`);

        } finally {
            setTransTBC(false)
            setDepositPending(false)
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
        const [convertedAmount] = [ckb2Ickb(amount, ickbData?.tipHeader, false)]
        //Worst case scenario is a 0.1% fee for bot
        // convertedAmount -= convertedAmount / BigInt(1000);
        return `${toText(convertedAmount)}`;
    }

    const handleMax = () => {
        if (!balance) return;
        // console.log(Number(balance) - 1000 * Number(CKB))
        console.log(ccc.fixedPointToString(Number(balance) - 1000 * Number(CKB)))
        const maxBalance = BigInt(Number(balance) - 1000 * Number(CKB)) + (ickbData ? ickbData.ckbPendingBalance : BigInt(0));
        setAmount(ccc.fixedPointToString(maxBalance));
    };
    const handleAmountChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {


        setAmount(e.target.value)
    }
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
        const canMelt = ickbData.ckbPendingBalance > BigInt(0);
        ickbData.ckbPendingBalance > 0 ? setPendingBalance(toText(BigInt(ickbData.ckbPendingBalance))) : setPendingBalance('0');
        setCanMelt(canMelt);

        // setPendingBalance(toText(BigInt(pending)) || '-');
        (async () => {
            if (!signerCcc) return;
            const balanceCCC = await signerCcc.getBalance();
            setBalance(balanceCCC);
            setBalanceShow(ccc.fixedPointToString(balanceCCC));
        })();
    }, [ickbData, signerCcc, meltTBC]);
    // useEffect(() => {
    //     (async () => {
    //         if (!signerCcc) return;
    //         const balance = await signerCcc.getBalance();
    //         setBalance(balance / BigInt(CKB));
    //     })();
    // }, [signerCcc, ickbData, pendingBalance]);
    return (
        <>
            <div className="flex flex-row font-play mb-4 mt-8 text-left">
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center"><span className="w-2 h-2 bg-green-500 mr-2"></span>CKB Available </p>
                    {/* <p className="text-2xl font-bold font-play mb-4">{(ickbData && ickbData.ckbAvailable !== BigInt(6)*CKB*CKB) ? toText(ickbData?.ckbAvailable) : "-"} <span className="text-base font-normal">CKB</span></p> */}
                    <p className="text-2xl font-bold font-play mb-4">{balance ? balanceShow : '-'} <span className="text-base font-normal">CKB</span></p>

                </div>
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center">
                        <span className={"w-2 h-2 bg-yellow-500 mr-2"}></span>
                        Pending
                    </p>
                    <p className="text-2xl font-bold font-play mb-4 flex  items-center">
                        <span>
                            {pendingBalance} <span className="text-base font-normal">CKB</span>
                        </span>
                        {ickbData && canMelt &&
                            <button
                                className="font-bold ml-2 bg-btn-gradient text-gray-800 text-body-2 py-1 px-2 rounded-lg hover:bg-btn-gradient-hover transition duration-200 disabled:opacity-50 disabled:hover:bg-btn-gradient"
                                onClick={() => handleMelt()}
                                disabled={meltTBC}
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
                <Info size={16} className="inline-block ml-2" data-tooltip-id="my-tooltip" data-tooltip-html="<div>Ckb Balance minus 1000 CKB </div>" />
                <div className="absolute bottom-[-30px] w-full text-center left-0 z-50"><div className="rounded-full bg-gray-500 p-1 inline-block"><ArrowDown className="inline-block" size={36} /></div></div>
            </div>
            <div className='relative mb-4  bg-gray-700 p-4 rounded'>
                <label htmlFor="ickb" className="flex items-center px-2">
                    <img src="/svg/icon-ickb-1.svg" className="mr-2" alt="iCKB" />
                    iCKB
                </label>
                <input className="w-full text-left border-none hover:border-none focus:border-none bg-gray-700 text-lg mt-1 p-3 pr-16"
                    type="text"
                    value={amount && approxConversion(BigInt(Math.trunc(parseFloat(amount) * Number(CKB))))}
                    id="ickb"
                    readOnly
                    placeholder="0" />

            </div>
            <p className="text-center text-large font-bold text-center text-cyan-500 mb-4 pb-2 ">
                1 CKB ≈ {ickbData?.tipHeader && approxConversion(CKB)}iCKB
            </p>
            <div className="flex justify-between my-3 text-base">
                <span>You will Receive <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="receive info" /></span>
                {/* 扣除0.1% 交易bot fee */}
                <span>{amount ? <>≈{approxConversion(BigInt(Math.trunc(parseFloat(amount) * Number(CKB)/*99900000*/)))} iCKB</> : 'Calculated after entry'}</span>
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
                disabled={transTBC}
            >
                {transTBC ? (<>
                    <TailSpin
                        height="20"
                        width="20"
                        color="#333333"
                        ariaLabel="tail-spin-loading"
                        radius="1"
                        wrapperStyle={{ 'display': 'inline-block', 'marginRight': '10px' }}
                        wrapperClass="inline-block"
                    /> {depositPending ? 'pending' : 'To be confirmed'}
                </>) :

                    <>{amount ? 'Swap' : 'Enter an amount'}
                    </>}
            </button>

        </>
    );
};

export default IckbSwap;
