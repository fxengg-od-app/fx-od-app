import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStudentODRequests } from '../../hooks/useODRequests';
import { RequestsTable } from '../../components/tables/RequestsTable';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';

export const MyRequests: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { data: requests = [], isLoading } = useStudentODRequests(userProfile?.uid);

  const pendingRequests = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'MENTOR_APPROVED'
  );

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Active OD Applications
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Track real-time approval progress of your submitted OD requests.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/student/apply')} className="w-full sm:w-auto">
          <Send className="mr-1.5 w-3.5 h-3.5" /> Apply New OD
        </Button>
      </div>

      {isLoading ? (
        <Loader label="Loading active OD applications..." />
      ) : (
        <RequestsTable requests={pendingRequests} />
      )}
    </div>
  );
};
