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
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    LOCKED: 'bg-gray-100 text-gray-600 border-gray-200',
    DEFAULT: 'bg-blue-50 text-blue-700 border-blue-200',
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
