import { useGetExplorerLink } from "@/hooks/Explorer";
import { useNotification } from "@/context/NotificationProvider";
import { truncateString } from "@/utils/stringUtils";
import { ccc } from "@ckb-ccc/connector-react";
import React, { useEffect, useState } from "react";
import CircularProgress from "./CircularProgress";

interface DaoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cell:
    | [
        bigint,
        ccc.ClientTransactionResponse,
        ccc.ClientBlockHeader,
        [ccc.ClientTransactionResponse | undefined, ccc.ClientBlockHeader]
      ]
    | undefined;
  amount: string;
  profit: string;
  remainingDays: number;
  cycle: number;
  dao: ccc.Cell;
}

export function DaoDepositDetailModal({
  isOpen,
  onClose,
  remainingDays,
  cycle,
  cell,
  amount,
  profit,
  dao,
}: DaoDetailModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [transactionFee, setTransactionFee] = useState<string>("");
  const [createTime, setCreateTime] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const transaction = cell?.[1].transaction;

  const { index } = useGetExplorerLink();

  const signer = ccc.useSigner();
  const { showNotification } = useNotification();

  const withdraw = async () => {
    if (!signer || !cell) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, _depositTx] = cell;
    if (!_depositTx.blockHash || !_depositTx.blockNumber) {
      showNotification("error", "Unknown error, invalid redeem");
      return;
    }
    const { blockHash, blockNumber } = _depositTx;
    const tx = ccc.Transaction.from({
      headerDeps: [blockHash],
      inputs: [{ previousOutput: dao.outPoint }],
      outputs: [dao.cellOutput],
      outputsData: [ccc.numLeToBytes(blockNumber, 8)],
    });
    await tx.addCellDepsOfKnownScripts(
      signer.client,
      ccc.KnownScript.NervosDao
    );
    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeBy(signer, 1000);
    const result = await signer.sendTransaction(tx);
    showNotification("success", `Redeem Success: ${result}`);
  };

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
      setIsLoading(false);
    })();
    const hash = transaction.hash();
    const timeStamp = cell?.[2].timestamp
      ? new Date(Number(cell?.[2].timestamp)).toLocaleString()
      : "-";
    setCreateTime(timeStamp);
    setTxHash(hash);
  }, [transaction, cell, signer]);

  if (!isOpen) {
    return undefined;
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

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

        <h2 className="text-2xl font-bold mb-4 font-play">Deposit</h2>

        <div className="flex flex-col items-center mb-4">
          <div className="bg-cyan-500 rounded-full p-2 mb-2">
            <img src="./svg/deposit.svg" alt="CKB" width={24} height={24} />
          </div>
          <div className="text-2xl font-play font-bold">{amount} CKB</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex justify-between mb-2 font-work-sans">
            <span>Transaction Fee</span>
            {isLoading ? (
              <span className="animate-pulse bg-gray-300 h-6 w-24 rounded"></span>
            ) : (
              <span>{transactionFee} CKB</span>
            )}
          </div>
          <div className="flex justify-between font-work-sans">
            <span>Total</span>
            {isLoading ? (
              <span className="animate-pulse bg-gray-300 h-6 w-24 rounded"></span>
            ) : (
              <span>{parseFloat(amount) + parseFloat(transactionFee)} CKB</span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-2 font-work-sans">
            <span className="text-gray-400">Transaction Hash</span>
            <span>{truncateString(txHash, 6, 4)} </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Deposited Date</span>
            <span> {createTime} </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Status</span>
            {cell?.[1].status === "committed" ? (
              <span className="bg-cyan-900 text-cyan-400 px-2 py-0.5 rounded text-xs flex items-center">
                Success
              </span>
            ) : (
              <span className="bg-orange-300 text-orange-800 px-2 py-0.5 rounded text-xs flex items-center">
                Pending
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Current Cycle</span>
            <span>Cycle #{Math.ceil(cycle)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Time Remaining</span>
            <span className="flex items-center gap-2">
              <CircularProgress
                percentage={(3000 - remainingDays * 100) / 30}
                size={16}
                noText
                strokeWidth={2}
                progressColor="#00FAED"
              />
              {Math.ceil(remainingDays)} days
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Estimated Compensation</span>
            <span>{profit} CKB</span>
          </div>
        </div>

        <button
          className="w-full font-bold bg-btn-gradient text-gray-800 text-body-2 py-3 rounded-lg hover:bg-btn-gradient-hover transition duration-200"
          onClick={withdraw}
        >
          Redeem
        </button>

        <a
          target="_blank"
          href={`${index}/transaction/${txHash}`}
          className="text-teal-400 hover:text-teal-300 flex items-center justify-center pt-4"
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
          View on Explorer
        </a>
      </div>
    </div>
  );
}
