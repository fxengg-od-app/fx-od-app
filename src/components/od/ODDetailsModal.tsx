import React from 'react';
import { Calendar, CheckCircle2, ExternalLink, GraduationCap, XCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { ODTimeline } from './ODTimeline';
import type { ODRequest } from '../../types/od';

interface ODDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ODRequest | null;
}

export const ODDetailsModal: React.FC<ODDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  if (!request) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HOD_APPROVED':
        return <Badge variant="success">Final Approved (HOD Sanctioned)</Badge>;
      case 'MENTOR_APPROVED':
        return <Badge variant="info">Mentor Approved (Pending HOD)</Badge>;
      case 'MENTOR_REJECTED':
        return <Badge variant="danger">Rejected by Mentor</Badge>;
      case 'HOD_REJECTED':
        return <Badge variant="danger">Rejected by HOD</Badge>;
      case 'EXPIRED':
        return <Badge variant="neutral">Expired (Date Passed)</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="neutral">Withdrawn by Student</Badge>;
      default:
        return <Badge variant="warning">Pending Mentor Review</Badge>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`OD Request Details: ${request.requestNumber || request.id}`}>
      <div className="space-y-4 text-xs text-gray-700 dark:text-gray-200">
        {/* Status Header Banner */}
        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-md">
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Application Status</p>
            <div className="mt-1">{getStatusBadge(request.status)}</div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Total Duration</p>
            <p className="text-base font-bold text-[#0B426E] dark:text-blue-300">{request.totalDays} Day(s)</p>
          </div>
        </div>

        {/* Student Identity Snapshot */}
        <div className="p-3.5 bg-white dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-md space-y-2.5">
          <div className="flex items-center gap-2 text-[#0B426E] dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Student & Institutional Snapshot</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Student Name</span>
              <span className="font-semibold text-gray-900 dark:text-white">{request.studentSnapshot.name}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Register Number</span>
              <span className="font-semibold text-gray-900 dark:text-white font-mono">{request.studentSnapshot.registerNumber}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Department / Year</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {request.department} • Year {request.studentSnapshot.year || 'N/A'} ({request.studentSnapshot.section || 'A'})
              </span>
            </div>
          </div>
        </div>

        {/* OD Details Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-white dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-md space-y-1">
            <span className="text-gray-500 dark:text-gray-400 block text-[11px]">OD Category & Faculty</span>
            <p className="font-semibold text-[#0B426E] dark:text-blue-300">{request.odType}</p>
            <p className="text-gray-600 dark:text-gray-300">Faculty In Charge: <strong className="text-gray-900 dark:text-white">{request.facultyInCharge}</strong></p>
          </div>
          <div className="p-3.5 bg-white dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-md space-y-1">
            <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Schedule Date</span>
            <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
              <Calendar className="w-3.5 h-3.5 text-[#0B426E] dark:text-blue-400" />
              <span>
                {request.startDate} {request.endDate ? ` to ${request.endDate}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Description & Proof */}
        <div className="p-3.5 bg-white dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-md space-y-1.5">
          <span className="text-gray-500 dark:text-gray-400 block text-[11px] font-medium">Description & Purpose</span>
          <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">{request.description}</p>
          {request.proofDocumentUrl && (
            <a
              href={request.proofDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#0B426E] dark:text-blue-300 hover:underline font-semibold pt-1"
            >
              View Verification Document <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Approvals Review Snapshots */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Immutable Review Snapshots
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Mentor Snapshot */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-md space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 dark:text-gray-200">Mentor Review</span>
                {request.mentorReview ? (
                  request.mentorReview.status === 'APPROVED' ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 flex items-center gap-1 font-bold">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Pending</span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                Assigned: {request.assignedMentorSnapshot.name} ({request.assignedMentorSnapshot.email})
              </p>
              {request.mentorReview?.rejectionReason && (
                <p className="text-red-700 dark:text-red-300 text-[11px] bg-red-50 dark:bg-red-950/40 p-2 rounded-md border border-red-200 dark:border-red-800">
                  Reason: {request.mentorReview.rejectionReason}
                </p>
              )}
            </div>

            {/* HOD Snapshot */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-md space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 dark:text-gray-200">HOD Sanction</span>
                {request.hodReview ? (
                  request.hodReview.status === 'APPROVED' ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sanctioned
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 flex items-center gap-1 font-bold">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    {request.status === 'PENDING' ? 'Waiting Mentor' : 'Pending HOD'}
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-[11px]">Department: {request.department} HOD</p>
              {request.hodReview?.rejectionReason && (
                <p className="text-red-700 dark:text-red-300 text-[11px] bg-red-50 dark:bg-red-950/40 p-2 rounded-md border border-red-200 dark:border-red-800">
                  Reason: {request.hodReview.rejectionReason}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Activity & Audit Trace
          </h4>
          <ODTimeline timeline={request.timeline} />
        </div>
      </div>
    </Modal>
  );
};
