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
      className={`bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-gray-200 dark:hover:border-zinc-700' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
