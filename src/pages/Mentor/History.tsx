import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useMentorHistoryRequests } from '../../hooks/useODRequests';
import { RequestsTable } from '../../components/tables/RequestsTable';
import { Loader } from '../../components/common/Loader';

export const MentorHistory: React.FC = () => {
  const { userProfile } = useAuth();
  const { data: requests = [], isLoading } = useMentorHistoryRequests(
    userProfile?.uid,
    userProfile?.email
  );

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">Mentor Approval History</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Historical archive of all OD applications reviewed by you.</p>
      </div>

      {isLoading ? (
        <Loader label="Loading mentor history..." />
      ) : (
        <RequestsTable requests={requests} showStudentDetails />
      )}
    </div>
  );
};
