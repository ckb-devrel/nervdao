"use client"

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import { ccc } from '@ckb-ccc/connector-react';
import { useCollectDeposits, useCollectWithdrawals } from '@/hooks/DaoCollect';
import { getProfit } from '@/utils/epoch';
// import { addTypeToCell, sortCells } from '@/utils/cellUtils';

const WithdrawProfile: React.FC = () => {
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [totalProfit, setTotalProfit] = useState<string>("");
  const { sum: depositSum, isLoading: isLoadingDeposits, error: depositError } = useCollectDeposits();
  const { sum: withdrawalSum, isLoading: isLoadingWithdrawals, error: withdrawalError } = useCollectWithdrawals();
  const signer = ccc.useSigner();

  useEffect(() => {
    if (signer) {
      (async () => {
        try {
          const daos = [];
          for await (const cell of signer.findCells(
            {
              script: await ccc.Script.fromKnownScript(
                signer.client,
                ccc.KnownScript.NervosDao,
                "0x",
              ),
              scriptLenRange: [33, 34],
              outputDataLenRange: [8, 9],
            },
            true,
          )) {
            daos.push(cell);
          }
          let sumProfit = BigInt(0);
          for (const dao of daos) { 
            const previousTx = await signer.client.getTransaction(
              dao.outPoint.txHash,
            );
            if (!previousTx?.blockHash) {
              return;
            }
            const previousHeader = await signer.client.getHeaderByHash(
              previousTx.blockHash,
            );
            if (!previousHeader) {
              return;
            }
            const depositTxHash =
              previousTx.transaction.inputs[Number(dao.outPoint.index)]
                .previousOutput.txHash;
            const depositTx = await signer.client.getTransaction(depositTxHash);
            if (!depositTx?.blockHash) {
              return;
            }
            const depositHeader = await signer.client.getHeaderByHash(
              depositTx.blockHash,
            );

            if (!depositHeader) {
              return;
            }
            sumProfit += getProfit(dao, depositHeader, previousHeader);
          }
          setTotalProfit(ccc.fixedPointToString(sumProfit));
          setIsLoadingBalance(true);
        } catch (error) {
          console.error('Error fetching balance:', error);
        } finally {
          setIsLoadingBalance(false);
        }
      })();
    }
  }, [signer]);

  const isLoading = isLoadingBalance || isLoadingDeposits || isLoadingWithdrawals;
  const error = depositError || withdrawalError;

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 w-full flex justify-center items-center h-64">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 w-full flex justify-center items-center h-64">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 w-full">
      <div className="flex items-center mb-4">
        <div className='text-xl font-bold font-play'>Overview</div>
      </div>
      
      {[
        { label: 'Deposited CKB', value: ccc.fixedPointToString(depositSum), icon: <img src="./svg/deposit-chart.svg" alt="Deposit" /> },
        { label: 'Withdrawing CKB', value: ccc.fixedPointToString(withdrawalSum), icon: <img src="./svg/withdraw-chart.svg" alt="Withdraw" /> },
        { label: 'Cumulative Compensation', value: totalProfit, icon: <img src="./svg/compensation-chart.svg" alt="Compensation" /> },
      ].map(({ label, value, icon }, index) => (
        <div key={index} className="bg-gray-800 relative rounded-lg p-3 mb-2">
          <div className="relative pr-16">
            <div className="flex justify-between items-center">
              <span className="font-work-sans text-gray-400">{label}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="font-play text-white text-lg font-bold">{ccc.fixedPointToString(value, 8)} CKB</span>
            </div>
            <div className=" absolute top-0 right-0 w-24 h-24">
              {icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WithdrawProfile;
