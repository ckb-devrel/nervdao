/* eslint-disable @next/next/no-img-element */
import React from "react";
import DashboardProfile from "./DashboardProfile";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";
import DaoCard from "./DaoCard";
import { useDaoCells } from "@/hooks/DaoCollect";

export function Dashboard({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) {
  const { cells: daos } = useDaoCells();

  return (
    <div className="flex flex-col lg:flex-row flex-grow items-start gap-6">
      <div className="flex flex-col flex-grow gap-6">
        <DashboardProfile />
        <DashboardRecentTransactions className="hidden lg:block" />
      </div>
      <div className="bg-gray-900 rounded-lg p-6 flex flex-col flex-grow-[2]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Current Holdings in Nervos DAO</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-2">
          {daos && daos.length > 0 ? (
            daos.map((dao) => <DaoCard key={dao.outPoint.txHash} dao={dao} />)
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center h-full">
              <div className="bg-gray-800 rounded-full mb-4">
                <img
                  src={"./svg/no-holdings.svg"}
                  alt="Nervos DAO"
                  width={160}
                  height={160}
                />
              </div>
              <h3 className="text-xl font-bold mb-2">No Holdings Yet</h3>
              <p className="text-gray-400 mb-4">
                Make a deposit to start accumulating compensation through the
                Nervos DAO.
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
      </div>
      <DashboardRecentTransactions className="lg:hidden" />
    </div>
  );
}
