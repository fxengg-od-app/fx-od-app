import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HODApprovalTable } from '../../components/tables/HODApprovalTable';
import { RejectionModal } from '../../components/modals/RejectionModal';
import { Button } from '../../components/common/Button';

export const HODPendingApprovals: React.FC = () => {
  const { requests, updateHODStatus, bulkHODApprove, bulkHODReject } = useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [isBulkReject, setIsBulkReject] = useState(false);

  // Filter requests pending HOD review
  const pendingRequests = requests.filter(
    (r) => r.hodStatus === 'PENDING' && r.finalStatus !== 'REJECTED'
  );

  const handleApprove = (id: string) => {
    updateHODStatus(id, 'APPROVED');
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleRejectTrigger = (id: string) => {
    setIsBulkReject(false);
    setRejectId(id);
  };

  const handleRejectSubmit = (reason: string) => {
    if (isBulkReject) {
      bulkHODReject(selectedIds, reason);
      setSelectedIds([]);
    } else if (rejectId) {
      updateHODStatus(rejectId, 'REJECTED', reason);
      setRejectId(null);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const mentorApprovedPending = pendingRequests.filter((r) => r.mentorStatus === 'APPROVED');
    if (selectedIds.length === mentorApprovedPending.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mentorApprovedPending.map((r) => r.id));
    }
  };

  const handleBulkApprove = () => {
    bulkHODApprove(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkRejectTrigger = () => {
    setIsBulkReject(true);
    setRejectId('BULK');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 m-0">
            HOD Pending Approvals
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review, check mentor status, and process OD requests. Approve/Reject individually or in bulk.
          </p>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button variant="success" onClick={handleBulkApprove}>
              Approve Selected ({selectedIds.length})
            </Button>
            <Button variant="danger" onClick={handleBulkRejectTrigger}>
              Reject Selected ({selectedIds.length})
            </Button>
          </div>
        )}
      </div>

      <HODApprovalTable
        data={pendingRequests}
        onApprove={handleApprove}
        onRejectTrigger={handleRejectTrigger}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
      />

      <RejectionModal
        isOpen={rejectId !== null}
        onClose={() => setRejectId(null)}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
};
