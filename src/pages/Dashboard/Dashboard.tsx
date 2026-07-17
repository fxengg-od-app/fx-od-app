import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { CalendarWidget } from '../../components/dashboard/CalendarWidget';
import { DepartmentCards } from '../../components/dashboard/DepartmentCards';
import { StudentTable } from '../../components/tables/StudentTable';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { FaUserGraduate, FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export const Dashboard: React.FC = () => {
  const { requests } = useApp();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const odTodayCount = requests.filter(
    (r) =>
      r.finalStatus === 'APPROVED' &&
      (r.startDate === todayStr || (r.endDate && todayStr >= r.startDate && todayStr <= r.endDate))
  ).length;

  const pendingCount = requests.filter((r) => r.finalStatus === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.finalStatus === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.finalStatus === 'REJECTED').length;

  // Filter students on OD today for the selected department
  const todayStudents = requests.filter((r) => {
    const isToday = r.startDate === todayStr || (r.endDate && todayStr >= r.startDate && todayStr <= r.endDate);
    if (!isToday) return false;
    if (selectedDept && r.department !== selectedDept) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 m-0">
          General Dashboard
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Welcome to the On-Duty Portal. Overview of current applications, statistics, and records.
        </p>
      </div>

      {/* Top Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Students On OD Today"
          value={odTodayCount}
          icon={<FaUserGraduate className="h-6 w-6" />}
          color="blue"
          description="Approved & active today"
        />
        <StatsCard
          title="Pending Requests"
          value={pendingCount}
          icon={<FaHourglassHalf className="h-6 w-6" />}
          color="yellow"
          description="Awaiting staff approval"
        />
        <StatsCard
          title="Approved Requests"
          value={approvedCount}
          icon={<FaCheckCircle className="h-6 w-6" />}
          color="green"
          description="Total approved to date"
        />
        <StatsCard
          title="Rejected Requests"
          value={rejectedCount}
          icon={<FaTimesCircle className="h-6 w-6" />}
          color="red"
          description="Total rejected to date"
        />
      </div>

      {/* Middle Grid: Calendar and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarWidget />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Department Filtering Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-150">
            Departments Overview
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Click on a department card below to filter today's active OD student list.
          </p>
        </div>
        <DepartmentCards selectedDept={selectedDept} onSelectDept={setSelectedDept} />
      </div>

      {/* Today's OD Student List Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-150">
            Active OD Students {selectedDept ? `(${selectedDept})` : '(All Departments)'}
          </h3>
          {selectedDept && (
            <button
              onClick={() => setSelectedDept(null)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
        <StudentTable data={todayStudents} />
      </div>
    </div>
  );
};
