import { useState, useEffect, useMemo } from 'react';
import { ccc } from '@ckb-ccc/connector-react';
import { Cell } from '@ckb-lumos/base';
import { dao } from '@ckb-lumos/common-scripts';
import { Indexer } from '@ckb-lumos/ckb-indexer';
import { config } from '@ckb-lumos/lumos';

type CollectType = 'deposit' | 'withdraw';

//TODO: change to mainnet
const indexer = new Indexer('https://testnet.ckb.dev/indexer'); 

const useCollectCells = (collectType: CollectType) => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const signer = ccc.useSigner();

  useEffect(() => {
    const collectCells = async () => {
      if (!signer) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const ckbAddress = await signer.getRecommendedAddress();
        const daoCellCollector = new dao.CellCollector(
          ckbAddress,
          indexer,
          collectType,
          { config: config.TESTNET }
        );
        const collectedCells: Cell[] = [];
        for await (const inputCell of daoCellCollector.collect()) {
          collectedCells.push(inputCell);
        }

        setCells(collectedCells);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    collectCells();
  }, [signer, collectType]);
  
  const sum = useMemo(() => {
    return cells.reduce(
      (sum, c) => sum + BigInt(c.cellOutput.capacity),
      BigInt(0)
    );
  }, [cells]);
  return { cells, isLoading, error, sum };
};

export const useCollectDeposits = () => useCollectCells('deposit');
export const useCollectWithdrawals = () => useCollectCells('withdraw');
