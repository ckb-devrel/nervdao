import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import { ckb2Ickb } from "@ickb/v1-core";
import { Info, TriangleAlert } from "lucide-react";
import { toText } from "@/utils/stringUtils";
import { IckbDateType } from "@/cores/utils";
import { CKB } from "@ickb/lumos-utils";
import { TailSpin } from "react-loader-spinner";


const IckbSwap: React.FC<{ ickbData: IckbDateType, onUpdate: VoidFunction }> = ({ ickbData, onUpdate }) => {
    const [amount, setAmount] = useState<string>("");
    const [debouncedAmount, setDebouncedAmount] = useState<string>("");
    const [pendingBalance, setPendingBalance] = useState<string>("0");
    const [transTBC, setTransTBC] = useState<boolean>(false);
    const txInfo = (ickbData && debouncedAmount.length > 0) ? ickbData?.txBuilder("ckb2ickb", ccc.fixedPointFrom(debouncedAmount)) : null;
    const signerCcc = ccc.useSigner();
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
        return `${toText((convertedAmount === BigInt(100000000)) ? BigInt(0) : convertedAmount)}`;
    }

    const handleMax = () => {
        if (!balance) return;
        const maxBalance = balance + (ickbData ? ickbData.ckbPendingBalance : BigInt(0));
        setAmount(Number(maxBalance/CKB)*0.998+'');
    };
    const handleAmountChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        if (Number(e.target.value)  >= (Number(balanceShow))) {
            setAmount(Number(balanceShow)*0.998+'')
            return
        }
        //超出1千万的输入会引起内核VM卡死,暂时限定最大值为10000000
        if (Number(e.target.value)  >= 100000000) {
            setAmount('100000000')
            return
        }
        setAmount(e.target.value)

    }
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedAmount(amount);
        }, 200); // 500ms 的延迟

        return () => clearTimeout(handler);
    }, [amount]);
  
    useEffect(() => {
        if (!ickbData) return;
        ickbData.ckbPendingBalance > 0 ? setPendingBalance(toText(BigInt(ickbData.ckbPendingBalance))) : setPendingBalance('0');

        // setPendingBalance(toText(BigInt(pending)) || '-');
        (async () => {
            if (!signerCcc) return;
            const balanceCCC = await signerCcc.getBalance();
            setBalance(balanceCCC);
            setBalanceShow(ccc.fixedPointToString(balanceCCC));
        })();
    }, [ickbData, signerCcc]);

    return (
        <>
            <div className="flex flex-col sm:flex-row font-play mb-4 mt-8 text-left">
                <div className="block sm:basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center"><span className="w-2 h-2 bg-green-500 mr-2"></span>CKB Available </p>
                    {/* <p className="text-2xl font-bold font-play mb-4">{(ickbData && ickbData.ckbAvailable !== BigInt(6)*CKB*CKB) ? toText(ickbData?.ckbAvailable) : "-"} <span className="text-base font-normal">CKB</span></p> */}
                    <p className="text-2xl font-bold font-play mb-4">{balance ? balanceShow : '-'} <span className="text-base font-normal">CKB</span></p>

                </div>
                <div className="block sm:basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center">
                        <span className={"w-2 h-2 bg-yellow-500 mr-2"}></span>
                        Pending <Info size={16} className="ml-1 inline-block" data-tooltip-id="my-tooltip" data-tooltip-html="Pending CKB becomes available once<br /> the Nervos DAO maturity period ends<br /> or the active order is melted." />
                    </p>
                    <p className="text-2xl font-bold font-play mb-4 flex  items-center">
                        <span>
                            {pendingBalance} <span className="text-base font-normal">CKB</span>
                        </span>
                       
                    </p>
                </div>
            </div>
            {/* <div className='relative mb-4  bg-gray-700 p-4 rounded'>
                <label className="flex px-2 items-center"><img src="/svg/icon-ckb.svg" alt="CKB" className="mr-2" /> CKB</label>
                <input className="w-full text-left no-arrows border-none hover:border-none  focus:border-none bg-gray-700  text-lg p-3 mt-1 pr-16"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0" />
                <span className="absolute right-4 bottom-2 p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
                    MAX <Info size={16} className="inline-block ml-2" data-tooltip-id="my-tooltip" data-tooltip-html="<div>CKB Balance minus 1000 CKB </div>" />
                </span>
            </div> */}
            <div className='relative mb-4 flex'>
                <input className="w-full text-left rounded border no-arrows  border-[#777] bg-gray-700  hover:border-cyan-500 focus:border-cyan-500  text-lg p-3 mt-1 pr-16 pl-14"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    max={Number(balance/CKB)} />
                <img src="/svg/icon-ckb.svg" className="absolute left-4 top-[18px]" alt="CKB" />
                <span className="absolute right-4 top-[7px] p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
                    MAX
                </span>
            </div>
            <p className="text-center text-large font-bold text-center text-cyan-500 mb-4 pb-2 ">
                1 CKB ≈ {ickbData?.tipHeader && approxConversion(CKB)} iCKB
            </p>
            <div className="flex justify-between my-3 text-base">
                <span>Receive </span>
                {/* 扣除0.1% 交易bot fee */}
                <span>{amount ? <>≈{approxConversion(BigInt(Math.trunc(parseFloat(amount) * Number(CKB)/*99900000*/)))} iCKB</> : '0 iCKB'}</span>
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

                    <>{debouncedAmount ? 'Swap' : 'Enter an amount'}
                    </>}
            </button>

        </>
    );
};

export default IckbSwap;

