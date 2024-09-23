"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import CircularProgress from "./CircularProgress";
import { ccc } from "@ckb-ccc/connector-react";
import { formatBalance, truncateAddress } from "@/utils/stringUtils";
import { useDaoDeposits, useDaoRedeems } from "@/hooks/DaoCollect";
import SkeletonLoader from "./SkeletonLoader";

const DashboardProfile: React.FC = () => {
  const [balance, setBalance] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
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
  const { wallet } = ccc.useCcc();
  const signer = ccc.useSigner();

  useEffect(() => {
    if (signer) {
      (async () => {
        try {
          setIsLoadingBalance(true);
          const addr = await signer.getRecommendedAddress();
          const bal = await signer.getBalance();
          setBalance(ccc.fixedPointToString(bal));
          setAddress(addr);
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

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 w-full flex justify-center items-center h-64">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  const totalBalance =
    BigInt(ccc.fixedPointFrom(balance, 8)) + depositSum + withdrawalSum;
  const availablePercentage =
    Number((ccc.fixedPointFrom(balance, 8) * BigInt(100)) / totalBalance) || 0;
  const depositedPercentage =
    Number((depositSum * BigInt(100)) / totalBalance) || 0;
  const withdrawingPercentage =
    Number((withdrawalSum * BigInt(100)) / totalBalance) || 0;

  return (
    <div className="bg-gray-900 rounded-lg p-4 w-full">
      <div className="flex items-center mb-4">
        <div className="rounded-full p-2 mr-3">
          {wallet && <img src={wallet.icon} alt="avatar" className="w-6 h-6" />}
        </div>
        <div>
          <h2 className="font-play text-cyan-400 text-2xl font-bold">
            {formatBalance(ccc.fixedPointToString(totalBalance))} CKB
          </h2>
          <p className="font-work-sans text-gray-400 text-sm">
            {truncateAddress(address, 10, 6)}
          </p>
        </div>
      </div>

      {[
        {
          label: "Balance",
          value: balance,
          percentage: availablePercentage,
          color: "#3CFF97",
        },
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
      ].map(({ label, value, percentage, color }, index) => (
        <div key={index} className="bg-gray-800 relative rounded-lg p-3 mb-2">
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

export default DashboardProfile;
