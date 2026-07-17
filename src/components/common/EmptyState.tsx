import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no active items to display here at the moment.',
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
      {icon ? (
        <div className="mb-4 text-gray-400 dark:text-zinc-600">{icon}</div>
      ) : (
        <svg className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      <h3 className="text-sm font-semibold text-gray-950 dark:text-zinc-100">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-sm">{description}</p>
    </div>
  );
};
