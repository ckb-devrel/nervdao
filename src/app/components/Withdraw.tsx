/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useMemo } from "react";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";
import { WithdrawProfile } from "./WithdrawProfile";
import { ccc } from "@ckb-ccc/connector-react";
import DaoCard from "./DaoCard";

export function Withdraw({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) {
  const signer = ccc.useSigner();
  const [daos, setDaos] = useState<ccc.Cell[]>([]);

  useEffect(() => {
    if (!signer) {
      return;
    }

    (async () => {
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
        setDaos(daos);
      }
    })();
  }, [signer]);

  // 使用 useMemo 来过滤非新的 DAO 单元格
  const withdrawableDaos = useMemo(() => {
    return daos.filter((dao) => dao.outputData !== "0x0000000000000000");
  }, [daos]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex flex-col gap-6 flex-grow">
        <WithdrawProfile />
        <DashboardRecentTransactions
          isRedeeming={false}
          title="Recent Redemptions"
          className="hidden lg:block"
        />
      </div>
      <div className="bg-gray-900 rounded-lg p-6 flex flex-col flex-grow-[2]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Current Redemptions</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {withdrawableDaos.length > 0 ? (
            withdrawableDaos.map((dao) => (
              <DaoCard key={dao.outPoint.txHash} dao={dao} />
            ))
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
              <h3 className="text-xl font-bold mb-2">No Redemptions</h3>
              <p className="text-gray-400 mb-4">
                You don&apos;t have any DAO redemptions at the moment.
              </p>
              <button
                className="font-bold bg-btn-gradient text-gray-800 text-body-2 py-3 px-6 rounded-lg hover:bg-btn-gradient-hover transition duration-200 disabled:opacity-50 disabled:hover:bg-btn-gradient"
                onClick={() => setCurrentPage("deposit")}
              >
                View Deposits
              </button>
            </div>
          )}
        </div>
      </div>
      <DashboardRecentTransactions
        isRedeeming
        title="Recent Redemptions"
        className="lg:hidden"
      />
    </div>
  );
}
