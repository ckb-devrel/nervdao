import React from "react";
import DepositForm from "./DepositForm";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";
import DepositFAQ from "./DepositFAQ";

const Deposit: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
      <div className="flex-1 space-y-6">
        <DepositForm />
        <DepositFAQ />
      </div>
      <div className="flex-1">
        <DashboardRecentTransactions
          isRedeeming={false}
          title="Recent Deposits"
        />
      </div>
    </div>
  );
};

export default Deposit;
