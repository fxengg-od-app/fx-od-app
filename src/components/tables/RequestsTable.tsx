import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Calendar, User } from 'lucide-react';
import type { ODRequest } from '../../types/od';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ODDetailsModal } from '../od/ODDetailsModal';

interface RequestsTableProps {
  requests: ODRequest[];
  showStudentDetails?: boolean;
}

export const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  showStudentDetails = false,
}) => {
  const [selectedViewRequest, setSelectedViewRequest] = useState<ODRequest | null>(null);
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('highlight') || searchParams.get('odId');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HOD_APPROVED':
        return <Badge variant="success">HOD Approved</Badge>;
      case 'MENTOR_APPROVED':
        return <Badge variant="info">Mentor Approved (Pending HOD)</Badge>;
      case 'MENTOR_REJECTED':
        return <Badge variant="danger">Rejected by Mentor</Badge>;
      case 'HOD_REJECTED':
        return <Badge variant="danger">Rejected by HOD</Badge>;
      default:
        return <Badge variant="warning">Pending Mentor</Badge>;
    }
  };

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">No OD requests found in records.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Stacked Card View (< md) */}
      <div className="space-y-3 md:hidden">
        {requests.map((req) => {
          const isHighlighted = req.id === highlightedId;
          return (
            <div
              key={req.id}
              className={`p-4 bg-white dark:bg-gray-800 rounded-md border transition-all space-y-2.5 ${
                isHighlighted
                  ? 'border-[#0B426E] ring-2 ring-[#0B426E] bg-amber-50/50 dark:bg-amber-950/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {isHighlighted && (
                    <span className="text-[10px] font-bold bg-[#0B426E] text-white px-1.5 py-0.5 rounded-full shrink-0">
                      Targeted
                    </span>
                  )}
                  <span className="font-mono font-bold text-xs text-[#0B426E] dark:text-blue-300 truncate">
                    {req.requestNumber || req.id}
                  </span>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              {showStudentDetails && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600 text-xs">
                  <User className="w-3.5 h-3.5 text-[#0B426E] dark:text-blue-300 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{req.studentSnapshot.name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Reg: {req.studentSnapshot.registerNumber} • {req.department}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Category</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{req.odType}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Schedule</span>
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {req.startDate} ({req.totalDays}d)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700 text-xs">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Faculty: <strong className="text-gray-700 dark:text-gray-200">{req.facultyInCharge}</strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedViewRequest(req)}
                  className="w-full sm:w-auto"
                >
                  <Eye className="mr-1 w-3.5 h-3.5" /> View Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 uppercase font-semibold text-[11px] tracking-wider">
              <th className="p-3">Req No</th>
              {showStudentDetails && <th className="p-3">Student</th>}
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
                  <td className="p-3 font-mono font-bold text-[#0B426E] dark:text-blue-300">
                    {req.requestNumber || req.id}
                  </td>
                  {showStudentDetails && (
                    <td className="p-3">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {req.studentSnapshot.name}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        Reg: {req.studentSnapshot.registerNumber} • {req.department} ({req.studentSnapshot.year}-{req.studentSnapshot.section})
                      </div>
                    </td>
                  )}
                  <td className="p-3 font-medium">{req.odType}</td>
                  <td className="p-3">
                    <div>{req.startDate}</div>
                    <div className="text-[11px] text-gray-400">
                      {req.endDate ? `To ${req.endDate} ` : ''}({req.totalDays} day)
                    </div>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{req.facultyInCharge}</td>
                  <td className="p-3">{getStatusBadge(req.status)}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedViewRequest(req)}
                    >
                      <Eye className="mr-1 w-3.5 h-3.5" /> View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ODDetailsModal
        isOpen={!!selectedViewRequest}
        onClose={() => setSelectedViewRequest(null)}
        request={selectedViewRequest}
      />
    </>
  );
};
