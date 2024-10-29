
import { Info } from "lucide-react";
import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";
import { ccc } from "@ckb-ccc/connector-react";
import SkeletonLoader from "./SkeletonLoader";
import { useQuery } from "@tanstack/react-query";
import { WalletConfig } from "@/cores/config";
import { l1StateOptions } from "@/cores/queries";

const IckbStatus: React.FC<{ walletConfig: WalletConfig }> = ({ walletConfig }) => {
  const [apy, setApy] = useState("-");
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const { data: ickbData } = useQuery(
    l1StateOptions(walletConfig, false),
  );

  const signer = ccc.useSigner();
  useEffect(() => {
    if (!signer) {
      return;
    }
    const refresh = async () => {
      try {
        const tip = await signer.client.getTipHeader();
        // 75600 blocks equals about 7 days
        const past = await signer.client.getHeaderByNumber(
          ccc.numMax(tip.number - ccc.numFrom("75600"), 1)
        );
        if (past) {
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
  if (isLoadingBalance) {
    return <SkeletonLoader />;
  }
  return (
    <div className="bg-gray-900 rounded-lg p-6 mb-4">
      <h3 className="text-xl font-play font-bold mb-4">Liquidity</h3>
      {/* <ReactApexChart options={ChartData} series={ChartData.series} type="area" height={350} /> */}
      <div className="flex item-center justify-between ">
        <div className="bg-gray-800 relative rounded-lg p-3 pr-5 mb-2  w-[30%]" >
          <div className="flex justify-between items-center font-work-sans text-gray-400">
            <span>Total Liquidity</span>
          </div>
          <div className="flex justify-between items-center mt-1 font-play text-white text-lg font-bold">
            <span>{ickbData?parseFloat((Number(ickbData.ickbUdtPoolBalance)/100000000).toString()).toFixed(2):'-'} iCKB</span>
          </div>
        </div>
        <div className="bg-gray-800 relative rounded-lg p-3 pr-5 mb-2 w-[30%]">
          <div className="flex justify-between items-center font-work-sans text-gray-400">
            <span>Pool Balance <Info size={16} className="inline-block" data-tooltip-id="status-tooltip" data-tooltip-content="Pool Balance" /></span>
          </div>
          <div className="flex justify-between items-center mt-1 font-play text-white text-lg font-bold">
            <span>{ickbData?parseFloat((Number(ickbData.ickbDaoBalance)/100000000).toString()).toFixed(2):'-'} CKB</span>
          </div>
        </div>
        <div className="bg-gray-800 relative rounded-lg p-3 pr-5 mb-2 w-[30%]">
          <div className="flex justify-between items-center font-work-sans text-gray-400">
            <span>APY</span>
          </div>
          <div className="flex justify-between items-center mt-1 font-play text-white text-lg font-bold">
            <span>{apy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IckbStatus;
