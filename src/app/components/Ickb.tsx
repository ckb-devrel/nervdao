import React from "react";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";
import IckbForm from "./IckbForm";
import IckbStatus from "./IckbStatus";

const Ickb: React.FC = () => {
  return (
    <div className="flex flex-col flex-grow lg:flex-row lg:items-stretch gap-6">
      <div className="space-y-6 flex flex-col flex-1">
        <IckbForm />
      </div>
      <div className="flex-1 flex-row">
      <IckbStatus />
      <DashboardRecentTransactions
        isRedeeming={false}
        title="Recent Deposits"
        className="flex-grow"
      />
      </div>
    </div>
  );
};

export default Ickb;
