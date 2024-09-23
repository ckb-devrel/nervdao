import { useState, useEffect, useMemo } from "react";
import { ccc } from "@ckb-ccc/connector-react";

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

export function useDaoCells(isRedeeming?: boolean) {
  const [cells, setCells] = useState<ccc.Cell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const signer = ccc.useSigner();

  useEffect(() => {
    if (!signer) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        setIsLoading(true);
        const collectedCells: ccc.Cell[] = [];
        for await (const inputCell of collectDaoCells(signer, isRedeeming)) {
          collectedCells.push(inputCell);
        }

        setCells(collectedCells);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [signer, isRedeeming]);

  const sum = useMemo(() => {
    return cells.reduce(
      (sum, c) => sum + BigInt(c.cellOutput.capacity),
      BigInt(0)
    );
  }, [cells]);

  return { cells, isLoading, sum };
}

export function useDaoDeposits() {
  return useDaoCells(false);
}
export function useDaoRedeems() {
  return useDaoCells(true);
}
