import React from 'react';
import { useApp } from '../../context/AppContext';
import { RequestsTable } from '../../components/tables/RequestsTable';

export const MentorHistory: React.FC = () => {
  const { requests } = useApp();

  // Filter requests that have been processed by the mentor
  const processedRequests = requests.filter(
    (r) => r.mentorStatus !== 'PENDING'
  );

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 m-0">
          Mentor Approval History
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Archive of all OD applications you have approved or rejected.
        </p>
      </div>

      <RequestsTable data={processedRequests} />
    </div>
  );
};
