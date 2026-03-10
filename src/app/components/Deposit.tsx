import React from "react";
import DepositForm from "./DepositForm";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";
import DepositFAQ from "./DepositFAQ";
import { useTranslation } from "react-i18next";

const Deposit: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col flex-grow lg:flex-row lg:items-stretch gap-6">
      <div className="space-y-6 flex flex-col flex-1">
        <DepositForm />
        <DashboardRecentTransactions
          isRedeeming={false}
          title={t("recentDeposits.recentDeposits")}
          className="flex-grow hidden lg:flex"
        />
      </div>
      <DepositFAQ />
      <DashboardRecentTransactions
        isRedeeming={false}
        title={t("recentDeposits.recentDeposits")}
        className="flex-grow lg:hidden"
      />
    </div>
  );
};

export default Deposit;
