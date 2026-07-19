import React from 'react';
import { BarChart3, PieChart, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAllODRequests } from '../../hooks/useODRequests';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';

export const Analytics: React.FC = () => {
  const { data: requests = [], isLoading } = useAllODRequests();

  const total = requests.length;
  const hodApproved = requests.filter((r) => r.status === 'HOD_APPROVED').length;
  const mentorApproved = requests.filter((r) => r.status === 'MENTOR_APPROVED').length;
  const rejected = requests.filter(
    (r) => r.status === 'MENTOR_REJECTED' || r.status === 'HOD_REJECTED'
  ).length;
  const pending = requests.filter((r) => r.status === 'PENDING').length;

  const approvalRate = total > 0 ? Math.round((hodApproved / total) * 100) : 0;

  // Breakdown by Department
  const deptCounts: Record<string, number> = {};
  requests.forEach((r) => {
    deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
  });

  // Breakdown by Category
  const typeCounts: Record<string, number> = {};
  requests.forEach((r) => {
    typeCounts[r.odType] = (typeCounts[r.odType] || 0) + 1;
  });

  if (isLoading) {
    return <Loader label="Computing institutional OD analytics..." />;
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">OD Analytics & Reports</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Institutional overview of OD request volumes, approval metrics, and departmental distributions.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sanction Rate</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{approvalRate}%</h3>
            <CheckCircle2 className="text-green-600 dark:text-green-400 w-6 h-6" />
          </div>
          <p className="text-[10px] text-gray-400">{hodApproved} sanctioned of {total} total</p>
        </Card>

        <Card className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pending Approvals</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-amber-500">{pending + mentorApproved}</h3>
            <Clock className="text-amber-500 w-6 h-6" />
          </div>
          <p className="text-[10px] text-gray-400">{pending} mentor + {mentorApproved} HOD</p>
        </Card>

        <Card className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Rejections</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{rejected}</h3>
            <XCircle className="text-red-600 dark:text-red-400 w-6 h-6" />
          </div>
          <p className="text-[10px] text-gray-400">Mentor & HOD rejections</p>
        </Card>

        <Card className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Volume</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[#0B426E] dark:text-blue-400">{total}</h3>
            <PieChart className="text-[#0B426E] dark:text-blue-400 w-6 h-6" />
          </div>
          <p className="text-[10px] text-gray-400">Across all departments</p>
        </Card>
      </div>

      {/* Visual Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Breakdown */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="text-[#0B426E] dark:text-blue-400 w-4 h-4" /> Requests by Department
          </h3>
          <div className="space-y-2.5">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-800 dark:text-gray-200">{dept}</span>
                    <span className="text-[#0B426E] dark:text-blue-300">{count} requests ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0B426E] dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OD Category Breakdown */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <PieChart className="text-[#0B426E] dark:text-blue-400 w-4 h-4" /> Requests by OD Category
          </h3>
          <div className="space-y-2.5">
            {Object.entries(typeCounts).map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-800 dark:text-gray-200">{cat}</span>
                    <span className="text-[#0B426E] dark:text-blue-300">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
