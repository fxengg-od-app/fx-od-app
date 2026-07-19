import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Eye, X, Calendar } from 'lucide-react';
import type { ODRequest } from '../../types/od';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { RejectionReasonModal } from '../modals/RejectionReasonModal';
import { ODDetailsModal } from '../od/ODDetailsModal';

interface MentorApprovalTableProps {
  requests: ODRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isLoading?: boolean;
}

export const MentorApprovalTable: React.FC<MentorApprovalTableProps> = ({
  requests,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);
  const [selectedViewRequest, setSelectedViewRequest] = useState<ODRequest | null>(null);
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('highlight') || searchParams.get('odId');

  const handleConfirmReject = (reason: string) => {
    if (selectedRejectId) {
      onReject(selectedRejectId, reason);
      setSelectedRejectId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">No pending OD requests assigned for mentor approval.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Stacked 1-Hand Approval Cards (< md) */}
      <div className="space-y-3 md:hidden">
        {requests.map((req) => {
          const isHighlighted = req.id === highlightedId;
          return (
            <div
              key={req.id}
              className={`p-4 bg-white dark:bg-gray-800 rounded-md border transition-all space-y-3 ${
                isHighlighted
                  ? 'border-[#0B426E] ring-2 ring-[#0B426E] bg-amber-50/50 dark:bg-amber-950/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 shadow-xs'
              }`}
            >
              {/* Student Info */}
              <div className="flex items-start justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {isHighlighted && (
                      <span className="text-[10px] font-bold bg-[#0B426E] text-white px-1.5 py-0.5 rounded-full shrink-0">
                        Targeted
                      </span>
                    )}
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      {req.studentSnapshot.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                    Reg: {req.studentSnapshot.registerNumber} • {req.department} ({req.studentSnapshot.year}-{req.studentSnapshot.section})
                  </p>
                </div>
                <Badge variant="warning">Pending Mentor</Badge>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold block">Category</span>
                  <span className="font-semibold text-[#0B426E] dark:text-blue-300">{req.odType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold block">Schedule</span>
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {req.startDate} ({req.totalDays}d)
                  </span>
                </div>
              </div>

              {/* 1-Hand Mobile Action Controls */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setSelectedViewRequest(req)}
                  className="w-full text-xs"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> View
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setSelectedRejectId(req.id)}
                  disabled={isLoading}
                  className="w-full text-xs"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>
                <Button
                  variant="success"
                  size="md"
                  onClick={() => onApprove(req.id)}
                  disabled={isLoading}
                  className="w-full text-xs font-semibold"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Desktop Approval Table (>= md) */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 uppercase font-semibold text-[11px] tracking-wider">
              <th className="p-3">Student & Reg No</th>
              <th className="p-3">Category</th>
              <th className="p-3">Schedule</th>
              <th className="p-3">Faculty In Charge</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-gray-700 dark:text-gray-200">
            {requests.map((req) => {
              const isHighlighted = req.id === highlightedId;
              return (
                <tr
                  key={req.id}
                  className={`transition-colors ${
                    isHighlighted
                      ? 'bg-amber-50 dark:bg-amber-950/30 font-semibold border-l-4 border-l-[#0B426E]'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                  }`}
                >
                  <td className="p-3">
                    <div className="font-semibold text-gray-900 dark:text-white">{req.studentSnapshot.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Reg: {req.studentSnapshot.registerNumber} • {req.department} ({req.studentSnapshot.year}-{req.studentSnapshot.section})
                    </div>
                  </td>
                  <td className="p-3 font-medium text-[#0B426E] dark:text-blue-300">{req.odType}</td>
                  <td className="p-3">
                    <div>{req.startDate}</div>
                    <div className="text-[11px] text-gray-400">
                      {req.endDate ? `To ${req.endDate} ` : ''}({req.totalDays} day)
                    </div>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{req.facultyInCharge}</td>
                  <td className="p-3">
                    <Badge variant="warning">Pending Mentor</Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedViewRequest(req)}
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setSelectedRejectId(req.id)}
                        disabled={isLoading}
                      >
                        <X className="mr-1 w-3.5 h-3.5" /> Reject
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onApprove(req.id)}
                        disabled={isLoading}
                      >
                        <Check className="mr-1 w-3.5 h-3.5" /> Approve
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RejectionReasonModal
        isOpen={!!selectedRejectId}
        onClose={() => setSelectedRejectId(null)}
        onSubmit={handleConfirmReject}
        title="Mentor Rejection - Specify Reason"
      />

      <ODDetailsModal
        isOpen={!!selectedViewRequest}
        onClose={() => setSelectedViewRequest(null)}
        request={selectedViewRequest}
      />
    </>
  );
};
