import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";

interface DashboardHistoryItemProps {
  isRedeeming: boolean;
  cell: ccc.Cell;
}

const DashboardHistoryItem: React.FC<DashboardHistoryItemProps> = ({
  cell,
  isRedeeming,
}) => {
  const { client } = ccc.useCcc();

  const iconColor = isRedeeming ? "bg-purple-600" : "bg-cyan-600";
  const actionText = isRedeeming
    ? "Redeem from Nervos DAO"
    : "Deposit to Nervos DAO";
  const formattedAmount = ccc.fixedPointToString(cell.cellOutput.capacity);
  const [date, setDate] = useState("-");

  useEffect(() => {
    (async () => {
      const tx = await client.getTransaction(cell.outPoint.txHash);
      if (!tx?.blockHash) {
        return;
      }

      const header = await client.getHeaderByHash(tx.blockHash);
      if (!header) {
        return;
      }

      setDate(new Date(Number(header.timestamp)).toLocaleString());
    })();
  }, [client, cell]);

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
};

export default DashboardHistoryItem;
