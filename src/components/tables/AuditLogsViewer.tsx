import React, { useState } from 'react';
import { Shield, Filter } from 'lucide-react';
import type { AuditLogEntry } from '../../types/audit';

interface AuditLogsViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogsViewer: React.FC<AuditLogsViewerProps> = ({ logs }) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-4">
      {/* Action Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0B426E] dark:text-blue-300">
          <Shield className="w-4 h-4 text-[#0B426E] dark:text-blue-400" />
          <span>Security Audit Trail ({filteredLogs.length} Events)</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="text-gray-400 w-3.5 h-3.5 shrink-0" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full sm:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-900 dark:text-white px-3 py-1.5 rounded-md focus:ring-1 focus:ring-[#0B426E] cursor-pointer"
          >
            <option value="ALL">All Audit Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Stacked View (< md) */}
      <div className="space-y-3 md:hidden">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-3.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs space-y-2 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                {typeof log.createdAt === 'string'
                  ? new Date(log.createdAt).toLocaleString()
                  : log.createdAt
                  ? new Date(
                      (log.createdAt as { seconds: number }).seconds * 1000
                    ).toLocaleString()
                  : 'Just now'}
              </span>
              <span className="font-bold text-[11px] bg-blue-50 dark:bg-blue-950/60 text-[#0B426E] dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                {log.action}
              </span>
            </div>

            <div className="pt-1">
              <p className="font-semibold text-gray-900 dark:text-white">{log.performedBy.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {log.performedBy.email} ({log.performedBy.role})
              </p>
            </div>

            <pre className="text-[10px] font-mono bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 overflow-x-auto max-h-32">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      {/* Desktop Audit Log Table (>= md) */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs max-h-[600px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 uppercase font-semibold text-[11px] tracking-wider text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Action Event</th>
              <th className="p-3.5">Performed By</th>
              <th className="p-3.5">Details & Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-gray-700 dark:text-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <td className="p-3.5 text-[11px] text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                  {typeof log.createdAt === 'string'
                    ? new Date(log.createdAt).toLocaleString()
                    : log.createdAt
                    ? new Date(
                        (log.createdAt as { seconds: number }).seconds * 1000
                      ).toLocaleString()
                    : 'Just now'}
                </td>
                <td className="p-3.5">
                  <span className="font-bold text-xs bg-blue-50 dark:bg-blue-950/60 text-[#0B426E] dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                    {log.action}
                  </span>
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-gray-900 dark:text-white">{log.performedBy.name}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {log.performedBy.email} ({log.performedBy.role})
                  </div>
                </td>
                <td className="p-3.5 text-xs text-gray-700 dark:text-gray-200">
                  <pre className="text-[10px] font-mono bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 max-w-md overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
