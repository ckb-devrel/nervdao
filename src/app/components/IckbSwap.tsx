import React, { useCallback, useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
// import { useNotification } from "@/context/NotificationProvider";
import { ckb2Ickb, ickbDeposit } from "@ickb/v1-core";
import { configAdapterFrom, I8Header } from "@ickb/lumos-utils";
import { Info, ArrowDown, TriangleAlert } from "lucide-react";
// import { Tooltip } from "react-tooltip";
import { RPC } from "@ckb-lumos/rpc";
import { toBigInt, toText } from "@/utils/stringUtils";
import {
    generateGenesisScriptConfigs,

} from "@ckb-lumos/config-manager";
import {
    TransactionSkeleton,
    // type TransactionSkeletonType,
} from "@ckb-lumos/helpers";
import { setupWalletConfig } from "@/cores/config";
// import { useQuery } from "@tanstack/react-query";
// import { l1StateOptions } from "@/cores/queries";
const rpc = new RPC('https://testnet.ckb.dev/')

const IckbSwap: React.FC = () => {
    const [amount, setAmount] = useState<string>("");
    const [transactionFee, setTransactionFee] = useState<string>("-");
    const [balance, setBalance] = useState<string>("-");
    const [tipHeader, setTipHeader] = useState<I8Header>();
    // const [walletConfig, setWalletConfig] = useState();
    const signer = ccc.useSigner();
    // const { data, isStale, isFetching } = useQuery(
    //     l1StateOptions(false),
    //   );
    //   console.log(data)
    // const { showNotification, removeNotification } = useNotification();
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

        // const { script: lock } = await signer.getRecommendedAddressObj();
        const config = configAdapterFrom(
            {
                //Devnet
                PREFIX: "ckt",
                SCRIPTS: generateGenesisScriptConfigs(
                    await rpc.getBlockByNumber("0x0"),
                ),
            },
        );
        const walletConfig = setupWalletConfig(signer)
        console.log(walletConfig)
        const txs = TransactionSkeleton()
        const tx = ickbDeposit(txs, 1, BigInt(100), config);
        debugger
        console.log(tx)

        // const txHash = await signer.sendTransaction(tx);
        // removeNotification(progressId + '')
        // showNotification("success", `Deposit Success: ${txHash}`);

    };
    function approxConversion(
        amount: bigint,
        tipHeader: I8Header,
    ) {
        let [convertedAmount, unit] = [ckb2Ickb(amount, tipHeader), "ICKB"]
        unit = unit + ''
        //Worst case scenario is a 0.1% fee for bot
        convertedAmount -= convertedAmount / BigInt(1000);
        return `${toText(convertedAmount)} ${unit}`;
    }
    function ckbRecive(
        amount: bigint
    ) {
        if (!tipHeader) {
            return
        }
        let [convertedAmount] = [ckb2Ickb(amount, tipHeader), "ICKB"]

        //Worst case scenario is a 0.1% fee for bot
        convertedAmount -= convertedAmount / BigInt(1000);
        console.log(Number(convertedAmount))
        return Number(convertedAmount)
    }
    useEffect(() => {
        (async () => {
            if (!signer) return;
            const balance = await signer.getBalance();
            setBalance(ccc.fixedPointToString(balance));
            const header = await rpc.getTipHeader();
            const tipHeader = I8Header.from(header);
            setTipHeader(tipHeader)
            let [convertedAmount, unit] = [ckb2Ickb(toBigInt('10'), tipHeader), "ICKB"]
            unit = unit + ''
            //Worst case scenario is a 0.1% fee for bot
            convertedAmount -= convertedAmount / BigInt(1000);
            console.log(`${toText(convertedAmount)} ${unit}`)
            //   return `${toText(convertedAmount)} ${unit}`;
            //     console.log(ckb2Ickb(BigInt(1),tipHeader))
        })();
    }, [signer]);

    const handleMax = async () => {
        if (!signer) return;

        setAmount(balance);
    };
    const handleAmountChange = useCallback((e: { target: { value: React.SetStateAction<string>; }; }) => {
        setAmount(e.target.value)
    }, [])


    return (
        <>
            <div className="flex flex-row font-play mb-4 mt-8 text-left">
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2">CKB Balance</p>
                    <p className="text-2xl font-bold font-play mb-4">{balance} <span className="text-base font-normal">CKB</span></p>

                </div>
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center	">Liquidity Availability <Info size={16} data-tooltip-id="my-tooltip" data-tooltip-content="Hello world!" /></p>
                    <p className="text-2xl font-bold font-play mb-4"> <span className="text-base font-normal">- iCKB</span></p>

                </div>
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
                    value={amount && ckbRecive(BigInt(Math.trunc(parseFloat(amount))))}
                    id="ickb"
                    readOnly
                    placeholder="0" />

            </div>
            <p className="text-center text-large font-bold text-center text-cyan-500 mb-4 pb-2 ">
                1 CKB ≈ {tipHeader && approxConversion(BigInt(1 * 100000000), tipHeader)}
            </p>
            <div className="flex justify-between my-3 text-base">
                <span>You will Receive <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="receive info" /></span>
                <span>{amount ? <>≈{ckbRecive(BigInt(Math.trunc(parseFloat(amount))))} iCKB</> : 'Calculated after entry'}</span>
            </div>
            {amount &&
                <div className="rounded border-1 border-yellow-500 p-4 bg-yellow-500/[.12]  my-3">
                    <h3 className="text-lg"><TriangleAlert size={24} className="inline-block" /> NOTE</h3>
                    <p className="mt-2 text-sm">The remaining {ckbRecive(BigInt(Math.trunc(parseFloat(amount))))} iCKB (≈ {amount} CKB) will be withdrawable once liquidity becomes available. You can withdraw this amount later from the “Withdraw” tab.</p></div>
            }
            <div className="flex justify-between my-3 text-base">
                <span>Transaction Fee <Info size={16} className="inline-block" data-tooltip-id="my-tooltip" data-tooltip-content="Transaction Fee info" /></span>
                <span>{amount ? <>{transactionFee} CKB</> : 'Calculated after entry'}</span>
            </div>
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
            // disabled={(() => {
            //     try {
            //         ccc.numFrom(amount);
            //     } catch (error) {
            //         return true;
            //     }
            //     return amount === "";
            // })()}
            >
                {amount ? 'Swap' : 'Enter an amount'}

            </button></>
    );
};

export default IckbSwap;
