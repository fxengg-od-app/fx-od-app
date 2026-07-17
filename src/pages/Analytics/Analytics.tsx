import React from 'react';
import { Card } from '../../components/common/Card';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { FaGraduationCap, FaPercent, FaClock, FaCheckDouble } from 'react-icons/fa';

export const Analytics: React.FC = () => {
  const { requests } = useApp();

  // Metrics calculations
  const total = requests.length;
  const approved = requests.filter((r) => r.finalStatus === 'APPROVED').length;
  const pending = requests.filter((r) => r.finalStatus === 'PENDING').length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Department-wise distribution
  const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS'];
  const deptCounts = departments.map((dept) => {
    return requests.filter((r) => r.department === dept && r.finalStatus === 'APPROVED').length;
  });
  const maxDeptCount = Math.max(...deptCounts, 1);

  // Monthly trends (mocked values + local adjustments)
  const monthlyData = [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 19 },
    { month: 'Mar', count: 32 },
    { month: 'Apr', count: 15 },
    { month: 'May', count: 8 },
    { month: 'Jun', count: 24 },
    { month: 'Jul', count: approved + 5 },
  ];
  const maxMonthlyCount = Math.max(...monthlyData.map((d) => d.count), 1);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 m-0">
          Analytics Overview
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Detailed metrics, department approvals, trends, and success rate analysis.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Applications"
          value={total}
          icon={<FaGraduationCap className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Approval Rate"
          value={`${approvalRate}%`}
          icon={<FaPercent className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="Pending Queue"
          value={pending}
          icon={<FaClock className="h-5 w-5" />}
          color="yellow"
        />
        <StatsCard
          title="Approved ODs"
          value={approved}
          icon={<FaCheckDouble className="h-5 w-5" />}
          color="blue"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Statistics - SVG Bar Chart */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-150 mb-6">
            Department Statistics (Approved ODs)
          </h3>
          <div className="space-y-4">
            {departments.map((dept, idx) => {
              const count = deptCounts[idx];
              const pct = (count / maxDeptCount) * 100;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-zinc-300">{dept}</span>
                    <span className="text-gray-900 dark:text-zinc-100 font-bold">{count} ODs</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Monthly Trend - Area SVG Chart */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-150 mb-4">
              Monthly OD Count
            </h3>
            <p className="text-[10px] text-gray-400 font-medium mb-6">
              OD application approval frequencies over the calendar months.
            </p>
          </div>
          <div className="flex items-end justify-between h-48 pt-4 border-b border-l border-gray-150 dark:border-zinc-800 px-4">
            {monthlyData.map((d) => {
              const heightPct = (d.count / maxMonthlyCount) * 80; // scale max height
              return (
                <div key={d.month} className="flex flex-col items-center flex-1 group">
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    className="w-8 bg-blue-500/20 group-hover:bg-blue-500 border border-blue-500 rounded-t-sm transition-all duration-300"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-semibold text-gray-500 mt-2">{d.month}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
