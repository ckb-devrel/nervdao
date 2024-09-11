import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  circleColor?: string;
  progressColor?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 48,
  strokeWidth = 4,
  circleColor = '#374151',
  progressColor = '#10B981'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={circleColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-work-sans text-white text-sm font-bold">{`${percentage}%`}</span>
      </div>
    </div>
  );
};

export default CircularProgress;
