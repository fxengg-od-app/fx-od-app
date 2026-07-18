import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MentorApprovalTable } from '../../components/tables/MentorApprovalTable';
import { RejectionModal } from '../../components/modals/RejectionModal';

export const PendingApprovals: React.FC = () => {
  const { requests, updateMentorStatus } = useApp();
  const [rejectId, setRejectId] = useState<string | null>(null);

  // Filter requests pending mentor review
  const pendingRequests = requests.filter(
    (r) => r.mentorStatus === 'PENDING'
  );

  const handleApprove = (id: string) => {
    updateMentorStatus(id, 'APPROVED');
  };

  const handleRejectTrigger = (id: string) => {
    setRejectId(id);
  };

  const handleRejectSubmit = (reason: string) => {
    if (rejectId) {
      updateMentorStatus(rejectId, 'REJECTED', reason);
      setRejectId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 m-0">
          Mentor Pending Approvals
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review and approve OD applications submitted by students in your mentorship batch.
        </p>
      </div>

      <MentorApprovalTable
        data={pendingRequests}
        onApprove={handleApprove}
        onRejectTrigger={handleRejectTrigger}
      />

      <RejectionModal
        isOpen={rejectId !== null}
        onClose={() => setRejectId(null)}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
};
