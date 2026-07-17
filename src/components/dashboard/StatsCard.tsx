import React from 'react';
import { Card } from '../common/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  color?: 'blue' | 'yellow' | 'green' | 'red';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  color = 'blue',
}) => {
  const borderColors = {
    blue: 'border-l-4 border-l-blue-500',
    yellow: 'border-l-4 border-l-amber-500',
    green: 'border-l-4 border-l-green-500',
    red: 'border-l-4 border-l-red-500',
  };

  const bgIconColors = {
    blue: 'bg-blue-50 text-blue-650 dark:bg-blue-950/30 dark:text-blue-400',
    yellow: 'bg-amber-50 text-amber-650 dark:bg-amber-950/30 dark:text-amber-400',
    green: 'bg-green-50 text-green-650 dark:bg-green-950/30 dark:text-green-400',
    red: 'bg-red-50 text-red-650 dark:bg-red-950/30 dark:text-red-400',
  };

  return (
    <Card className={`p-5 flex items-center justify-between ${borderColors[color]}`}>
      <div className="text-left">
        <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
          {title}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-1 mb-0.5">
          {value}
        </h2>
        {description && (
          <span className="text-[10px] text-gray-400 font-medium block">
            {description}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-lg ${bgIconColors[color]}`}>
        {icon}
      </div>
    </Card>
  );
};
