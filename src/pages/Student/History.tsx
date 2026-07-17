import React from 'react';
import { useApp } from '../../context/AppContext';
import { RequestsTable } from '../../components/tables/RequestsTable';

export const History: React.FC = () => {
  const { requests } = useApp();

  // Filter requests applied by this mock student (both pending and finalized)
  const studentRequests = requests.filter(
    (r) => r.registerNumber === '951221104001'
  );

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 m-0">
          OD Application History
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Complete archive of all your past OD requests, approvals, and rejections.
        </p>
      </div>

      <RequestsTable data={studentRequests} />
    </div>
  );
};
