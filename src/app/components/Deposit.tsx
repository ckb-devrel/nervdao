import React from 'react';
import DepositForm from './DepositForm';
import RecentTransactions from './DashboardRecentTransactions';
import DepositFAQ from './DepositFAQ';

const Deposit: React.FC = () => {
  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-6">
        <DepositForm />
        <RecentTransactions type="deposit" title="Recent Deposits" />
      </div>
      <div className="w-1/2">
        <DepositFAQ />
      </div>
    </div>
  );
};

export default Deposit;
