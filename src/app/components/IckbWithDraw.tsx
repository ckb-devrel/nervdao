import React, { useCallback, useMemo, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import { ckb2Ickb, ickb2Ckb } from "@ickb/v1-core";
import { Info, TriangleAlert, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";
import { toText } from "@/utils/stringUtils";

import { type WalletConfig } from "@/cores/config";
import { useQuery } from "@tanstack/react-query";
import { l1StateOptions } from "@/cores/queries";
import ClipLoader from "react-spinners/ClipLoader";
import UseSorter, { SortDirection, ArrowProps, Column,  SorterObj } from "@/hooks/UseSorter";

const pendingIckbs: SorterObj[] = [
    {
        amount: 9999,
        daterequested: 1729790007500,
        remainingtime: 1729760007500
    },
    {
        amount: 9998,
        daterequested: 1729750006500,
        remainingtime: 1729750006500
    },
    {
        amount: 9997,
        daterequested: 1729790003500,
        remainingtime: 1735740003500
    },
];

const columns: Column[] = [
    {
        name: "Amount",
        key: 'amount'
    },
    {
        name: "Date Requested",
        key: "daterequested"
    },
    {
        name: "Remaining Time",
        key: "remainingtime"
    }
];


const calculateDaysDifference = (timestamp1:number, timestamp2:number) => {
   
    try {
      const date1 = new Date(timestamp1);
      const date2 = new Date(timestamp2);
      const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
      const diffInHoutrs = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
      return diffInHoutrs;
    } catch (error) {
      return "Error calculating days difference: " + error;
    }
  };
const IckbWithDraw: React.FC<{ walletConfig: WalletConfig }> = ({ walletConfig }) => {
    const [amount, setAmount] = useState<string>("");
    const [pendingShow, setPendingShow] = useState<boolean>(false);
    const { data: ickbData, isStale, isFetching } = useQuery(
        l1StateOptions(walletConfig, false),
    );
    const txInfo = ickbData?.txBuilder(true, ccc.fixedPointFrom(amount));
    const signerCcc = ccc.useSigner();

    const { showNotification, removeNotification } = useNotification();
    async function handleWithDraw() {
        if (!txInfo || !signerCcc) {
            return
        }
        let progressId, txHash
        try {

            const cccTx = ccc.Transaction.fromLumosSkeleton(txInfo.tx);
           
            txHash = await signerCcc.sendTransaction(cccTx);
            console.log(txHash)
            progressId = await showNotification("progress", `Deposit in progress!`);

        } finally {
            setAmount('0')
            removeNotification(progressId + '')
            showNotification("success", `Deposit Success: ${txHash}`);
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
    const handleAmountChange = useCallback((e: { target: { value: React.SetStateAction<string>; }; }) => {
        setAmount(e.target.value)
    }, [])

    const [sortedTable, setSortedTable, dir, setDir, key, setKey] = UseSorter<
        SorterObj
    >(pendingIckbs);
    const handleOnClick = (
        currentHead:Column
    ) => {
        const currentSortDir =
            dir?.valueOf() === SortDirection.Ascending.valueOf()
                ? SortDirection.Descending
                : SortDirection.Ascending;

        if (dir === undefined) {
            setDir(SortDirection.Ascending);
        } else {
            setDir(currentSortDir);
        }
        if (currentHead) {
            setKey(currentHead.key as keyof SorterObj);
        }
    };
    const Arrow = (props: ArrowProps) => {
        if (props.sortDir !== undefined && props.active) {
            return SortDirection.Ascending.valueOf() === props.sortDir.valueOf() ? (
                <div className="flex flex-col">
                    <ChevronUp color="rgba(255,255,255,0.4)" size={12} />
                    <ChevronDown color="rgba(255,255,255,1)" size={12} />
                </div>
            ) : (
                <div className="flex flex-col">
                    <ChevronUp color="rgba(255,255,255,1)" size={12} />
                    <ChevronDown color="rgba(255,255,255,0.4)" size={12} />
                </div>
                // <AArrowUp />
            );
        }
        return (<div className="flex flex-col">
            <ChevronUp color="rgba(255,255,255,0.4)" size={12} />
            <ChevronDown color="rgba(255,255,255,0.4)" size={12} />
        </div>);
    };
    const togglePendingShow = ()=>{
        setPendingShow(!pendingShow)
    }
    return (
        <>
            <div className="flex flex-row font-play mb-4 mt-8 text-left">
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center"><span className="w-2 h-2 bg-green-500 mr-2"></span>Withdrawable iCKB</p>
                    <p className="text-2xl font-bold font-play mb-4">{ickbData && toText(ickbData?.ickbUdtAvailable)} <span className="text-base font-normal">CKB</span></p>

                </div>
                <div className="basis-1/2">
                    <p className="text-gray-400 mb-2 flex items-center"><span className="w-2 h-2 bg-yellow-500 mr-2"></span>Pending iCKB</p>
                    <p className="text-2xl font-bold font-play mb-4"> <span className="text-base font-normal">- iCKB</span></p>
                </div>
            </div>
            <div className='relative mb-4 flex'>
                {/* <label className="flex px-2 items-center"><img src="/svg/icon-ckb.svg" alt="CKB" className="mr-2" /> CKB</label> */}
                <input className="w-full text-left rounded border  border-[#777] bg-gray-700  hover:border-cyan-500 focus:border-cyan-500  text-lg p-3 mt-1 pr-16 pl-14"
                    type="text"
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
                <span>{amount ? <>≈{approxConversion(BigInt(Math.trunc(parseFloat(amount) * 100000000)))} iCKB</> : 'Calculated after entry'}</span>
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
                })()}
            >
                {amount ? 'WithDraw' : 'Enter an amount'}

            </button>
            <div className="mt-8 w-full">
                <div className="flex items-center" onClick={togglePendingShow}> 
                    {pendingShow?<ChevronUp color="rgba(255,255,255,1)" size={18} />:<ChevronDown color="rgba(255,255,255,1)" size={18} />}
                    Pending iCKB Details</div>
                {pendingShow&&<>
                {columns&&columns.length>0?<table className="w-full mt-4 table-auto">
                    <thead className="border border-t-0 border-l-0	border-r-0 border-gray-500">
                        <tr>
                            {columns.map((c, index) => {
                                return (
                                    <th key={index} className="text-body-2  text-left p-2 cursor-pointer"  onClick={()=>handleOnClick(c)}>
                                   
                                        <div  className="w-full flex items-center justify-between ">
                                            <span className="text-[rgba(255,255,255,0.7)]">{c.name}</span>
                                            <Arrow sortDir={dir} active={c.key === key} />
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    {/* Apply the table body props */}
                    <tbody>
                        {sortedTable.map((c, index) => {
                            return (
                                <tr key={index}>
                                    <td className="text-body-2  text-left p-2 ">{c.amount}</td>
                                    <td className="text-body-2  text-left p-2 ">{new Date(c.daterequested).toLocaleDateString()}</td>
                                    <td className="text-body-2  text-left p-2 "><ClipLoader className="mr-2" size={16} color="#00FAED" />{calculateDaysDifference(c.daterequested,c.remainingtime)} hours left</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>:<p>You don’t have any pending iCKB </p>}
                
                
                </>}
            </div>
        </>
    );
};

export default IckbWithDraw;
