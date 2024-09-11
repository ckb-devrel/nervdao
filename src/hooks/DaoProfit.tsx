import { useEffect, useState } from 'react';
import { ccc } from '@ckb-ccc/connector-react';
import { getProfit } from '@/utils/epoch';

export const useDaoProfit = (dao: ccc.Cell) => {
  const [profit, setProfit] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const signer = ccc.useSigner();

  useEffect(() => {
    if (!signer || !dao) {
      setIsLoading(false);
      return;
    }

    const fetchProfit = async () => {
      try {
        setIsLoading(true);
        const tipHeader = await signer.client.getTipHeader();
        const previousTx = await signer.client.getTransaction(dao.outPoint.txHash);
        if (!previousTx?.blockHash) {
          throw new Error('Previous transaction not found');
        }
        const previousHeader = await signer.client.getHeaderByHash(previousTx.blockHash);
        if (!previousHeader) {
          throw new Error('Previous header not found');
        }

        const isNew = dao.outputData === "0x0000000000000000";
        let calculatedProfit: bigint;

        if (!isNew) {
          const depositTxHash = previousTx.transaction.inputs[Number(dao.outPoint.index)].previousOutput.txHash;
          const depositTx = await signer.client.getTransaction(depositTxHash);
          if (!depositTx?.blockHash) {
            throw new Error('Deposit transaction not found');
          }
          const depositHeader = await signer.client.getHeaderByHash(depositTx.blockHash);
          if (!depositHeader) {
            throw new Error('Deposit header not found');
          }
          calculatedProfit = getProfit(dao, depositHeader, previousHeader);
        } else {
          calculatedProfit = getProfit(dao, previousHeader, tipHeader);
        }

        setProfit(calculatedProfit);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setIsLoading(false);
      }
    };

    fetchProfit();
  }, [dao, signer]);

  return { profit, isLoading, error };
};
