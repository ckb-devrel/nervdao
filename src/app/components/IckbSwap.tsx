import React, { useCallback,  useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import { ckb2Ickb } from "@ickb/v1-core";
import { Info, ArrowDown, TriangleAlert } from "lucide-react";
import { toText } from "@/utils/stringUtils";
import { type WalletConfig } from "@/cores/config";
import { useQuery } from "@tanstack/react-query";
import { l1StateOptions } from "@/cores/queries";


const IckbSwap: React.FC<{ walletConfig: WalletConfig }> = ({ walletConfig }) => {
    const [amount, setAmount] = useState<string>("");
    const { data: ickbData } = useQuery(
        l1StateOptions(walletConfig, false),
    );
    const txInfo = ickbData?.txBuilder(false, ccc.fixedPointFrom(amount));
    // console.log(txInfo)
    const signerCcc = ccc.useSigner();

    const { showNotification, removeNotification } = useNotification();
    async function handleSwap() {
        if (!txInfo || !signerCcc) {
            return
        }
        let progressId, txHash;
        try {
            // const cccTx = ccc.Transaction.fromLumosSkeleton(txInfo.tx);
            // const signedTx = await signerCcc.signTransaction(cccTx);
            const cccTx = ccc.Transaction.fromLumosSkeleton(txInfo.tx);
            // const signedTx = await signerCcc.signTransaction(cccTx);

            txHash = await signerCcc.sendTransaction(cccTx);
            progressId = await showNotification("progress", `Deposit in progress!`);

            // txHash = await signerCcc.sendTransaction(signedTx);
        } finally {
            removeNotification(progressId + '')
            //   freezeTxInfo(txInfoFrom({}));
            setAmount("")
            showNotification("success", `Deposit Success: ${txHash}`);

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
    const handleAmountChange = useCallback((e: { target: { value: React.SetStateAction<string>; }; }) => {
        setAmount(e.target.value)
    }, [])


    return (
        <>
            <div className="flex flex-row font-play mb-4 mt-8 text-left">
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2">CKB Balance</p>
                    <p className="text-2xl font-bold font-play mb-4">{ickbData ? toText(ickbData?.ckbAvailable):"-"} <span className="text-base font-normal">CKB</span></p>

                </div>
                {/* <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center	">Liquidity Availability <Info size={16} data-tooltip-id="my-tooltip" data-tooltip-content="Hello world!" /></p>
                    <p className="text-2xl font-bold font-play mb-4"> <span className="text-base font-normal">- iCKB</span></p>

                </div> */}
            </div>
            <div className='relative mb-4  bg-gray-700 p-4 rounded'>
                <label className="flex px-2 items-center"><img src="/svg/icon-ckb.svg" alt="CKB" className="mr-2" /> CKB</label>
                <input className="w-full text-left border-none hover:border-none focus:border-none bg-gray-700  text-lg p-3 mt-1 pr-16"
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0" />
                <span className="absolute right-4 bottom-2 p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
                    MAX
                </span>
                <div className="absolute bottom-[-30px] w-full text-center left-0 z-[100]"><div className="rounded-full bg-gray-500 p-1 inline-block"><ArrowDown className="inline-block" size={36} /></div></div>
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
            {txInfo && Number(amount)>0 &&
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
                })()}
            >
                {amount ? 'Swap' : 'Enter an amount'}

            </button></>
    );
};

export default IckbSwap;
