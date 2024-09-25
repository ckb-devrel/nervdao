import { useState, useEffect, useMemo } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { getProfit } from "@/utils/epoch";

async function* collectDaoCells(signer: ccc.Signer, isRedeeming?: boolean) {
  for await (const cell of signer.findCells(
    {
      script: await ccc.Script.fromKnownScript(
        signer.client,
        ccc.KnownScript.NervosDao,
        "0x"
      ),
      scriptLenRange: [33, 34],
      outputDataLenRange: [8, 9],
      ...(isRedeeming ?? true
        ? {}
        : {
            outputDataSearchMode: "exact",
            outputData: "00".repeat(8),
          }),
    },
    true
  )) {
    if (isRedeeming && ccc.numFrom(cell.outputData) === ccc.Zero) {
      continue;
    }
    yield cell;
  }
}

async function getDaoInfo(
  tip: ccc.ClientBlockHeader,
  cell: ccc.Cell,
  isRedeeming: boolean,
  client: ccc.Client
): Promise<DaoInfo["infos"]> {
  const previousTx = await client.getTransaction(cell.outPoint.txHash);
  if (!previousTx?.blockHash) {
    return;
  }
  const previousHeader = await client.getHeaderByHash(previousTx.blockHash);
  if (!previousHeader) {
    return;
  }

  const claimInfo = await (async (): Promise<DaoInfo["infos"]> => {
    if (!isRedeeming) {
      return;
    }

    const depositTxHash =
      previousTx.transaction.inputs[Number(cell.outPoint.index)].previousOutput
        .txHash;
    const depositTx = await client.getTransaction(depositTxHash);
    if (!depositTx?.blockHash) {
      return;
    }
    const depositHeader = await client.getHeaderByHash(depositTx.blockHash);

    if (!depositHeader) {
      return;
    }
    return [
      getProfit(cell, depositHeader, previousHeader),
      depositTx,
      depositHeader,
      [previousTx, previousHeader],
    ];
  })();

  if (claimInfo) {
    return claimInfo;
  } else {
    return [
      getProfit(cell, previousHeader, tip),
      previousTx,
      previousHeader,
      [undefined, tip],
    ];
  }
}

export interface DaoInfo {
  cell: ccc.Cell;
  isRedeeming: boolean;
  infos:
    | [
        ccc.Num,
        ccc.ClientTransactionResponse,
        ccc.ClientBlockHeader,
        [undefined | ccc.ClientTransactionResponse, ccc.ClientBlockHeader]
      ]
    | undefined;
}
export function useDaoCells(isRedeeming?: boolean) {
  const [cells, setCells] = useState<DaoInfo[]>([]);
  const [tip, setTip] = useState<ccc.ClientBlockHeader | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const signer = ccc.useSigner();
  const { client } = ccc.useCcc();

  useEffect(() => {
    const refresh = () => client.getTipHeader().then(setTip);

    const interval = setInterval(refresh, 1000);
    refresh();
    return () => clearInterval(interval);
  }, [client]);

  useEffect(() => {
    if (!signer) {
      return;
    }

    (async () => {
      try {
        const collectedCells: ccc.Cell[] = [];
        for await (const inputCell of collectDaoCells(signer, isRedeeming)) {
          collectedCells.push(inputCell);
        }

        setCells((cells) =>
          collectedCells.map((cell) => {
            const isRedeeming = ccc.numFrom(cell.outputData) !== ccc.Zero;
            const info = cells.find((c) =>
              c.cell.outPoint.eq(cell.outPoint)
            ) ?? {
              cell,
              isRedeeming,
              infos: undefined,
            };
            if (tip) {
              getDaoInfo(tip, cell, isRedeeming, signer.client).then(
                (infos) => {
                  setCells((cells) =>
                    cells.map((c) => {
                      if (c.cell.outPoint.eq(cell.outPoint)) {
                        return { ...c, infos };
                      }
                      return c;
                    })
                  );
                }
              );
            }
            return info;
          })
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [signer, isRedeeming, tip]);

  const sum = useMemo(() => {
    return cells.reduce(
      (sum, c) => sum + BigInt(c.cell.cellOutput.capacity),
      BigInt(0)
    );
  }, [cells]);

  const profitSum = useMemo(() => {
    return cells.reduce(
      (sum, c) => sum + BigInt(c.infos?.[0] ?? "0"),
      BigInt(0)
    );
  }, [cells]);

  return { tip, cells, isLoading, sum, profitSum };
}

export function useDaoDeposits() {
  return useDaoCells(false);
}
export function useDaoRedeems() {
  return useDaoCells(true);
}
