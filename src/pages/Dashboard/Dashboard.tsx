import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  FileText,
  UserCheck,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAllODRequests } from '../../hooks/useODRequests';
import { Button } from '../../components/common/Button';
import { RequestsTable } from '../../components/tables/RequestsTable';
import { ROLE_LABELS } from '../../constants/roles';
import { StudentDashboard } from '../Student/StudentDashboard';

export const Dashboard: React.FC = () => {
  const { userProfile, activeRole } = useAuth();
  const navigate = useNavigate();
  const { data: allRequests = [] } = useAllODRequests();

  const role = activeRole || userProfile?.role || 'STUDENT';

  // Render Student Personal Dashboard for Student role
  if (role === 'STUDENT') {
    return <StudentDashboard />;
  }

  const roleLabel = ROLE_LABELS[role];

  return (
    <div className="space-y-4">
      {/* Compact ERP Header Banner */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
            Institutional Dashboard
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Logged in as <strong className="text-gray-900 dark:text-gray-200 font-semibold">{userProfile?.displayName || 'User'}</strong> ({roleLabel} • {userProfile?.department})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'MENTOR' && (
            <Button variant="primary" onClick={() => navigate('/mentor/pending')}>
              <FileText className="mr-1.5 w-3.5 h-3.5" /> Review Mentor Approvals
            </Button>
          )}
          {role === 'HOD' && (
            <Button variant="primary" onClick={() => navigate('/hod/pending')}>
              <UserCheck className="mr-1.5 w-3.5 h-3.5" /> Sanction HOD Approvals
            </Button>
          )}
        </div>
      </div>

      {/* Compact Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Applications
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {allRequests.length}
            </h3>
          </div>
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0B426E]">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pending Review
            </p>
            <h3 className="text-xl font-bold text-[#F59E0B] mt-0.5">
              {allRequests.filter((r) => r.status === 'PENDING').length}
            </h3>
          </div>
          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/50 text-[#F59E0B]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Mentor Approved
            </p>
            <h3 className="text-xl font-bold text-[#0B426E] dark:text-blue-300 mt-0.5">
              {allRequests.filter((r) => r.status === 'MENTOR_APPROVED').length}
            </h3>
          </div>
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#0B426E]">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              HOD Sanctioned
            </p>
            <h3 className="text-xl font-bold text-[#16A34A] mt-0.5">
              {allRequests.filter((r) => r.status === 'HOD_APPROVED').length}
            </h3>
          </div>
          <div className="p-2 rounded-md bg-green-50 dark:bg-green-950/50 text-[#16A34A]">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Integrated Academic Schedule Banner */}
      <div className="p-3.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-[#0B426E] dark:text-blue-400" />
          <div>
            <h4 className="font-semibold text-xs text-gray-900 dark:text-white">Institutional Academic Schedule</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-600">
          Status: <strong className="text-[#16A34A] font-semibold">Active Academic Session</strong>
        </div>
      </div>

      {/* Recent Institutional Applications */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Recent Applications Record
          </h3>
          <button
            onClick={() => navigate('/analytics')}
            className="text-xs text-[#0B426E] dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            View Analytics
          </button>
        </div>
        <RequestsTable requests={allRequests.slice(0, 5)} showStudentDetails />
      </div>
    </div>
  );
};
