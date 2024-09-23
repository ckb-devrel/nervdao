"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useDaoDeposits, useDaoRedeems } from "@/hooks/DaoCollect";
import { getProfit } from "@/utils/epoch";
import SkeletonLoader from "./SkeletonLoader";
import CircularProgress from "./CircularProgress";

const WithdrawProfile: React.FC = () => {
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [totalProfit, setTotalProfit] = useState<ccc.FixedPoint>(ccc.Zero);
  const {
    sum: depositSum,
    isLoading: isLoadingDeposits,
    error: depositError,
  } = useDaoDeposits();
  const {
    sum: withdrawalSum,
    isLoading: isLoadingWithdrawals,
    error: withdrawalError,
  } = useDaoRedeems();
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
                "0x"
              ),
              scriptLenRange: [33, 34],
              outputDataLenRange: [8, 9],
            },
            true
          )) {
            daos.push(cell);
          }
          let sumProfit = BigInt(0);
          for (const dao of daos) {
            const previousTx = await signer.client.getTransaction(
              dao.outPoint.txHash
            );
            if (!previousTx?.blockHash) {
              return;
            }
            const previousHeader = await signer.client.getHeaderByHash(
              previousTx.blockHash
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
              depositTx.blockHash
            );

            if (!depositHeader) {
              return;
            }
            sumProfit += getProfit(dao, depositHeader, previousHeader);
          }
          setTotalProfit(sumProfit);
          setIsLoadingBalance(true);
        } catch (error) {
        } finally {
          setIsLoadingBalance(false);
        }
      })();
    }
  }, [signer]);

  const isLoading =
    isLoadingBalance || isLoadingDeposits || isLoadingWithdrawals;
  const error = depositError || withdrawalError;

  const totalBalance = ccc.numMax(
    totalProfit + depositSum + withdrawalSum,
    ccc.numFrom(1)
  );
  const depositedPercentage =
    Number((depositSum * BigInt(100)) / totalBalance) || 0;
  const withdrawingPercentage =
    Number((withdrawalSum * BigInt(100)) / totalBalance) || 0;
  const profitPercentage =
    Number((totalProfit * BigInt(100)) / totalBalance) || 0;

  if (isLoading) {
    return (
      <SkeletonLoader showHeader={false} itemCount={3} showChart={false} />
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
        <div className="text-xl font-bold font-play">Overview</div>
      </div>

      {[
        {
          label: "Deposited CKB",
          value: ccc.fixedPointToString(depositSum),
          percentage: depositedPercentage,
          color: "#00FAED",
        },
        {
          label: "Redeeming CKB",
          value: ccc.fixedPointToString(withdrawalSum),
          percentage: withdrawingPercentage,
          color: "#8C76FF",
        },
        {
          label: "Cumulative Compensation",
          value: totalProfit,
          percentage: profitPercentage,
          color: "#3CFF97",
        },
      ].map(({ label, value, percentage, color }, index) => (
        <div
          key={index}
          className="bg-gray-800 relative rounded-lg p-3 mb-2"
        >
          <div className="flex justify-between items-center">
            <span className="font-work-sans text-gray-400">{label}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="font-play text-white text-lg font-bold">
              {ccc.fixedPointToString(value, 8)} CKB
            </span>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CircularProgress
              percentage={Math.round(percentage)}
              size={48}
              strokeWidth={3}
              progressColor={color}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default WithdrawProfile;
