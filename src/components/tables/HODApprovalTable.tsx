import React from 'react';
import { Button } from '../common/Button';
import type { ODRequest } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { FaCheck, FaClock } from 'react-icons/fa';

interface HODApprovalTableProps {
  data: ODRequest[];
  onApprove: (id: string) => void;
  onRejectTrigger: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export const HODApprovalTable: React.FC<HODApprovalTableProps> = ({
  data,
  onApprove,
  onRejectTrigger,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const allSelected = data.length > 0 && selectedIds.length === data.filter(r => r.mentorStatus === 'APPROVED').length;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Requests Pending HOD Action"
              description="There are currently no requests awaiting HOD approval."
            />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Mentor Approved
                </th>
                <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((req) => {
                const isMentorApproved = req.mentorStatus === 'APPROVED';
                const isChecked = selectedIds.includes(req.id);

                return (
                  <tr key={req.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        disabled={!isMentorApproved}
                        checked={isChecked}
                        onChange={() => onToggleSelect(req.id)}
                        className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-30 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{req.name}</p>
                        <p className="font-mono text-[10px] text-gray-500">
                          {req.registerNumber} • {req.department}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div>
                        <p className="font-semibold text-xs leading-tight">{req.description}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Faculty: {req.facultyInCharge}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {req.dateType === 'SINGLE' ? req.startDate : `${req.startDate} to ${req.endDate}`}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {isMentorApproved ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-50 text-green-600 font-bold border border-green-200">
                            <FaCheck className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                            <FaClock className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="success"
                          disabled={!isMentorApproved}
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
