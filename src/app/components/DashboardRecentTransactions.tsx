import React, { useMemo } from "react";
import DashboardHistoryItem from "./DashboardHistoryItem";
import { useDaoDeposits, useDaoRedeems } from "@/hooks/DaoCollect";
import { DashboardRecentTransactionsSkeleton } from "./TransactionSkeleton";
import { ccc } from "@ckb-ccc/connector-react";

interface DashboardRecentTransactionsProps {
  type?: "all" | "deposit" | "withdraw";
  limit?: number;
  showViewAll?: boolean;
  title?: string;
}

export function DashboardRecentTransactions({
  type = "all",
  limit = 5,
  showViewAll = true,
  title = "Recent Transactions",
  ...props
}: DashboardRecentTransactionsProps & React.ComponentPropsWithoutRef<"div">) {
  const {
    cells: depositCells,
    isLoading: isLoadingDeposits,
    error: depositError,
  } = useDaoDeposits();
  const {
    cells: withdrawalCells,
    isLoading: isLoadingWithdrawals,
    error: withdrawalError,
  } = useDaoRedeems();

  const combinedCells = useMemo(() => {
    let cellsToProcess: { cell: ccc.Cell; isRedeeming: boolean }[] = [];
    if (type === "all" || type === "deposit") {
      cellsToProcess = [
        ...cellsToProcess,
        ...depositCells.map((cell) => ({
          cell,
          isRedeeming: false,
        })),
      ];
    }
    if (type === "all" || type === "withdraw") {
      cellsToProcess = [
        ...cellsToProcess,
        ...withdrawalCells.map((cell) => ({
          cell,
          isRedeeming: true,
        })),
      ];
    }
    return cellsToProcess;
  }, [depositCells, withdrawalCells, type]);

  const isLoading =
    (type === "all" || type === "deposit" ? isLoadingDeposits : false) ||
    (type === "all" || type === "withdraw" ? isLoadingWithdrawals : false);
  const error =
    (type === "all" || type === "deposit" ? depositError : null) ||
    (type === "all" || type === "withdraw" ? withdrawalError : null);

  if (isLoading) {
    return <DashboardRecentTransactionsSkeleton {...props} />;
  }

  if (error) {
    return (
      <div {...props} className={`text-red-500 ${props.className}`}>
        Error: {error.message}
      </div>
    );
  }

  if (combinedCells.length === 0) {
    return (
      <div
        {...props}
        className={`bg-gray-800 rounded-lg p-4 text-center ${props.className}`}
      >
        <p className="text-gray-400">No recent transactions</p>
      </div>
    );
  }

  return (
    <div
      {...props}
      className={`bg-gray-900 rounded-lg p-4 flex-grow ${props.className}`}
    >
      <h3 className="text-xl font-play font-bold mb-4">{title}</h3>
      <div className="mt-6">
        {combinedCells.slice(0, limit).map(({ cell, isRedeeming }, index) => (
          <DashboardHistoryItem
            key={index}
            cell={cell}
            isRedeeming={isRedeeming}
          />
        ))}
        {showViewAll && combinedCells.length > limit && (
          <button className="text-cyan-400 mt-4 hover:underline">
            View all history
          </button>
        )}
      </div>
    </div>
  );
}
