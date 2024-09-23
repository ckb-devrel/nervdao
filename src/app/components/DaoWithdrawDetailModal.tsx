import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ccc } from "@ckb-ccc/connector-react";
import { truncateString } from "@/utils/stringUtils";
import Link from "next/link";
import CircularProgress from "./CircularProgress";
import { useGetExplorerLink } from "@/hooks/Explorer";
import { useNotification } from "@/context/NotificationProvider";
import { getClaimEpoch } from "@/utils/epoch";

interface DaoWithdrawDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dao: ccc.Cell;
  amount: string;
  profit: string;
  remainingDays: number;
  cycle: number;
  tip: ccc.ClientBlockHeader | undefined;
  infos:
    | [
        bigint,
        ccc.ClientTransactionResponse,
        ccc.ClientBlockHeader,
        [ccc.ClientTransactionResponse | undefined, ccc.ClientBlockHeader]
      ]
    | undefined;
}

export function DaoWithdrawDetailModal({
  isOpen,
  onClose,
  remainingDays,
  amount,
  profit,
  cycle,
  infos,
  dao,
  tip,
}: DaoWithdrawDetailModalProps) {
  const { index } = useGetExplorerLink();
  const signer = ccc.useSigner();

  const [createTime, setCreateTime] = useState<string>("");
  const [withdrawTime, setWithdrawTime] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const transaction = infos?.[3][0]?.transaction;
  const [transactionFee, setTransactionFee] = useState<string>("");
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!transaction || !signer) {
      return;
    }

    (async () => {
      setTransactionFee(
        ccc.fixedPointToString(
          (await transaction.getInputsCapacity(signer.client)) -
            transaction.getOutputsCapacity()
        )
      );
    })();
    const hash = transaction.hash();
    const timeStamp = infos?.[2].timestamp
      ? new Date(Number(infos?.[2].timestamp)).toLocaleString()
      : "-";
    const withdrawInitiatedDate = infos?.[3][1].timestamp
      ? new Date(Number(infos?.[3][1].timestamp)).toLocaleString()
      : "-";
    setCreateTime(timeStamp);
    setWithdrawTime(withdrawInitiatedDate);
    setTxHash(hash);
  }, [transaction, signer, infos]);

  const withdraw = useCallback(async () => {
    if (!signer || !infos) return;
    const [profit, depositTx, depositHeader] = infos;
    if (!depositTx.blockHash) {
      showNotification("error", "Unknown error, invalid withdraw");
      return;
    }
    const { blockHash } = depositTx;
    if (!infos[3]) {
      showNotification("error", "Unknown error, invalid withdraw");
      return;
    }
    const [withdrawTx, withdrawHeader] = infos[3];
    if (!withdrawTx?.blockHash) {
      showNotification("error", "Unknown error, invalid withdraw");
      return;
    }
    const tx = ccc.Transaction.from({
      headerDeps: [withdrawTx.blockHash, blockHash],
      inputs: [
        {
          previousOutput: dao.outPoint,
          since: {
            relative: "absolute",
            metric: "epoch",
            value: ccc.epochToHex(getClaimEpoch(depositHeader, withdrawHeader)),
          },
        },
      ],
      outputs: [
        {
          lock: (await signer.getRecommendedAddressObj()).script,
        },
      ],
      witnesses: [
        ccc.WitnessArgs.from({
          inputType: ccc.numLeToBytes(1, 8),
        }).toBytes(),
      ],
    });
    await tx.addCellDepsOfKnownScripts(
      signer.client,
      ccc.KnownScript.NervosDao
    );

    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeChangeToOutput(signer, 0, 1000);
    tx.outputs[0].capacity += profit;
    const result = await signer.sendTransaction(tx);
    showNotification("success", `Withdraw Success: ${result}`);
  }, [signer, infos, dao, showNotification]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  if (!isOpen) {
    return undefined;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-gray-950 rounded-full p-2 text-gray-400 hover:text-white"
        >
          <img src="./svg/close.svg" alt="Close" width={18} height={18} />
        </button>

        <h2 className="text-2xl font-bold font-play mb-4">Redemption</h2>

        <div className="flex justify-center items-center mb-4">
          <div className="bg-purple-600 rounded-full p-3">
            <Image
              src="/svg/withdraw.svg"
              alt="Withdraw"
              width={24}
              height={24}
            />
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-2xl font-play font-bold">{amount} CKB</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span>Original Deposit</span>
            <span>{amount} CKB</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Transaction Fee</span>
            <span>-{transactionFee} CKB</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Compensation</span>
            <span className="text-green-400">+{profit} CKB</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Transaction Hash</span>
            <span>{truncateString(txHash, 6, 4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Deposited Date</span>
            <span>{createTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Redeem Date</span>
            <span>{withdrawTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Expected Settle Date</span>
            <span>
              {!tip
                ? "-"
                : new Date(
                    Number(tip.timestamp) + remainingDays * 24 * 60 * 60 * 1000
                  ).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Status</span>
            {infos?.[1].status === "committed" ? (
              remainingDays >= 0 ? (
                <span className="bg-purple-900 text-purple-400 px-2 py-0.5 rounded text-xs flex items-center">
                  Redeeming
                </span>
              ) : (
                <span className="bg-green-900 text-green-400 px-2 py-0.5 rounded text-xs flex items-center">
                  Withdrawable
                </span>
              )
            ) : (
              <span className="bg-orange-300 text-orange-800 px-2 py-0.5 rounded text-xs flex items-center">
                Pending
              </span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cycle</span>
            <span>Cycle #{Math.ceil(cycle)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Settlement Period</span>
            <div className="flex items-center gap-2">
              {remainingDays >= 0 ? (
                <>
                  <CircularProgress
                    percentage={(3000 - remainingDays * 100) / 30}
                    size={16}
                    noText
                    strokeWidth={2}
                    progressColor="#8C76FF"
                  />
                  <span>{Math.ceil(remainingDays)} days remaining</span>
                </>
              ) : (
                "Ended"
              )}
            </div>
          </div>
        </div>

        <button
          className="w-full font-bold bg-btn-gradient text-gray-800 text-body-2 py-3 rounded-lg hover:bg-btn-gradient-hover transition duration-200 disabled:opacity-50 disabled:hover:bg-btn-gradient"
          onClick={withdraw}
          disabled={remainingDays >= 0}
        >
          Withdraw
        </button>

        <Link
          className="text-teal-400 hover:text-teal-300 flex items-center justify-center pt-4"
          target="_blank"
          href={`${index}/transaction/${txHash}`}
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <p>View on Explorer</p>
        </Link>
      </div>
    </div>
  );
}
