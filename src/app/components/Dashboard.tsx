/* eslint-disable @next/next/no-img-element */
import React from "react";
import DashboardProfile from "./DashboardProfile";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";
import DaoCard from "./DaoCard";
import { useDaoCells } from "@/hooks/DaoCollect";
import { ccc } from "@ckb-ccc/connector-react";

export function Dashboard({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) {
  const { cells: daos, tip } = useDaoCells();

  return (
    <div className="flex flex-col lg:flex-row flex-grow lg:items-stretch gap-6">
      <div className="flex flex-col flex-1 gap-6">
        <DashboardProfile />
        <DashboardRecentTransactions className="hidden lg:flex" />
      </div>
      <div className="bg-gray-900 rounded-lg p-6 flex flex-col flex-[2]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Holdings in Nervos DAO</h2>
        </div>

        {daos && daos.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-2">
            {daos.map((dao) => (
              <DaoCard
                key={ccc.hexFrom(dao.cell.outPoint.toBytes())}
                dao={dao}
                tip={tip}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-4">
            <div className="bg-gray-800 rounded-full mb-4">
              <img
                src={"./svg/no-holdings.svg"}
                alt="Nervos DAO"
                width={160}
                height={160}
              />
            </div>
            <h3 className="text-xl font-bold mb-2">No Holdings Yet</h3>
            <p className="text-gray-400 mb-6 text-center lg:mx-4">
              Accumulate compensation now through the Nervos DAO. You can redeem or withdraw your holdings after depositing.
            </p>
            <button
              className="font-bold bg-btn-gradient text-gray-800 text-body-2 py-3 px-6 rounded-lg hover:bg-btn-gradient-hover transition duration-200"
              onClick={() => setCurrentPage("deposit")}
            >
              Make a Deposit
            </button>
          </div>
        )}
      </div>
      <DashboardRecentTransactions className="lg:hidden" />
    </div>
  );
}
