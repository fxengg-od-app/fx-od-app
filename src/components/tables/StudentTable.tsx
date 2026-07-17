import React from 'react';
import { Badge } from '../common/Badge';
import type { ODRequest } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';

interface StudentTableProps {
  data: ODRequest[];
}

export const StudentTable: React.FC<StudentTableProps> = ({ data }) => {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Students on Duty Today"
              description="There are currently no approved OD applications active for today's date."
            />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800 text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Register Number
                </th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {data.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all">
                  <td className="px-6 py-4 font-mono font-semibold text-gray-900 dark:text-zinc-150">
                    {student.registerNumber}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-zinc-200">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{student.year}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{student.section}</td>
                  <td className="px-6 py-4">
                    <Badge status={student.finalStatus} />
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
