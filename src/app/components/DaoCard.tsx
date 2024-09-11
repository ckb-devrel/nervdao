"use client";

// import { useGetExplorerLink } from "@/hooks/Explorer";
import { getClaimEpoch, getProfit, parseEpoch } from "@/utils/epoch";
import { ccc, Epoch } from "@ckb-ccc/connector-react";
import { useEffect, useMemo, useState } from "react";
import DaoDepositDetailModal from "./DaoDepositDetailModal";
import DaoWithdrawDetailModal from "./DaoWithdrawDetailModal";

export const DaoCard = ({ dao }: { dao: ccc.Cell }) => {
  const signer = ccc.useSigner();
  const [modalOpen, setModalOpen] = useState(false);
  const [tip, setTip] = useState<ccc.ClientBlockHeader | undefined>();

  const [infos, setInfos] = useState<
    | [
        ccc.Num,
        ccc.ClientTransactionResponse,
        ccc.ClientBlockHeader,
        [undefined | ccc.ClientTransactionResponse, ccc.ClientBlockHeader],
      ]
    | undefined
  >();
  const isNew = useMemo(() => dao.outputData === "0x0000000000000000", [dao]);
  useEffect(() => {
    if (!signer) {
      return;
    }

    (async () => {
      const tipHeader = await signer.client.getTipHeader();
      setTip(tipHeader);

      const previousTx = await signer.client.getTransaction(
        dao.outPoint.txHash,
      );
      if (!previousTx?.blockHash) {
        return;
      }
      const previousHeader = await signer.client.getHeaderByHash(
        previousTx.blockHash,
      );
      if (!previousHeader) {
        return;
      }

      const claimInfo = await (async (): Promise<typeof infos> => {
        if (isNew) {
          return;
        }

        const depositTxHash =
          previousTx.transaction.inputs[Number(dao.outPoint.index)]
            .previousOutput.txHash;
        const depositTx = await signer.client.getTransaction(depositTxHash);
        if (!depositTx?.blockHash) {
          return;
        }
        const depositHeader = await signer.client.getHeaderByHash(
          depositTx.blockHash,
        );

        if (!depositHeader) {
          return;
        }
        return [
          getProfit(dao, depositHeader, previousHeader),
          depositTx,
          depositHeader,
          [previousTx, previousHeader],
        ];
      })();

      if (claimInfo) {
        setInfos(claimInfo);
      } else {
        setInfos([
          getProfit(dao, previousHeader, tipHeader),
          previousTx,
          previousHeader,
          [undefined, tipHeader],
        ]);
      }
    })();
  }, [dao, signer, isNew, modalOpen]);

  const amount = ccc.fixedPointToString(
    (dao.cellOutput.capacity / ccc.fixedPointFrom("0.01")) *
      ccc.fixedPointFrom("0.01")
  );
  const profit = infos
    ? ccc.fixedPointToString(
        (infos[0] / ccc.fixedPointFrom("0.0001")) *
          ccc.fixedPointFrom("0.0001")
      )
    : "0";

  const remainingCycles = infos && tip
    ? parseFloat(ccc.fixedPointToString(
        ((parseEpoch(getClaimEpoch(infos[2], infos[3][1]) as Epoch) -
          parseEpoch(tip.epoch as Epoch)) /
          ccc.fixedPointFrom("0.001")) *
          ccc.fixedPointFrom("0.001"),
      )) / 180
    : 0;

  const remainingDays = Math.ceil(remainingCycles * 30);
  const progressPercentage = Math.min(100, Math.max(0, (1 - remainingCycles) * 100));

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  console.log('infos', infos);

  return (
    <>
      <div 
        className="bg-gray-900 rounded-lg p-4 w-full border h-44 border-gray-400 cursor-pointer"
        onClick={handleOpenModal}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400 text-sm">Amount</span>
          <span className="bg-cyan-900 text-cyan-400 px-2 py-0.5 rounded text-xs">
            {!isNew ? "Withdraw" : "Deposited"}
          </span>
        </div>
        <div className="text-2xl font-bold text-white mb-4">{amount} CKB</div>
        
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="text-gray-400">Cycle #{Math.floor(1 / remainingCycles)}</span>
          <span className="text-gray-400">{remainingDays} d remaining</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-1 mb-4">
          <div 
            className="bg-cyan-400 h-1 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex items-center">
          <svg className="w-4 h-4 text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-cyan-400 text-sm">{profit} CKB</span>
        </div>
      </div>
      {/* <DaoWithdrawDetailModal
          isOpen={true}
          onClose={handleCloseModal}
          dao={dao}
          infos={infos}
          remainingDays={remainingDays}
          amount={amount}
          profit={profit}
        /> */}
      {isNew ? (
        <DaoDepositDetailModal 
          isOpen={modalOpen}
          onClose={handleCloseModal}
          dao={dao}
          isNew={isNew}
          remainingDays={remainingDays}
          amount={amount}
          profit={profit}
          cell={infos}
        />
      ) : (
        <DaoWithdrawDetailModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          dao={dao}
          infos={infos}
          remainingDays={remainingDays}
          amount={amount}
          profit={profit}
        />
      )}
    </>
  );
};

export default DaoCard;
