import React from 'react';
import { Badge } from '../common/Badge';
import type { ODRequest } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';

interface RequestsTableProps {
  data: ODRequest[];
}

export const RequestsTable: React.FC<RequestsTableProps> = ({ data }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Requests Applied"
              description="You have not submitted any OD requests yet."
            />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Mentor Status
                </th>
                <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wider text-center">
                  HOD Status
                </th>
                <th className="px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Final Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {req.dateType === 'SINGLE' ? req.startDate : `${req.startDate} to ${req.endDate}`}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{req.description}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Mentor: {req.mentorName} • Faculty: {req.facultyInCharge} • {req.odType}
                      </p>
                      {req.rejectionReason && (
                        <p className="text-[10px] text-red-500 mt-1 font-semibold">
                          Reason: {req.rejectionReason}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge status={req.mentorStatus} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge status={req.hodStatus} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge status={req.finalStatus} />
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
