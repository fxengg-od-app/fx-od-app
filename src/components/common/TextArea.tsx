import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const areaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={areaId} className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        className={`w-full px-3 py-2 border rounded-lg text-sm transition-all duration-200 outline-none
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700
          text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500
          disabled:bg-gray-50 dark:disabled:bg-zinc-950 disabled:text-gray-400
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};
