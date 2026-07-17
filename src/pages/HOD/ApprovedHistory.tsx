import React from 'react';
import { useApp } from '../../context/AppContext';
import { RequestsTable } from '../../components/tables/RequestsTable';

export const HODHistory: React.FC = () => {
  const { requests } = useApp();

  // Filter requests that have been processed by the HOD
  const processedRequests = requests.filter(
    (r) => r.hodStatus !== 'PENDING'
  );

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 m-0">
          HOD Approval History
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Archive of all OD applications processed by the Head of Department.
        </p>
      </div>

      <RequestsTable data={processedRequests} />
    </div>
  );
};
