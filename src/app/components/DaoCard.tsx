"use client";

import { getClaimEpoch, parseEpoch } from "@/utils/epoch";
import { ccc } from "@ckb-ccc/connector-react";
import { useState } from "react";
import { DaoDepositDetailModal } from "./DaoDepositDetailModal";
import { DaoWithdrawDetailModal } from "./DaoWithdrawDetailModal";
import { DaoInfo } from "@/hooks/DaoCollect";

export const DaoCard = ({
  tip,
  dao: { isRedeeming, infos, cell },
}: {
  tip?: ccc.ClientBlockHeader,
  dao: DaoInfo;
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const amount = ccc.fixedPointToString(
    (cell.cellOutput.capacity / ccc.fixedPointFrom("0.01")) *
      ccc.fixedPointFrom("0.01")
  );
  const profit = infos
    ? ccc.fixedPointToString(
        (infos[0] / ccc.fixedPointFrom("0.0001")) * ccc.fixedPointFrom("0.0001")
      )
    : "-";

  const profitCycles = infos
    ? Number(
        ccc.fixedPointToString(
          parseEpoch(infos[3][1].epoch) - parseEpoch(infos[2].epoch)
        )
      ) / 180
    : 1;
  const remainingCycles =
    infos && tip
      ? Number(
          ccc.fixedPointToString(
            parseEpoch(getClaimEpoch(infos[2], infos[3][1])) -
              parseEpoch(tip.epoch)
          )
        ) / 180
      : undefined;

  const remainingDays = (remainingCycles ?? 1) * 30;
  const progressPercentage = Math.min(
    100,
    Math.max(0, (1 - (remainingCycles ?? 1)) * 100)
  );

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const color = isRedeeming
    ? remainingDays <= 0
      ? "emerald"
      : "purple"
    : "cyan";

  return (
    <>
      <div
        className="bg-gray-900 rounded-lg p-4 w-full border border-gray-400 cursor-pointer"
        onClick={handleOpenModal}
      >
        <div className="flex flex-col-reverse gap-2 lg:flex-row justify-between items-start lg:items-center mb-1">
          <span className="text-gray-400 text-sm">Amount</span>
          <span
            className={`px-2 py-0.5 rounded text-xs bg-${color}-900 text-${color}-400`}
          >
            {isRedeeming
              ? remainingDays <= 0
                ? "Withdrawable"
                : "Redeeming"
              : "Deposited"}
          </span>
        </div>
        <div className="text-2xl font-bold text-white mb-4">{amount} CKB</div>

        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="text-gray-400">
            Cycle #
            {remainingCycles === undefined ? "-" : Math.ceil(profitCycles)}
          </span>
          <span className="text-gray-400">
            {remainingCycles === undefined
              ? "Pending Transaction"
              : remainingDays >= 0
              ? isRedeeming
                ? `Settle in ${Math.ceil(remainingDays)}d`
                : `${Math.ceil(remainingDays)}d remaining`
              : "Ended"}
          </span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-1 mb-4">
          <div
            className={`bg-${color}-400 h-1 rounded-full`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className={`flex items-center text-${color}-400 text-sm`}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          <span className="text-sm">{profit} CKB</span>
        </div>
      </div>
      {isRedeeming ? (
        <DaoWithdrawDetailModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          dao={cell}
          infos={infos}
          remainingDays={remainingDays}
          tip={tip}
          amount={amount}
          cycle={profitCycles}
          profit={profit}
        />
      ) : (
        <DaoDepositDetailModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          dao={cell}
          remainingDays={remainingDays}
          amount={amount}
          cycle={profitCycles}
          profit={profit}
          cell={infos}
        />
      )}
    </>
  );
};

export default DaoCard;
