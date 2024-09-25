import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";

interface DashboardHistoryItemProps {
  transaction: ccc.ClientTransactionResponse;
}

export function DashboardHistoryItem({
  transaction,
}: DashboardHistoryItemProps) {
  const { client } = ccc.useCcc();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [formattedAmount, setFormattedAmount] = useState("-");

  useEffect(() => {
    (async () => {
      const daoType = await ccc.Script.fromKnownScript(
        client,
        ccc.KnownScript.NervosDao,
        "0x"
      );

      setIsRedeeming(
        transaction.transaction.outputs.find(
          (o, i) =>
            o.type?.eq(daoType) &&
            ccc.numFrom(transaction.transaction.outputsData[i]) !== ccc.Zero
        ) !== undefined
      );

      setFormattedAmount(
        ccc.fixedPointToString(
          transaction.transaction.outputs
            .filter((o) => o.type?.eq(daoType))
            .reduce((acc, a) => acc + a.capacity, ccc.Zero)
        )
      );
    })();
  }, [transaction, client]);

  const iconColor = isRedeeming ? "bg-purple-600" : "bg-cyan-600";
  const actionText = isRedeeming
    ? "Redeem from Nervos DAO"
    : "Deposit to Nervos DAO";

  const [date, setDate] = useState("-");

  useEffect(() => {
    (async () => {
      if (!transaction.blockHash) {
        return;
      }

      const header = await client.getHeaderByHash(transaction.blockHash);
      if (!header) {
        return;
      }

      setDate(new Date(Number(header.timestamp)).toLocaleString());
    })();
  }, [client, transaction]);

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <div className={`${iconColor} rounded-full p-2 mr-3`}>
          {isRedeeming ? (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          ) : (
            <img src={"./svg/deposit.svg"} alt="Deposit" className="w-4 h-4" />
          )}
        </div>
        <div>
          <p className="text-white font-work-sans text-body-2">{actionText}</p>
          <p className="text-gray-400 font-work-sans text-sm">{date}</p>
        </div>
      </div>
      <div className="text-white font-work-sans text-body-2">
        {formattedAmount} CKB
      </div>
    </div>
  );
}
