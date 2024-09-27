"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import CircularProgress from "./CircularProgress";
import { ccc } from "@ckb-ccc/connector-react";
import { formatBalance, truncateAddress } from "@/utils/stringUtils";
import { useDaoDeposits, useDaoRedeems } from "@/hooks/DaoCollect";
import SkeletonLoader from "./SkeletonLoader";
import { User } from "lucide-react";

const DashboardProfile: React.FC = () => {
  const [balance, setBalance] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [apy, setApy] = useState("-");
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const {
    profitSum: depositProfit,
    sum: depositSum,
    isLoading: isLoadingDeposits,
  } = useDaoDeposits();
  const {
    profitSum: withdrawalProfit,
    sum: withdrawalSum,
    isLoading: isLoadingWithdrawals,
  } = useDaoRedeems();
  const { wallet, open } = ccc.useCcc();
  const signer = ccc.useSigner();

  useEffect(() => {
    if (!signer) {
      return;
    }

    (async () => {
      const addr = await signer.getRecommendedAddress();
      setAddress(addr);
    })();

    const refresh = async () => {
      try {
        const bal = await signer.getBalance();
        const tip = await signer.client.getTipHeader();
        // 75600 blocks equals about 7 days
        const past = await signer.client.getHeaderByNumber(
          ccc.numMax(tip.number - ccc.numFrom("75600"), 1)
        );
        if (past) {
          setBalance(ccc.fixedPointToString(bal));
          const times =
            (ccc.numFrom(365 * 24 * 60 * 60 * 1000) * ccc.fixedPointFrom(1)) /
            (tip.timestamp - past.timestamp);
          setApy(
            `~${ccc.fixedPointToString(
              ((tip.dao.ar - past.dao.ar) *
                ccc.numFrom(100) *
                ccc.fixedPointFrom(1) *
                times) /
                past.dao.ar /
                ccc.fixedPointFrom(1) /
                ccc.fixedPointFrom(1, 6),
              2
            )}%`
          );
        }
      } catch (error) {
      } finally {
        setIsLoadingBalance(false);
      }
    };

    const interval = setInterval(refresh, 5000);
    refresh();
    return () => clearInterval(interval);
  }, [signer]);

  const isLoading =
    isLoadingBalance || isLoadingDeposits || isLoadingWithdrawals;

  if (isLoading) {
    return <SkeletonLoader />;
  }

  const profit = depositProfit + withdrawalProfit;
  const totalBalance = ccc.numMax(
    BigInt(ccc.fixedPointFrom(balance, 8)) +
      depositSum +
      withdrawalSum +
      profit,
    ccc.numFrom(1)
  );
  const availablePercentage =
    Number((ccc.fixedPointFrom(balance, 8) * BigInt(100)) / totalBalance) || 0;
  const depositedPercentage =
    Number((depositSum * BigInt(100)) / totalBalance) || 0;
  const withdrawingPercentage =
    Number((withdrawalSum * BigInt(100)) / totalBalance) || 0;

  return (
    <div className="bg-gray-900 rounded-lg p-4 w-full">
      <div className="flex items-center mb-4 cursor-pointer" onClick={open}>
        <div className="rounded-full p-2 mr-3">
          {wallet && <img src={wallet.icon} alt="avatar" className="w-6 h-6" />}
        </div>
        <div>
          <h2 className="font-play text-cyan-400 text-2xl font-bold">
            {formatBalance(ccc.fixedPointToString(totalBalance))} CKB
          </h2>
          <p className="font-work-sans text-gray-400 text-sm flex items-center gap-2">
            {truncateAddress(address, 10, 6)} <User className="w-4 h-4"/>
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
      <div className="bg-gray-800 relative rounded-lg p-3 pr-5 mb-2">
        <div className="flex justify-between items-center font-work-sans text-gray-400">
          <span>Current Compensation</span>
          <span>APY</span>
        </div>
        <div className="flex justify-between items-center mt-1 font-play text-white text-lg font-bold">
          <span>{ccc.fixedPointToString(profit, 8)} CKB</span>
          <span>{apy}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfile;
