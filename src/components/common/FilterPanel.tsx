import React from 'react';

interface FilterPanelProps {
  children: React.ReactNode;
  onClear?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  children,
  onClear,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-900/40 rounded-xl border border-gray-100 dark:border-zinc-800/80">
      <div className="flex flex-wrap items-center gap-3 flex-1">{children}</div>
      {onClear && (
        <button
          onClick={onClear}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};
