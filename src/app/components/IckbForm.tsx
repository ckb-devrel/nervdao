import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import { ckb2Ickb, ickb2Ckb } from "@ickb/v1-core";
import { CKB, type I8Header } from "@ickb/lumos-utils";
import { useIckbContext } from '@/context/IckbConfigProvider'
import { Info, ArrowDown, TriangleAlert } from "lucide-react";
import { Tooltip } from "react-tooltip";

const IckbForm: React.FC = () => {
    const [status, setStatus] = useState<string>("swap");


    const [amount, setAmount] = useState<string>("");
    const [transactionFee, setTransactionFee] = useState<string>("-");
    const [balance, setBalance] = useState<string>("-");
    const { wallet, open, signerInfo } = ccc.useCcc();

    const signer = ccc.useSigner();

    const { showNotification, removeNotification } = useNotification();
    useEffect(() => {
        if (!signer) return;

        (async () => {
            try {
                const { script: lock } = await signer.getRecommendedAddressObj();
                const tx = ccc.Transaction.from({
                    outputs: [
                        {
                            capacity: ccc.fixedPointFrom(amount),
                            lock,
                            type: await ccc.Script.fromKnownScript(
                                signer.client,
                                ccc.KnownScript.NervosDao,
                                "0x"
                            ),
                        },
                    ],
                    outputsData: ["00".repeat(8)],
                });
                await tx.addCellDepsOfKnownScripts(
                    signer.client,
                    ccc.KnownScript.NervosDao
                );

                await tx.completeInputsByCapacity(signer);
                await tx.completeFeeBy(signer, 1000);
                setTransactionFee(
                    ccc.fixedPointToString(
                        (await tx.getInputsCapacity(signer.client)) -
                        tx.getOutputsCapacity()
                    )
                );
            } catch (error) {
                setTransactionFee("-");
            }
        })();
    }, [signer, amount]);

    const handleSwap = async () => {
        if (!signer) {
            return;
        }
        const { script: lock } = await signer.getRecommendedAddressObj();
        const tx = ccc.Transaction.from({
            outputs: [
                {
                    lock,
                    type: await ccc.Script.fromKnownScript(
                        signer.client,
                        ccc.KnownScript.NervosDao,
                        "0x"
                    ),
                },
            ],
            outputsData: ["00".repeat(8)],
        });
        await tx.addCellDepsOfKnownScripts(
            signer.client,
            ccc.KnownScript.NervosDao
        );
        if (tx.outputs[0].capacity > ccc.fixedPointFrom(amount)) {
            showNotification(
                "error",
                "Minimal deposit amount is",
                ccc.fixedPointToString(tx.outputs[0].capacity)
            );
            return;
        }
        tx.outputs[0].capacity = ccc.fixedPointFrom(amount);
        const progressId = await showNotification("progress", `Deposit in progress!`);

        await tx.completeInputsByCapacity(signer);
        await tx.completeFeeBy(signer, 1000);

        const txHash = await signer.sendTransaction(tx);
        removeNotification(progressId + '')
        showNotification("success", `Deposit Success: ${txHash}`);

    };
    const handleWithDraw =async()=>{}
    useEffect(() => {
        (async () => {
            if (!signer) return;
            const balance = await signer.getBalance();
            const address = await signer.getInternalAddress()
            console.log(address)
            setBalance(ccc.fixedPointToString(balance));
        })();
    }, [signer]);

    const handleMax = async () => {
        if (!signer) return;
        const { script: lock } = await signer.getRecommendedAddressObj();
        const tx = ccc.Transaction.from({
            outputs: [
                {
                    lock,
                    type: await ccc.Script.fromKnownScript(
                        signer.client,
                        ccc.KnownScript.NervosDao,
                        "0x"
                    ),
                },
            ],
            outputsData: ["00".repeat(8)],
        });
        await tx.addCellDepsOfKnownScripts(
            signer.client,
            ccc.KnownScript.NervosDao
        );
        await tx.completeInputsAll(signer);
        await tx.completeFeeChangeToOutput(signer, 0, 1000);
        const amount = ccc.fixedPointToString(tx.outputs[0].capacity);
        setAmount(amount);
    };
    const changeStatus = (status: string) => {
        setStatus(status)
    }
    const Swap = () => {
        return (
            <><div className="flex flex-row font-play mb-4 mt-8 text-left">
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2">iCKB Balance</p>
                    <p className="text-2xl font-bold font-play mb-4">{balance} <span className="text-base font-normal">iCKB</span></p>

                </div>
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center	">Liquidity Availability <Info size={16} data-tooltip-id="my-tooltip" data-tooltip-content="Hello world!" /></p>
                    <p className="text-2xl font-bold font-play mb-4">{balance} <span className="text-base font-normal">iCKB</span></p>

                </div>
            </div>



                <div className='relative mb-4  bg-gray-700 p-4 rounded'>
                    <label htmlFor="ickb" className="flex items-center px-2">
                        <img src="/svg/icon-ickb-1.svg" className="mr-2" alt="iCKB" />
                        iCKB
                    </label>
                    <input className="w-full text-left border-none hover:border-none focus:border-none bg-gray-700 text-lg mt-1 p-3 pr-16"
                        type="text"
                        onChange={(e) => setAmount(e.target.value)}
                        value={amount}
                        id="ickb"
                        placeholder="0" />

                    <span className="absolute right-4 bottom-2 p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
                        MAX
                    </span>
                    <div className="absolute bottom-[-30px] w-full text-center left-0 z-[100]"><div className="rounded-full bg-gray-500 p-1 inline-block"><ArrowDown className="inline-block" size={36} /></div></div>
                </div>

                <div className='relative mb-4  bg-gray-700 p-4 rounded'>
                    <label className="flex px-2 items-center"><img src="/svg/icon-ckb.svg" alt="CKB" className="mr-2" /> CKB</label>
                    <input className="w-full text-left border-none hover:border-none focus:border-none bg-gray-700  text-lg p-3 mt-1 pr-16"
                        type="text"
                        placeholder="0" />
                </div>
                <p className="text-center text-large font-bold text-center text-cyan-500 mb-4 pb-2 ">
                    1 CKB ≈ 1.03948 iCKB

                </p>
                <div className="flex justify-between my-3 text-base">
                    <span>You will Receive <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="receive info" /></span>
                    <span>{amount ? <>{transactionFee} CKB</> : 'Calculated after entry'}</span>
                </div>
                {amount &&
                    <div className="rounded border-1 border-yellow-500 p-4 bg-yellow-500/[.12]  my-3">
                        <h3 className="text-lg"><TriangleAlert size={24} className="inline-block" /> NOTE</h3>
                        <p className="mt-2 text-sm">The remaining 10,000 iCKB (≈ 9620.19471 CKB) will be withdrawable once liquidity becomes available. You can withdraw this amount later from the “Withdraw” tab.</p></div>
                }
                <div className="flex justify-between my-3 text-base">
                    <span>Transaction Fee <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="Transaction Fee info" /></span>
                    <span>{amount ? <>{transactionFee} CKB</> : 'Calculated after entry'}</span>
                </div>
                <div className="flex justify-between my-3 text-base">
                    <span>Additional Fee <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="Additional Fee info" /></span>
                    <span>{amount ? <>{transactionFee} CKB</> : 'Calculated after entry'}</span>
                </div>
                <div className="flex justify-between my-3 text-base">
                    <span>Completion time</span>
                    <span>~5 days</span>
                </div>

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
        )
    }
    const WithDraw = () => {
        return (
            <><div className="flex flex-row font-play mb-4 mt-8 text-left">
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center"><span className="inline-block w-[8px] h-[8px] bg-green-500 mr-1"></span> Withdrawable iCKB</p>
                    <p className="text-2xl font-bold font-play mb-4">{balance} <span className="text-base font-normal">iCKB</span></p>

                </div>
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center"><span className="inline-block w-[8px] h-[8px] bg-yellow-500 mr-1"></span> Pending iCKB</p>
                    <p className="text-2xl font-bold font-play mb-4">{balance} <span className="text-base font-normal">iCKB</span></p>
                </div>
            </div>
                <div className='relative mb-4 rounded'>
                    <h3  className="text-gray-400 mb-2">Enter Withdraw Amount</h3>
                    <label htmlFor="ickb" className="absolute top-[2.8em] left-1 flex items-center px-2">
                        <img src="/svg/icon-ickb-2.svg" className="mr-2" alt="CKB" />
                      
                    </label>
                    <input className="w-full text-left border-[#777] hover:border-cyan-500 focus:border-cyan-500 bg-gray-700 text-lg p-3  pl-12 pr-16"
                        type="text"
                        onChange={(e) => setAmount(e.target.value)}
                        value={amount}
                        id="ickb"
                        placeholder="Ickb Amount" />

                    <span className="absolute right-4 bottom-1 p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
                        MAX
                    </span>
                </div>

                
                <p className="text-center text-large font-bold text-center text-cyan-500 mb-4 pb-2 ">
                    1 CKB ≈ 1.03948 iCKB

                </p>
                <div className="flex justify-between my-3 text-base">
                    <span>You will Receive <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="receive info" /></span>
                    <span>{amount ? <>{transactionFee} CKB</> : 'Calculated after entry'}</span>
                </div>
                
                <div className="flex justify-between my-3 text-base">
                    <span>Transaction Fee <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="Transaction Fee info" /></span>
                    <span>{amount ? <>{transactionFee} CKB</> : 'Calculated after entry'}</span>
                </div>
                

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
                    })()}
                >
                    {amount ? 'Withdraw' : 'Enter an amount'}

                </button></>
        )
    }
    return (
        <div className="bg-gray-900 rounded-lg p-6">

            <div className="flex flex-row font-play mb-4 mt-4 border border-[#777] rounded-lg text-center">
                <div className={`basis-1/2 py-4 rounded-l-lg cursor-pointer  ${status === 'swap' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => changeStatus('swap')}>Swap</div>
                <div className={`basis-1/2 py-4 rounded-r-lg cursor-pointer  ${status === 'withdraw' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => changeStatus('withdraw')}>Withdraw</div>
            </div>
            {status==='swap'?<Swap />:<WithDraw />}
            <Tooltip id="my-tooltip" />

        </div>
    );
};

export default IckbForm;
