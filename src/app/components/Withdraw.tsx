/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useMemo } from "react";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";
import WithdrawProfile from "./WithdrawProfile";
import { ccc } from "@ckb-ccc/connector-react";
import DaoCard from "./DaoCard";

const Withdraw = () => {
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
          type="withdraw"
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
              <h3 className="text-xl font-bold mb-2">
                No Withdrawable Holdings
              </h3>
              <p className="text-gray-400 mb-4">
                You dont have any DAO deposits ready for withdrawal at the
                moment.
              </p>
              <button className="bg-teal-500 text-gray-900 font-semibold py-2 px-4 rounded hover:bg-teal-400">
                View Deposits
              </button>
            </div>
          )}
        </div>
      </div>
      <DashboardRecentTransactions
        type="withdraw"
        title="Recent Redemptions"
        className="lg:hidden"
      />
    </div>
  );
};

export default Withdraw;
