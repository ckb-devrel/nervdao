import React from 'react';

interface SkeletonLoaderProps {
  showHeader?: boolean;
  itemCount?: number;
  showChart?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  showHeader = true,
  itemCount = 3,
  showChart = false,
}) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 w-full animate-pulse">
      {showHeader && (
        <div className="flex items-center mb-4">
          <div className="rounded-full bg-gray-700 p-2 mr-3 w-10 h-10"></div>
          <div>
            <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      )}
      
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-3 mb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 bg-gray-700 rounded w-24"></div>
            {showChart ? (
              <div className="w-12 h-12 bg-gray-700 rounded"></div>
            ) : (
              <div className="rounded-full bg-gray-700 w-12 h-12"></div>
            )}
          </div>
          <div className="h-6 bg-gray-700 rounded w-32"></div>
        </div>
      ))}

      {showChart && (
        <div className="mt-4">
          <div className="h-40 bg-gray-800 rounded-lg"></div>
        </div>
      )}
    </div>
  );
};

export default SkeletonLoader;