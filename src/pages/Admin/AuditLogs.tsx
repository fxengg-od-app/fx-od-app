import React from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { AuditLogsViewer } from '../../components/tables/AuditLogsViewer';
import { Loader } from '../../components/common/Loader';
import type { AuditLogEntry } from '../../types/audit';

export const AuditLogs: React.FC = () => {
  const { data: logs = [], isLoading } = useAuditLogs();

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">Security & System Audit Logs</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Immutable history of all institutional logins, OD submissions, mentor approvals, HOD sanctions, and role updates.
        </p>
      </div>

      {isLoading ? (
        <Loader label="Loading security audit records..." />
      ) : (
        <AuditLogsViewer logs={logs as AuditLogEntry[]} />
      )}
    </div>
  );
};
