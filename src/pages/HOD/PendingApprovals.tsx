import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  useHODPendingRequests,
  useHODReviewMutation,
  useBulkHODApproveMutation,
  useBulkHODRejectMutation,
} from '../../hooks/useODRequests';
import { HODApprovalTable } from '../../components/tables/HODApprovalTable';
import { Loader } from '../../components/common/Loader';

export const HODPendingApprovals: React.FC = () => {
  const { userProfile } = useAuth();
  const { data: requests = [], isLoading } = useHODPendingRequests(userProfile?.department);

  const hodReviewMutation = useHODReviewMutation();
  const bulkApproveMutation = useBulkHODApproveMutation();
  const bulkRejectMutation = useBulkHODRejectMutation();

  const handleSingleApprove = (odId: string) => {
    if (!userProfile) return;
    hodReviewMutation.mutate({
      odId,
      decision: 'APPROVED',
      hod: userProfile,
    });
  };

  const handleSingleReject = (odId: string, reason: string) => {
    if (!userProfile) return;
    hodReviewMutation.mutate({
      odId,
      decision: 'REJECTED',
      hod: userProfile,
      rejectionReason: reason,
    });
  };

  const handleBulkApprove = (odIds: string[]) => {
    if (!userProfile) return;
    bulkApproveMutation.mutate({ odIds, hod: userProfile });
  };

  const handleBulkReject = (odIds: string[], reason: string) => {
    if (!userProfile) return;
    bulkRejectMutation.mutate({ odIds, rejectionReason: reason, hod: userProfile });
  };

  const isMutating =
    hodReviewMutation.isPending ||
    bulkApproveMutation.isPending ||
    bulkRejectMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          HOD Department Sanction Portal ({userProfile?.department || 'Department'})
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sanction or reject mentor-approved OD applications for your department. Unapproved mentor items remain gated.
        </p>
      </div>

      {isLoading ? (
        <Loader label="Loading department OD applications..." />
      ) : (
        <HODApprovalTable
          requests={requests}
          onSingleApprove={handleSingleApprove}
          onSingleReject={handleSingleReject}
          onBulkApprove={handleBulkApprove}
          onBulkReject={handleBulkReject}
          isLoading={isMutating}
        />
      )}
    </div>
  );
};
