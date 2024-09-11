/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ccc } from '@ckb-ccc/connector-react';
import { truncateString } from '@/utils/stringUtils';
import Link from 'next/link';

interface DaoWithdrawDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dao: ccc.Cell;
  amount: string;
  profit: string;
  remainingDays: number;
  infos: [bigint, ccc.ClientTransactionResponse, ccc.ClientBlockHeader, [ccc.ClientTransactionResponse | undefined, ccc.ClientBlockHeader]] | undefined;
}

const DaoWithdrawDetailModal: React.FC<DaoWithdrawDetailModalProps> = ({ isOpen, onClose,  remainingDays, amount, profit, dao, infos }) => {
  const [withdrawData, setWithdrawData] = useState({
    amount: '0',
    originalDeposit: '0',
    compensation: '0',
    transactionFee: '0',
    depositDate: '',
    withdrawInitiatedDate: '',
    expectedCompletionDate: '',
    remainingDays: 0
  });
  const [inputsValue, setInputsValue] = useState<bigint | 'undefined'>('undefined');
  const [outputsValue, setOutputsValue] = useState<bigint | 'undefined'>('undefined');
  const [createTime, setCreateTime] = useState<string>('');
  const [withdrawTime, setWithdrawTime] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  // const [isLoading, setIsLoading] = useState(true);
  const transaction = infos?.[1].transaction;
  const [transactionFee, setTransactionFee] = useState<string>('');
  useEffect(() => {
    if (transaction) {
      const transactionTemp = new ccc.Transaction(transaction.version, transaction?.cellDeps, transaction?.headerDeps, transaction?.inputs, transaction?.outputs, transaction?.outputsData, transaction?.witnesses);      //TESTNET
      (async () => {
        const inputsV = await transactionTemp.getInputsCapacity(new ccc.ClientPublicTestnet());
        setInputsValue(inputsV);
      })();
      const outputsV = transactionTemp.getOutputsCapacity();
      const hash = transactionTemp.hash();
      const timeStamp = infos?.[2].timestamp ? new Date(Number(infos?.[2].timestamp)).toLocaleString(): '----,--,--,--:--';
      const withdrawInitiatedDate = infos?.[3][1].timestamp ? new Date(Number(infos?.[3][1].timestamp)).toLocaleString(): '----,--,--,--:--';
      setCreateTime(timeStamp);
      setWithdrawTime(withdrawInitiatedDate);
      setOutputsValue(outputsV);
      setTxHash(hash);
    }
  }, [transaction, infos]);

  
  useEffect(() => {
    if (inputsValue !== 'undefined' && outputsValue !== 'undefined') {
      const fee = BigInt(inputsValue) - BigInt(outputsValue);
      setTransactionFee(ccc.fixedPointToString(fee));
      // setIsLoading(false);
    }
  }, [inputsValue, outputsValue]);
  // 这里可以使用 hooks 来获取和计算数据
  useEffect(() => {
    // 示例: 从 dao 对象获取数据并更新 state
    // 实际实现可能需要更复杂的逻辑和计算
    const fetchData = async () => {
      // 这里添加获取和计算数据的逻辑
      // 例如:
      // const amount = await calculateAmount(dao);
      // const compensation = await calculateCompensation(dao);
      // ...

      setWithdrawData({
        amount: ccc.fixedPointToString(dao.cellOutput.capacity),
        originalDeposit: '74,999.9998',
        compensation: '0.048',
        transactionFee: '0.00023',
        depositDate: 'Sep 01, 2024, 13:56',
        withdrawInitiatedDate: 'Sep 09, 2024, 08:39',
        expectedCompletionDate: 'Sep 29, 2024, 08:39',
        remainingDays: 20
      });
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, dao]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 bg-gray-950 rounded-full p-2 text-gray-400 hover:text-white"
        >
          <img src="./svg/close.svg" alt="Close" width={18} height={18}/>
        </button>

        <h2 className="text-2xl font-bold font-play mb-4">Withdraw</h2>

        <div className="flex justify-center items-center mb-4">
          <div className="bg-purple-600 rounded-full p-3">
            <Image src="/svg/withdraw.svg" alt="Withdraw" width={24} height={24} />
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-2xl font-play font-bold">{ amount } CKB</p>
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
            <span className="text-green-400">+ { profit } CKB</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Transaction ID</span>
            <span>{truncateString(txHash, 6, 4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Deposited Date</span>
            <span>{withdrawTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Withdraw Initiated Date</span>
            <span>{createTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Expected Completion Date</span>
            <span>{withdrawData.expectedCompletionDate}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Status</span>
            <span className="bg-yellow-alpha text-orange-300 px-2 py-1 rounded text-sm">In Progress</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Current Cycle</span>
            <span>Cycle #1</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Time Remaining</span>
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>{remainingDays} days remaining</span>
            </div>
          </div>
        </div>

        <Link className="w-full flex gap-4 justify-center items-center bg-btn-gradient text-gray-800 text-body-2 py-3 rounded-lg hover:bg-btn-gradient-hover transition duration-200"  target='_blank' href={`https://pudge.explorer.nervos.org/transaction/${txHash}`}>
          <img src="./svg/external-link-black.svg" alt="Explorer" width={18} height={18}/>
          <p>View on Explorer</p>
        </Link>
      </div>
    </div>
  );
};

export default DaoWithdrawDetailModal;
