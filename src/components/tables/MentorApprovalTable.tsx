import React from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { ODRequest } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';

interface MentorApprovalTableProps {
  data: ODRequest[];
  onApprove: (id: string) => void;
  onRejectTrigger: (id: string) => void;
}

export const MentorApprovalTable: React.FC<MentorApprovalTableProps> = ({
  data,
  onApprove,
  onRejectTrigger,
}) => {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Pending Approvals"
              description="There are currently no pending OD requests awaiting your review."
            />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800 text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Register Number
                </th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Faculty
                </th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-center">
                  HOD Status
                </th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {data.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all">
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-zinc-200">
                    {req.name}
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-gray-900 dark:text-zinc-150">
                    {req.registerNumber}
                  </td>
                  <td className="px-6 py-4 text-gray-650 dark:text-zinc-350 font-medium">
                    {req.description}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                    {req.facultyInCharge}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700 dark:text-zinc-300">
                    {req.dateType === 'SINGLE' ? req.startDate : `${req.startDate} to ${req.endDate}`}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge status={req.hodStatus} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => onApprove(req.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onRejectTrigger(req.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
