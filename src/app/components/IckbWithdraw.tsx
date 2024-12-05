import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import { ickb2Ckb } from "@ickb/v1-core";
import { TriangleAlert } from "lucide-react";
import { toText } from "@/utils/stringUtils";
import { IckbDateType } from "@/cores/utils";
import { CKB } from "@ickb/lumos-utils";
import { TailSpin } from "react-loader-spinner";


const IckbWithdraw: React.FC<{ ickbData: IckbDateType, onUpdate: VoidFunction }> = ({ ickbData, onUpdate }) => {
    const [amount, setAmount] = useState<string>("");
    const [pendingBalance, setPendingBalance] = useState<string>("0");
    const [transTBC, setTransTBC] = useState<boolean>(false);
    const txInfo = (ickbData && amount.length > 0) ? ickbData?.txBuilder("ickb2ckb", ccc.fixedPointFrom(amount)) : null;
    const [withdrawPending, setWithdrawPending] = useState<boolean>(false);
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
            progressId = await showNotification("progress", `Withdraw in progress, wait for 90s`);
            setWithdrawPending(true)
            await signerCcc.client.waitTransaction(txHash, 0, 90000)
            showNotification("success", `Withdraw Success: ${txHash}`);
            onUpdate()
        } catch (error) {
            showNotification("error", `Withdraw Error: ${error}`);
        } finally {
            removeNotification(progressId + '')
            setAmount("")
            setTransTBC(false)
            setWithdrawPending(false)

        }
    }

    function approxConversion(
        amount: bigint,
    ) {
        if (!ickbData?.tipHeader) {
            return
        }
        const [convertedAmount] = [ickb2Ckb(amount, ickbData?.tipHeader, false)]
       
        return `${toText((convertedAmount===BigInt(100000000))?BigInt(0):convertedAmount)}`;
    }

    const handleMax = async () => {
        if (!ickbData) return;
        const udtBalance = ickbData?.ickbRealUdtBalance + ickbData?.ickbPendingBalance;
        setAmount(ccc.fixedPointToString(udtBalance));
    };
    const handleAmountChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        if(!ickbData){ return}
        if (Number(e.target.value)  >= Number(ccc.fixedPointToString(ickbData.ickbRealUdtBalance))) {
            setAmount(ccc.fixedPointToString(ickbData.ickbRealUdtBalance))
            return
        }
        setAmount(e.target.value)
    }
   
    useEffect(() => {
        if (!ickbData) return;
        let pending = 0;
        if (ickbData.myOrders.length > 0) {
            ickbData.myOrders.map(item => {
                if (item.info.isCkb2Udt && item.info.absTotal === item.info.absProgress) {
                    pending += Number(item.info.udtAmount);
                }
            })
        }
        if (ickbData.myReceipts.length > 0) {
            ickbData.myReceipts.forEach((item) => {
                pending += Number(item.ickbAmount);
            });
        }
        pending > 0 ? setPendingBalance(toText(BigInt(pending))) : setPendingBalance('0');

    }, [ickbData]);

    return (
        <>
            <div className="flex  flex-col sm:flex-row font-play mb-4 mt-8 text-left">
                <div className="block sm:basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center"><span className="w-2 h-2 bg-green-500 mr-2"></span>Withdrawable iCKB</p>
                    <p className="text-2xl font-bold font-play mb-4">{(ickbData &&toText(ickbData.ickbRealUdtBalance||BigInt(0)) )} <span className="text-base font-normal">iCKB</span></p>
                </div>
                <div className="block sm:basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center">
                        <span className={"w-2 h-2 bg-yellow-500 mr-2"}></span>
                        Pending
                    </p>
                    <p className="text-2xl font-bold font-play mb-4 flex  items-center">
                        <span>
                            {pendingBalance} <span className="text-base font-normal">iCKB</span>
                        </span>
                        
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
                <span className="absolute right-4 top-[7px] p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
                    MAX
                </span>
            </div>

            <p className="text-center text-large font-bold text-center text-cyan-500 mb-4 pb-2 ">
                1 iCKB ≈ {ickbData?.tipHeader && approxConversion(CKB)} CKB
            </p>
            <div className="flex justify-between my-3 text-base">
                <span>Receive </span>
                <span>{amount ? <>≈{approxConversion(BigInt(Math.trunc(parseFloat(amount) * Number(CKB))))}</> : 0} CKB</span>
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
                    // try {
                    //   ccc.numFrom(amount);
                    // } catch (error) {
                    //   return true;
                    // }
                    return amount === ""|| amount === "0"|| !!transTBC;
                  })()}
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
                    /> {withdrawPending ? 'pending' : 'To be confirmed'}
                </>) :

                    <>{amount ? 'Withdraw' : 'Enter an amount'}
                    </>}


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

export default IckbWithdraw;
