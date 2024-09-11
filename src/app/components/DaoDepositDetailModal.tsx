/* eslint-disable @next/next/no-img-element */
// import { useGetExplorerLink } from '@/hooks/Explorer';
import { useNotification } from '@/context/NotificationProvider';
import { getClaimEpoch } from '@/utils/epoch';
import { truncateString } from '@/utils/stringUtils';
import { ccc } from '@ckb-ccc/connector-react';
import React, { useEffect, useState } from 'react';

interface DaoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cell: [bigint, ccc.ClientTransactionResponse, ccc.ClientBlockHeader, [ccc.ClientTransactionResponse | undefined, ccc.ClientBlockHeader]] | undefined;
  amount: string;
  profit: string;
  remainingDays: number;
  isNew: boolean;
  dao: ccc.Cell;
}

const DaoDepositDetailModal: React.FC<DaoDetailModalProps> = ({ isOpen, onClose, remainingDays, cell, amount, profit, isNew, dao }) => {
  const [inputsValue, setInputsValue] = useState<bigint | 'undefined'>('undefined');
  const [outputsValue, setOutputsValue] = useState<bigint | 'undefined'>('undefined');
  const [isLoading, setIsLoading] = useState(true);
  const [transactionFee, setTransactionFee] = useState<string>('');
  const [createTime, setCreateTime] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const transaction = cell?.[1].transaction;

  // const { explorerTransaction } = useGetExplorerLink();

  const signer = ccc.useSigner();
  const { showNotification } = useNotification();
  
  const withdraw = async () => {
    if(!signer || !cell) return;
    const [_profit, _depositTx, _depositHeader] = cell;
    if(!_depositTx.blockHash || !_depositTx.blockNumber) {
      //TODO: handle error
      return
    }
    const { blockHash, blockNumber } = _depositTx;
    let tx;
    if (isNew) {
      tx = ccc.Transaction.from({
        headerDeps: [blockHash],
        inputs: [{ previousOutput: dao.outPoint }],
        outputs: [dao.cellOutput],
        outputsData: [ccc.numLeToBytes(blockNumber, 8)],
      });
      await tx.addCellDepsOfKnownScripts(
        signer.client,
        ccc.KnownScript.NervosDao,
      );
      await tx.completeInputsByCapacity(signer);
      await tx.completeFeeBy(signer, 1000);
    } else {
      if (!cell[3]) {
        //TODO: handle error
        return;
      }
      const [withdrawTx, withdrawHeader] = cell[3];
      if (!withdrawTx?.blockHash) {
        //TODO: handle error
        return;
      }
      if (!withdrawTx.blockHash) {
        //TODO: handle error
        return;
      }
      tx = ccc.Transaction.from({
        headerDeps: [withdrawTx.blockHash, blockHash],
        inputs: [
          {
            previousOutput: dao.outPoint,
            since: {
              relative: "absolute",
              metric: "epoch",
              value: ccc.numLeFromBytes(
                ccc.epochToHex(
                  getClaimEpoch(_depositHeader, withdrawHeader)
                ),
              ),
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
        ccc.KnownScript.NervosDao,
      );

      await tx.completeInputsByCapacity(signer);
      await tx.completeFeeChangeToOutput(signer, 0, 1000);
      tx.outputs[0].capacity += _profit;
    }
    const result = await signer.sendTransaction(tx);
    showNotification('success', `Deposit Success: ${result}`);
  } 

  useEffect(() => {
    if (transaction) {
      const transactionTemp = new ccc.Transaction(transaction.version, transaction?.cellDeps, transaction?.headerDeps, transaction?.inputs, transaction?.outputs, transaction?.outputsData, transaction?.witnesses);      //TESTNET
      (async () => {
        const inputsV = await transactionTemp.getInputsCapacity(new ccc.ClientPublicTestnet());
        setInputsValue(inputsV);
      })();
      const outputsV = transactionTemp.getOutputsCapacity();
      const hash = transactionTemp.hash();
      const timeStamp = cell?.[2].timestamp ? new Date(Number(cell?.[2].timestamp)).toLocaleString(): '----,--,--,--:--';
      setCreateTime(timeStamp);
      setOutputsValue(outputsV);
      setTxHash(hash);
    }
  }, [transaction, cell]);

  
  useEffect(() => {
    if (inputsValue !== 'undefined' && outputsValue !== 'undefined') {
      const fee = BigInt(inputsValue) - BigInt(outputsValue);
      setTransactionFee(ccc.fixedPointToString(fee));
      setIsLoading(false);
    }
  }, [inputsValue, outputsValue]);

  if (!isOpen) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 bg-gray-950 rounded-full p-2 text-gray-400 hover:text-white"
        >
          <img src="./svg/close.svg" alt="Close" width={18} height={18}/>
        </button>

        <h2 className="text-2xl font-bold mb-4 font-play">Deposit</h2>

        <div className="flex flex-col items-center mb-4">
          <div className="bg-cyan-500 rounded-full p-2 mb-2">
            <img src="./svg/deposit.svg" alt="CKB" width={24} height={24}/>
          </div>
          <div className="text-2xl font-play font-bold">{ amount } CKB</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex justify-between mb-2 font-work-sans">
            <span>Transaction Fee</span>
            {isLoading ? (
              <span className="animate-pulse bg-gray-300 h-6 w-24 rounded"></span>
            ) : (
              <span>{ transactionFee } CKB</span>
            )}
          </div>
          <div className="flex justify-between font-work-sans">
            <span>Total</span>
            {isLoading ? (
              <span className="animate-pulse bg-gray-300 h-6 w-24 rounded"></span>
            ) : (
              <span>{parseFloat(amount) + parseFloat( transactionFee )} CKB</span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-2 font-work-sans">
            <span className="text-gray-400">Transaction ID</span>
            <span>{ truncateString(txHash, 6, 4) } </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Deposited Date</span>
            <span> {createTime} </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Status</span>
            {
              cell?.[1].status === 'committed' ? (
                <span className="bg-green-900 text-green-400 px-2 py-0.5 rounded text-xs flex items-center">Success</span>
              ) : (
                <span className="bg-orange-300 text-orange-800 px-2 py-0.5 rounded text-xs flex items-center">Pending</span>
              )
            }
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Current Cycle</span>
            <span>Cycle #1</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Time Remaining</span>
            <span className="flex items-center">
              <svg className="w-4 h-4 text-teal-500 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {remainingDays} days remaining
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Estimated Compensation</span>
            <span>{ profit } CKB</span>
          </div>
        </div>

        <button 
          className="w-full bg-teal-500 text-gray-900 py-2 rounded-lg mb-4 hover:bg-teal-400 transition duration-300"
          onClick={withdraw}
        >
          Withdraw
        </button>

        <a target='_blank' href={`https://pudge.explorer.nervos.org/transaction/${txHash}`} className="text-teal-500 hover:text-teal-400 flex items-center justify-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View on Explorer
        </a>
      </div>
    </div>
  );
};

export default DaoDepositDetailModal;
