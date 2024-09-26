import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { icons } from "lucide-react";

interface DashboardHistoryItemProps {
  transaction: ccc.ClientTransactionResponse;
}

export function DashboardHistoryItem({
  transaction,
}: DashboardHistoryItemProps) {
  const { client } = ccc.useCcc();
  const [action, setAction] = useState<"Deposit" | "Redeem" | "Withdraw">("Deposit");
  const [formattedAmount, setFormattedAmount] = useState("-");

  useEffect(() => {
    (async () => {
      const daoType = await ccc.Script.fromKnownScript(
        client,
        ccc.KnownScript.NervosDao,
        "0x"
      );

      const first = transaction.transaction.outputs.findIndex((o) =>
        o.type?.eq(daoType)
      );

      if (first === -1) {
        setAction("Withdraw");
        setFormattedAmount(
          ccc.fixedPointToString(
            transaction.transaction.getOutputsCapacity() -
              (await transaction.transaction.getInputsCapacity(client)) +
              transaction.transaction.inputs
                .filter((i) => i.cellOutput?.type?.eq(daoType))
                .reduce(
                  (acc, a) => acc + (a.cellOutput?.capacity ?? ccc.Zero),
                  ccc.Zero
                )
          )
        );
      } else {
        if (
          ccc.numFrom(transaction.transaction.outputsData[first]) !== ccc.Zero
        ) {
          setAction("Redeem");
        } else {
          setAction("Deposit");
        }
        setFormattedAmount(
          ccc.fixedPointToString(
            transaction.transaction.outputs
              .filter((o) => o.type?.eq(daoType))
              .reduce((acc, a) => acc + a.capacity, ccc.Zero)
          )
        );
      }
    })();
  }, [transaction, client]);

  const iconColor = {
    Deposit: "bg-cyan-600",
    Redeem: "bg-purple-600",
    Withdraw: "bg-green-600",
  }[action];
  const actionText = {
    Deposit: "Deposit to Nervos DAO",
    Redeem: "Redeem from Nervos DAO",
    Withdraw: "Withdraw",
  }[action];
  const Icon = {
    Deposit: icons["Download"],
    Redeem: icons["ClockArrowUp"],
    Withdraw: icons["ArrowUp"],
  }[action];

  const [date, setDate] = useState("-");

  useEffect(() => {
    const updateDate = async () => {
      if (!transaction.blockHash) {
        return;
      }

      const header = await client.getHeaderByHash(transaction.blockHash);
      if (!header) {
        return;
      }

      setDate(new Date(Number(header.timestamp)).toLocaleString());
      clearInterval(interval);
    };
    const interval = setInterval(updateDate, 1000);
    updateDate();

    return () => clearInterval(interval);
  }, [client, transaction]);

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <div className={`${iconColor} rounded-full p-2 mr-3`}>
          <Icon className="w-4 h-4" />
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
