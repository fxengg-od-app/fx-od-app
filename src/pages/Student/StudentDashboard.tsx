import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Bell,
  User,
  ArrowRight,
  Lock,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStudentODRequests } from '../../hooks/useODRequests';
import { useNotifications } from '../../hooks/useNotifications';
import { RequestsTable } from '../../components/tables/RequestsTable';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { formatRelativeTime } from '../../utils/dateUtils';
import type { ODRequest } from '../../types/od';

export const StudentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const { data: requests = [], isLoading: isLoadingRequests } = useStudentODRequests(userProfile?.uid);
  const { notifications = [] } = useNotifications(userProfile?.uid, 5);

  const total = requests.length;
  const pending = requests.filter((r) => r.status === 'PENDING' || r.status === 'MENTOR_APPROVED').length;
  const approved = requests.filter((r) => r.status === 'HOD_APPROVED').length;
  const rejected = requests.filter((r) => r.status === 'MENTOR_REJECTED' || r.status === 'HOD_REJECTED').length;

  // Latest OD Request for Timeline tracking
  const latestRequest: ODRequest | null = requests.length > 0 ? requests[0] : null;

  if (isLoadingRequests) {
    return <Loader label="Loading student personal dashboard..." />;
  }

  return (
    <div className="space-y-4">
      {/* Student Profile Overview Banner */}
      <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-md bg-[#0B426E] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            {userProfile?.displayName ? userProfile.displayName.charAt(0) : <User className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Welcome back, {userProfile?.displayName || 'Student'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              Reg: {userProfile?.registerNumber || '951221104000'} • {userProfile?.department} (Year {userProfile?.year || 'III'}-{userProfile?.section || 'A'})
            </p>
          </div>
        </div>

        {/* Quick Apply Button */}
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/student/apply')}
          className="w-full sm:w-auto shadow-xs font-semibold"
        >
          <Send className="w-4 h-4 mr-1.5" /> Apply New OD
        </Button>
      </div>

      {/* Personal Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total OD Requests
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {total}
            </h3>
          </div>
          <div className="p-2.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0B426E] dark:text-blue-300">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pending Approvals
            </p>
            <h3 className="text-2xl font-bold text-[#F59E0B] mt-1">
              {pending}
            </h3>
          </div>
          <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-[#F59E0B]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Approved
            </p>
            <h3 className="text-2xl font-bold text-[#16A34A] mt-1">
              {approved}
            </h3>
          </div>
          <div className="p-2.5 rounded-md bg-green-50 dark:bg-green-950/50 text-[#16A34A]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Rejected
            </p>
            <h3 className="text-2xl font-bold text-[#DC2626] mt-1">
              {rejected}
            </h3>
          </div>
          <div className="p-2.5 rounded-md bg-red-50 dark:bg-red-950/50 text-[#DC2626]">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2/3 width): Recent Requests & Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Approval Timeline for Latest Request */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0B426E] dark:text-blue-400" />
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                  Recent Approval Timeline
                </h3>
              </div>
              {latestRequest && (
                <span className="font-mono text-[11px] font-bold text-[#0B426E] dark:text-blue-300">
                  {latestRequest.requestNumber}
                </span>
              )}
            </div>

            {!latestRequest ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No active OD applications to display timeline for.
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-3 gap-2 text-center text-xs relative">
                  {/* Step 1: Submission */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 flex items-center justify-center font-bold text-xs ring-2 ring-green-600">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-[11px]">Submitted</span>
                    <span className="text-[10px] text-gray-400">{latestRequest.startDate}</span>
                  </div>

                  {/* Step 2: Mentor Review */}
                  <div className="flex flex-col items-center space-y-1">
                    {latestRequest.status === 'PENDING' ? (
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-xs ring-2 ring-amber-500 animate-pulse">
                        <Clock className="w-4 h-4" />
                      </div>
                    ) : latestRequest.status === 'MENTOR_REJECTED' ? (
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold text-xs ring-2 ring-red-600">
                        <X className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 flex items-center justify-center font-bold text-xs ring-2 ring-green-600">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white text-[11px]">Mentor Review</span>
                    <span className="text-[10px] text-gray-400 truncate max-w-[90px]">
                      {latestRequest.mentorReview
                        ? latestRequest.mentorReview.status === 'APPROVED'
                          ? 'Approved'
                          : 'Rejected'
                        : 'In Progress'}
                    </span>
                  </div>

                  {/* Step 3: HOD Sanction */}
                  <div className="flex flex-col items-center space-y-1">
                    {latestRequest.status === 'HOD_APPROVED' ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 flex items-center justify-center font-bold text-xs ring-2 ring-green-600">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : latestRequest.status === 'HOD_REJECTED' ? (
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold text-xs ring-2 ring-red-600">
                        <X className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-xs">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white text-[11px]">HOD Sanction</span>
                    <span className="text-[10px] text-gray-400 truncate max-w-[90px]">
                      {latestRequest.status === 'HOD_APPROVED'
                        ? 'Sanctioned'
                        : latestRequest.status === 'HOD_REJECTED'
                        ? 'Rejected'
                        : 'Gated / Pending'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Requests Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Recent OD Applications
              </h3>
              <button
                onClick={() => navigate('/student/requests')}
                className="text-xs text-[#0B426E] dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <RequestsTable requests={requests.slice(0, 4)} />
          </div>
        </div>

        {/* Right Column (1/3 width): Quick Actions & Recent Notifications */}
        <div className="space-y-4">
          {/* Quick Actions Card */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/student/apply')}
                className="w-full justify-start text-xs font-semibold"
              >
                <Send className="w-4 h-4 mr-2" /> Apply New OD Application
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/student/requests')}
                className="w-full justify-start text-xs"
              >
                <FileText className="w-4 h-4 mr-2" /> Manage Active Requests
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => navigate('/student/history')}
                className="w-full justify-start text-xs"
              >
                <Clock className="w-4 h-4 mr-2" /> View Archived History
              </Button>
            </div>
          </div>

          {/* Recent Notifications Card */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0B426E] dark:text-blue-400" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Recent Notifications
                </h3>
              </div>
              <button
                onClick={() => navigate('/student/notifications')}
                className="text-[11px] text-[#0B426E] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No recent notifications.</p>
              ) : (
                notifications.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const target = item.route || item.navigationTarget;
                      if (target) navigate(target);
                    }}
                    className={`p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                      item.read
                        ? 'bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        : 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white border-l-3 border-l-[#0B426E]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-[#0B426E] dark:text-blue-300 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5">
                      {item.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
