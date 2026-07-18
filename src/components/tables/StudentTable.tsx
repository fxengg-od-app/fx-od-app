import React from 'react';
import { Badge } from '../common/Badge';
import type { ODRequest } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';

interface StudentTableProps {
  data: ODRequest[];
}

export const StudentTable: React.FC<StudentTableProps> = ({ data }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Students on Duty"
              description="There are currently no approved OD applications active for the selected date."
            />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">Register No.</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">Dept</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">Year / Sec</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">Mentor</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-5 py-3.5 font-mono text-gray-700 whitespace-nowrap">{s.registerNumber}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{s.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block bg-blue-50 text-fx-blue text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                      {s.department}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{s.year} – {s.section}</td>
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{s.mentorName}</td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-[200px] truncate">{s.description}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge status={s.finalStatus} />
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
