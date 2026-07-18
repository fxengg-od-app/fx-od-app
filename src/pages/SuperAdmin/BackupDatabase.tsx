import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  FaDatabase,
  FaDownload,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaFileArchive,
  FaExclamationTriangle,
} from 'react-icons/fa';

interface BackupHistoryItem {
  id: string;
  name: string;
  date: string;
  size: string;
  status: 'Completed' | 'Running' | 'Failed';
}

export const BackupDatabase: React.FC = () => {
  const [selectedBackupType, setSelectedBackupType] = useState<string>('FULL');
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [backupToDelete, setBackupToDelete] = useState<BackupHistoryItem | null>(null);

  // Mock History
  const [history, setHistory] = useState<BackupHistoryItem[]>([
    {
      id: 'b-1',
      name: 'fxcams_od_backup_full_20260718.sql.gz',
      date: '2026-07-18 09:00 AM',
      size: '14.2 MB',
      status: 'Completed',
    },
    {
      id: 'b-2',
      name: 'fxcams_od_backup_students_20260717.sql.gz',
      date: '2026-07-17 06:12 PM',
      size: '4.8 MB',
      status: 'Completed',
    },
    {
      id: 'b-3',
      name: 'fxcams_od_backup_full_20260710.sql.gz',
      date: '2026-07-10 12:00 AM',
      size: '13.9 MB',
      status: 'Completed',
    },
    {
      id: 'b-4',
      name: 'fxcams_od_backup_requests_20260705.sql.gz',
      date: '2026-07-05 02:45 PM',
      size: '1.2 MB',
      status: 'Failed',
    },
  ]);

  // Calculations for stats
  const dbStatus = 'Healthy';
  const totalBackups = history.length.toString();
  const lastBackup = history.find((h) => h.status === 'Completed')?.date || 'Never';
  const databaseSize = '84.6 MB';

  // Handle Action Backup Now
  const handleBackupNow = () => {
    setIsBackingUp(true);

    const typeLabels: { [key: string]: string } = {
      FULL: 'full',
      STUDENT: 'students',
      FACULTY: 'faculty',
      DEPARTMENTS: 'departments',
      OD_REQUESTS: 'requests',
    };

    const label = typeLabels[selectedBackupType] || 'full';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const backupName = `fxcams_od_backup_${label}_${dateStr}.sql.gz`;

    const newBackup: BackupHistoryItem = {
      id: `b-temp-${Date.now()}`,
      name: backupName,
      date: new Date().toLocaleString(),
      size: 'Calculating...',
      status: 'Running',
    };

    setHistory((prev) => [newBackup, ...prev]);

    // Simulate database export
    setTimeout(() => {
      setIsBackingUp(false);
      const isSuccess = Math.random() > 0.05; // 95% success rate
      setHistory((prevHistory) =>
        prevHistory.map((item) => {
          if (item.id === newBackup.id) {
            return {
              ...item,
              size: `${(Math.random() * 10 + 2).toFixed(1)} MB`,
              status: isSuccess ? 'Completed' : 'Failed',
            };
          }
          return item;
        })
      );
    }, 2500);
  };

  // Handle Download Action Click
  const handleDownload = (item: BackupHistoryItem) => {
    alert(`Downloading backup file: ${item.name}`);
  };

  // Handle Delete Confirmation Modal Trigger
  const handleDeleteClick = (item: BackupHistoryItem) => {
    setBackupToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Handle Delete Backup Confirm
  const handleDeleteConfirm = () => {
    if (backupToDelete) {
      setHistory((prev) => prev.filter((h) => h.id !== backupToDelete.id));
      setIsDeleteModalOpen(false);
      setBackupToDelete(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 m-0">
          Database Backup Management
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Perform administrative full exports, download archives, and restore historical snapshots of the portal.
        </p>
      </div>

      {/* Database Status Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Database Status"
          value={dbStatus}
          icon={<FaDatabase className="h-6 w-6" />}
          color="green"
          description="Oracle/MySQL engine online"
        />
        <StatsCard
          title="Database Size"
          value={databaseSize}
          icon={<FaFileArchive className="h-6 w-6" />}
          color="blue"
          description="Allocated transaction space"
        />
        <StatsCard
          title="Last Backup"
          value={lastBackup}
          icon={<FaDatabase className="h-6 w-6" />}
          color="yellow"
          description="Latest transaction archive"
        />
        <StatsCard
          title="Total Backups"
          value={totalBackups}
          icon={<FaDatabase className="h-6 w-6" />}
          color="red"
          description="Archived on server"
        />
      </div>

      {/* Main Operations Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-zinc-200">
            Export Database Archive
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Choose Backup Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'FULL', title: 'Full Backup', desc: 'Complete database mapping & logs' },
                  { id: 'STUDENT', title: 'Student Data', desc: 'Imported student registration list' },
                  { id: 'FACULTY', title: 'Faculty Data', desc: 'Faculty, mentors, HOD profile data' },
                  { id: 'DEPARTMENTS', title: 'Departments', desc: 'Academic structures & course lines' },
                  { id: 'OD_REQUESTS', title: 'OD Requests', desc: 'Submitted requests and approvals' },
                ].map((type) => (
                  <label
                    key={type.id}
                    className={`border rounded-xl p-3.5 flex flex-col cursor-pointer transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 ${
                      selectedBackupType === type.id
                        ? 'border-blue-500 bg-blue-50/10 dark:bg-blue-950/10 ring-2 ring-blue-500/10'
                        : 'border-gray-200 dark:border-zinc-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="backupType"
                      value={type.id}
                      checked={selectedBackupType === type.id}
                      onChange={() => setSelectedBackupType(type.id)}
                      className="sr-only"
                      disabled={isBackingUp}
                    />
                    <span className="text-xs font-bold text-gray-900 dark:text-zinc-150">
                      {type.title}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
                      {type.desc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Button
                onClick={handleBackupNow}
                disabled={isBackingUp}
                variant="primary"
                className="font-bold flex items-center gap-2"
              >
                {isBackingUp && <FaSpinner className="animate-spin h-3.5 w-3.5" />}
                Backup Now
              </Button>
              <Button
                onClick={() => {
                  const latest = history.find((h) => h.status === 'Completed');
                  if (latest) handleDownload(latest);
                }}
                disabled={isBackingUp}
                variant="outline"
                className="font-bold"
              >
                Download Latest Backup
              </Button>
            </div>
          </div>
        </Card>

        {/* Database Snapshot Restore Card (DISABLED UI) */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-yellow-600">
            <FaExclamationTriangle className="h-5 w-5" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
              Restore System Snapshot
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Rollback database to a previous point-in-time configuration. Restoring overwrites existing OD transaction files.
          </p>
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/40 rounded-xl border border-gray-150 dark:border-zinc-800 flex items-center justify-center text-center opacity-60">
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                Database Restoration
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 font-semibold">
                Disabled in Frontend Mock Mode
              </p>
              <Button disabled variant="outline" size="sm" className="mt-3 font-bold">
                Restore Database
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* History table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-150">Database Backup Log</h3>
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800 text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Backup Name
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all">
                    <td className="px-6 py-4 font-mono font-semibold text-gray-900 dark:text-zinc-150">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{item.date}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{item.size}</td>
                    <td className="px-6 py-4">
                      {item.status === 'Completed' ? (
                        <Badge status="APPROVED">
                          <span className="flex items-center gap-1">
                            <FaCheckCircle className="h-3 w-3" /> Completed
                          </span>
                        </Badge>
                      ) : item.status === 'Failed' ? (
                        <Badge status="REJECTED">
                          <span className="flex items-center gap-1">
                            <FaTimesCircle className="h-3 w-3" /> Failed
                          </span>
                        </Badge>
                      ) : (
                        <Badge status="PENDING">
                          <span className="flex items-center gap-1 animate-pulse">
                            <FaSpinner className="animate-spin h-3.5 w-3.5" /> Running
                          </span>
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleDownload(item)}
                          disabled={item.status !== 'Completed'}
                          title="Download Backup SQL"
                        >
                          <FaDownload className="h-3 w-3 text-blue-650" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleDeleteClick(item)}
                          disabled={item.status === 'Running'}
                          title="Delete Backup Snapshot"
                        >
                          <FaTrash className="h-3 w-3 text-red-650" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Backup Deletion"
      >
        {backupToDelete && (
          <div className="space-y-4">
            <p className="text-xs text-gray-650 dark:text-zinc-300">
              Are you sure you want to permanently delete the backup{' '}
              <strong className="text-gray-900 dark:text-zinc-100">
                "{backupToDelete.name}"
              </strong>
              ? This transaction file will be purged from the server space.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} variant="danger">
                Delete Backup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
