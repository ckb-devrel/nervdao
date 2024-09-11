import React from 'react';

interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

const Title: React.FC<TitleProps> = ({ children, className = '' }) => {
  return (
    <h2 className={`font-play text-2xl font-bold text-white mb-4 ${className}`}>
      {children}
    </h2>
  );
};

export default Title;
