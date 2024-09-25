import React from "react";
import DepositForm from "./DepositForm";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";
import DepositFAQ from "./DepositFAQ";

const Deposit: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row items-start gap-6">
      <div className="flex-1 space-y-6">
        <DepositForm />
        <DashboardRecentTransactions
          isRedeeming={false}
          title="Recent Deposits"
        />
      </div>
      <div className="flex-1">
        <DepositFAQ />
      </div>
    </div>
  );
};

export default Deposit;
