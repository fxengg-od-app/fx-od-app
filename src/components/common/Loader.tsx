import React from 'react';

export const Loader: React.FC<{ label?: string }> = ({ label = 'Loading data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
    </div>
  );
};
