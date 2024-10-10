import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";

const IckbForm: React.FC = () => {
    const [status, setStatus] = useState<string>("swap");


    const [amount, setAmount] = useState<string>("");
    const [transactionFee, setTransactionFee] = useState<string>("-");
    const [balance, setBalance] = useState<string>("-");

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

    useEffect(() => {
        (async () => {
            if (!signer) return;
            const balance = await signer.getBalance();
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

    return (
        <div className="bg-gray-800 rounded-lg p-6">

            <div className="flex flex-row font-play mb-4 mt-4 border border-[#777] rounded-lg text-center">
                <div className={`basis-1/2 py-4 rounded-l-lg cursor-pointer  ${status === 'swap' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => changeStatus('swap')}>Swap</div>
                <div className={`basis-1/2 py-4 rounded-r-lg cursor-pointer  ${status === 'withdraw' && 'bg-cyan-500 text-gray-800 font-bold'}`} onClick={() => changeStatus('withdraw')}>Withdraw</div>
            </div>
            <div className="flex flex-row font-play mb-4 mt-8 text-left">
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2">iCKB Balance</p>
                    <p className="text-2xl font-bold font-play mb-4">{balance} <span className="text-base font-normal">iCKB</span></p>

                </div>
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2">Liquidity Availability</p>
                    <p className="text-2xl font-bold font-play mb-4">{balance} <span className="text-base font-normal">iCKB ≈ 144,282 CKB</span></p>

                </div>
            </div>



            <div className='relative mb-4  bg-gray-700 p-4 rounded'>
                <label htmlFor="ickb" className="flex items-center px-2">
                    <img src="/svg/icon-ickb-1.svg" className="mr-2" alt="iCKB" />
                    iCKB
                </label>
                <input className="w-full text-left border-none hover:border-none focus:border-none bg-gray-700 text-lg p-3 pr-16"
                    type="text"
                    onChange={(e) => setAmount(e.target.value)}
                    value={amount}
                    id="ickb"
                    placeholder="0" />

                <span className="absolute right-4 p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
                    MAX
                </span>

            </div>
            <div className='relative mb-4  bg-gray-700 p-4 rounded'>
                <label className="flex px-2 items-center"><img src="/svg/icon-ckb.svg" alt="CKB" className="mr-2" /> CKB</label>
                <input className="w-full text-left border-none hover:border-none focus:border-none bg-gray-700  text-lg p-3 pr-16"
                    type="text"
                    placeholder="0" />
            </div>
            <p className="text-center text-large font-bold text-center text-cyan-500 mb-4 pb-2 ">
                1 CKB ≈ 1.03948 iCKB

            </p>
            <div className="flex justify-between my-2">
                <span>You will Receive</span>
                <span>{transactionFee} CKB</span>
            </div>
            <div className="flex justify-between my-2">
                <span>Transaction Fee</span>
                <span>{transactionFee} CKB</span>
            </div>
            <div className="flex justify-between my-2">
                <span>Additional Fee</span>
                <span>{transactionFee} CKB</span>
            </div>
            <div className="flex justify-between my-2">
                <span>Completion time</span>
                <span>-</span>
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
                Swap
            </button>
        </div>
    );
};

export default IckbForm;
