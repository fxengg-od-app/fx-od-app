import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { CalendarWidget } from '../../components/dashboard/CalendarWidget';
import { DepartmentCards } from '../../components/dashboard/DepartmentCards';
import { StudentTable } from '../../components/tables/StudentTable';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { FaUserGraduate, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaShieldAlt } from 'react-icons/fa';

export const Dashboard: React.FC = () => {
  const { requests, currentRole } = useApp();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const filterDate = selectedDate || todayStr;

  // Role-based request filtering
  let roleRequests = requests;
  if (currentRole === 'STUDENT') {
    roleRequests = requests.filter(r => r.registerNumber === '951221104001');
  } else if (currentRole === 'MENTOR') {
    roleRequests = requests.filter(r => r.department === 'CSE');
  }
  // HOD and ADMIN see all requests

  // Stats derived from role-filtered set
  const odTodayCount = roleRequests.filter(
    (r) =>
      r.finalStatus === 'APPROVED' &&
      (r.startDate === todayStr || (r.endDate && todayStr >= r.startDate && todayStr <= r.endDate))
  ).length;
  const pendingCount = roleRequests.filter((r) => r.finalStatus === 'PENDING').length;
  const approvedCount = roleRequests.filter((r) => r.finalStatus === 'APPROVED').length;
  const rejectedCount = roleRequests.filter((r) => r.finalStatus === 'REJECTED').length;

  // Active OD students for the selected/today date + optional dept filter
  const activeDateStudents = roleRequests.filter((r) => {
    const active =
      r.startDate === filterDate ||
      (r.endDate && filterDate >= r.startDate && filterDate <= r.endDate);
    if (!active) return false;
    if (selectedDept && r.department !== selectedDept) return false;
    return true;
  });

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const isAdmin = currentRole === 'ADMIN';
  const isStudent = currentRole === 'STUDENT';

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 m-0">
            {isStudent
              ? 'My Dashboard'
              : isAdmin
              ? 'Administrative Dashboard'
              : 'General Dashboard'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isStudent
              ? 'Overview of your personal OD applications, statuses, and history.'
              : isAdmin
              ? 'Read-only access to college-wide OD records, analytics, and reports.'
              : 'Welcome to the On-Duty Portal. Overview of current applications, statistics, and records.'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-1.5">
            <FaShieldAlt className="h-3 w-3 text-purple-500" />
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Admin • Read Only</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={isStudent ? 'My ODs Today' : 'Students On OD Today'}
          value={odTodayCount}
          icon={<FaUserGraduate className="h-6 w-6" />}
          color="blue"
          description="Approved & active today"
        />
        <StatsCard
          title={isStudent ? 'My Pending Requests' : 'Pending Requests'}
          value={pendingCount}
          icon={<FaHourglassHalf className="h-6 w-6" />}
          color="yellow"
          description="Awaiting staff approval"
        />
        <StatsCard
          title={isStudent ? 'My Approved' : 'Approved Requests'}
          value={approvedCount}
          icon={<FaCheckCircle className="h-6 w-6" />}
          color="green"
          description="Total approved to date"
        />
        <StatsCard
          title={isStudent ? 'My Rejected' : 'Rejected Requests'}
          value={rejectedCount}
          icon={<FaTimesCircle className="h-6 w-6" />}
          color="red"
          description="Total rejected to date"
        />
      </div>

      {/* Calendar + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarWidget
            data={roleRequests}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
          />
        </div>
        <div>
          <RecentActivity data={roleRequests} />
        </div>
      </div>

      {/* Department Filtering & Active Students — only for non-students */}
      {!isStudent && (
        <>
          {(currentRole === 'HOD' || isAdmin) && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Departments Overview</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Click a department to filter active OD students.
                </p>
              </div>
              <DepartmentCards selectedDept={selectedDept} onSelectDept={setSelectedDept} />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Active OD Students
                  {selectedDept
                    ? ` (${selectedDept})`
                    : currentRole === 'MENTOR'
                    ? ' (CSE Department)'
                    : ' (All Departments)'}
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {selectedDate
                    ? `Showing records for ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : `Showing records for today (${new Date(todayStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })})`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    className="text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg px-2.5 py-1 hover:border-red-200 hover:bg-red-50 cursor-pointer transition-all"
                  >
                    Reset to Today
                  </button>
                )}
                {selectedDept && (
                  <button
                    onClick={() => setSelectedDept(null)}
                    className="text-xs font-semibold text-fx-blue hover:text-blue-700 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    Clear Dept Filter
                  </button>
                )}
              </div>
            </div>
            <StudentTable data={activeDateStudents} />
          </div>
        </>
      )}
    </div>
  );
};
