import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 shadow-xs ${onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
