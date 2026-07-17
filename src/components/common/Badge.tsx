import React from 'react';

type BadgeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'LOCKED' | 'DEFAULT';

interface BadgeProps {
  status: BadgeStatus | string;
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  children,
  className = '',
}) => {
  const normStatus = status.toUpperCase();

  const statusStyles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    APPROVED: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50',
    REJECTED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    LOCKED: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50',
    DEFAULT: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
  };

  const currentStyle = statusStyles[normStatus as BadgeStatus] || statusStyles.DEFAULT;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle} ${className}`}
    >
      {children || normStatus}
    </span>
  );
};
