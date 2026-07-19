import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useMentorPendingRequests, useMentorReviewMutation } from '../../hooks/useODRequests';
import { MentorApprovalTable } from '../../components/tables/MentorApprovalTable';
import { Loader } from '../../components/common/Loader';

export const PendingApprovals: React.FC = () => {
  const { userProfile } = useAuth();
  const { data: requests = [], isLoading } = useMentorPendingRequests(
    userProfile?.uid,
    userProfile?.email
  );
  const mentorReviewMutation = useMentorReviewMutation();

  const handleApprove = (odId: string) => {
    if (!userProfile) return;
    mentorReviewMutation.mutate({
      odId,
      decision: 'APPROVED',
      mentor: userProfile,
    });
  };

  const handleReject = (odId: string, reason: string) => {
    if (!userProfile) return;
    mentorReviewMutation.mutate({
      odId,
      decision: 'REJECTED',
      mentor: userProfile,
      rejectionReason: reason,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">Faculty Mentor - Pending OD Approvals</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Review and approve or reject OD requests submitted by your assigned mentees.</p>
      </div>

      {isLoading ? (
        <Loader label="Loading assigned mentee OD applications..." />
      ) : (
        <MentorApprovalTable
          requests={requests}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={mentorReviewMutation.isPending}
        />
      )}
    </div>
  );
};
