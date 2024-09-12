import React from 'react';

interface DashboardRecentTransactionsSkeletonProps {
  itemCount?: number;
}

const DashboardRecentTransactionsSkeleton: React.FC<DashboardRecentTransactionsSkeletonProps> = ({ itemCount = 5 }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 flex-grow animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-48 mb-6"></div>
      <div className="space-y-4">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-700 rounded-full mr-3"></div>
              <div>
                <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-20"></div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <div className="h-4 bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  );
};

export default DashboardRecentTransactionsSkeleton;
