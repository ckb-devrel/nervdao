import React, { useEffect } from "react";
import { DashboardHistoryItem } from "./DashboardHistoryItem";
import { ccc } from "@ckb-ccc/connector-react";

interface DashboardRecentTransactionsProps {
  isRedeeming?: boolean;
  title?: string;
}

async function* getDaoTransactions(signer: ccc.Signer, isRedeeming?: boolean) {
  const addresses = await signer.getAddressObjs();

  for (const address of addresses) {
    for await (const tx of signer.client.findTransactions(
      {
        script: address.script,
        scriptType: "lock",
        scriptSearchMode: "exact",
        filter: {
          script: await ccc.Script.fromKnownScript(
            signer.client,
            ccc.KnownScript.NervosDao,
            "0x"
          ),
        },
        groupByTransaction: true,
      },
      "desc"
    )) {
      if (isRedeeming === undefined) {
        yield tx.txHash;
        continue;
      }

      const inInput = tx.cells.find(({ isInput }) => isInput);
      const inOutput = tx.cells.find(({ isInput }) => !isInput);
      if (isRedeeming && inInput && inOutput) {
        yield tx.txHash;
      } else if (!isRedeeming && !inInput && inOutput) {
        yield tx.txHash;
      }
    }
  }
}

export function DashboardRecentTransactions({
  isRedeeming,
  title = "Recent Transactions",
  ...props
}: DashboardRecentTransactionsProps & React.ComponentPropsWithoutRef<"div">) {
  const signer = ccc.useSigner();

  const [limit, setLimit] = React.useState(5);
  const [txs, setTxs] = React.useState<ccc.ClientTransactionResponse[]>([]);
  const [txGenerator, setTxGenerator] = React.useState<
    AsyncGenerator<ccc.Hex> | undefined
  >(undefined);

  useEffect(() => {
    if (!signer) {
      return;
    }

    setTxGenerator(getDaoTransactions(signer, isRedeeming));
    setLimit(5);
  }, [signer, isRedeeming]);

  useEffect(() => {
    if (!txGenerator || !signer || txs.length >= limit) {
      return;
    }

    (async () => {
      const { value, done } = await txGenerator.next();
      if (done) {
        setTxGenerator(undefined);
        return;
      }

      const tx = await signer.client.getTransaction(value);
      setTxs((txs) => (tx ? [...txs, tx] : [...txs]));
    })();
  }, [txGenerator, limit, txs, signer]);

  if (txs.length === 0) {
    return (
      <div
        {...props}
        className={`bg-gray-800 rounded-lg p-4 text-center ${props.className}`}
      >
        <p className="text-gray-400">No recent transactions</p>
      </div>
    );
  }

  return (
    <div
      {...props}
      className={`bg-gray-900 rounded-lg p-4 flex-grow ${props.className}`}
    >
      <h3 className="text-xl font-play font-bold mb-4">{title}</h3>
      <div className="mt-6">
        {txs.slice(0, limit).map((transaction, index) => (
          <DashboardHistoryItem key={index} transaction={transaction} />
        ))}
        {txGenerator ? (
          <button
            className="text-cyan-400 mt-4 hover:underline"
            onClick={() => setLimit(limit + 5)}
          >
            View all history
          </button>
        ) : undefined}
      </div>
    </div>
  );
}
