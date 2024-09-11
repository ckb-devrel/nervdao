import React from 'react';
import { ccc, numFrom } from '@ckb-ccc/connector-react';

interface DashboardHistoryItemProps {
  type: 'deposit' | 'withdraw';
  amount: string;
  blockNumber: string;
}

const DashboardHistoryItem: React.FC<DashboardHistoryItemProps> = ({ type, amount, blockNumber }) => {
  const iconColor = type === 'deposit' ? 'bg-cyan-500' : 'bg-purple-500';
  const actionText = type === 'deposit' ? 'Deposit to Nervos DAO' : 'Withdraw from Nervos DAO';
  const formattedAmount = ccc.fixedPointToString(numFrom(amount));
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <div className={`${iconColor} rounded-full p-2 mr-3`}>
          {type === 'deposit' ? (
            <img src={'./svg/deposit.svg'} alt="Deposit" />
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-white font-work-sans text-body-2">{actionText}</p>
          <p className="text-gray-400 font-work-sans text-sm">Block: {blockNumber}</p>
        </div>
      </div>
      <div className="text-white font-work-sans text-body-2">
        {type === 'deposit' ? '' : '-'}{formattedAmount} CKB
      </div>
    </div>
  );
};

export default DashboardHistoryItem;
