import React, { useMemo } from 'react';
import DashboardHistoryItem from './DashboardHistoryItem';
import { addTypeToCell, CellWithType, sortCells } from '@/utils/cellUtils';
import { Cell } from '@ckb-lumos/lumos';
import { useCollectDeposits, useCollectWithdrawals } from '@/hooks/DaoCollect';
import DashboardRecentTransactionsSkeleton from './TransactionSkeleton';

interface RecentTransactionsProps {
  type?: 'all' | 'deposit' | 'withdraw';
  limit?: number;
  showViewAll?: boolean;
  title?: string;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  type = 'all',
  limit = 5,
  showViewAll = true,
  title = 'Recent Transactions'
}) => {
  const { cells: depositCells, isLoading: isLoadingDeposits, error: depositError } = useCollectDeposits();
  const { cells: withdrawalCells, isLoading: isLoadingWithdrawals, error: withdrawalError } = useCollectWithdrawals();

  const sortedCells = useMemo(() => {
    let cellsToProcess: CellWithType[] = [];
    if (type === 'all' || type === 'deposit') {
      cellsToProcess = [...cellsToProcess, ...depositCells.map((cell: Cell) => addTypeToCell(cell, 'deposit'))];
    }
    if (type === 'all' || type === 'withdraw') {
      cellsToProcess = [...cellsToProcess, ...withdrawalCells.map((cell: Cell) => addTypeToCell(cell, 'withdraw'))];
    }
    return sortCells(cellsToProcess);
  }, [depositCells, withdrawalCells, type]);

  const isLoading = (type === 'all' || type === 'deposit' ? isLoadingDeposits : false) || 
                    (type === 'all' || type === 'withdraw' ? isLoadingWithdrawals : false);
  const error = (type === 'all' || type === 'deposit' ? depositError : null) || 
                (type === 'all' || type === 'withdraw' ? withdrawalError : null);

  if (isLoading) {
    return <DashboardRecentTransactionsSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (sortedCells.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 flex-grow">
      <h3 className="text-xl font-play font-bold mb-4">{title}</h3>
      <div className="mt-6">
        {sortedCells.slice(0, limit).map((cell, index) => (
          <DashboardHistoryItem
            key={index}
            type={cell.type}
            amount={cell.cellOutput.capacity}
            blockNumber={cell.blockNumber || '0x0'}
          />
        ))}
        {showViewAll && sortedCells.length > limit && (
          <button className="text-cyan-400 mt-4 hover:underline">View all history</button>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
