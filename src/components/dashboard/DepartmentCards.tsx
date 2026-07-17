import React from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';

interface DepartmentCardsProps {
  selectedDept: string | null;
  onSelectDept: (dept: string | null) => void;
}

export const DepartmentCards: React.FC<DepartmentCardsProps> = ({
  selectedDept,
  onSelectDept,
}) => {
  const { requests } = useApp();

  const depts = [
    { code: 'CSE', name: 'Computer Science' },
    { code: 'ECE', name: 'Electronics & Comm.' },
    { code: 'EEE', name: 'Electrical & Electronics' },
    { code: 'MECH', name: 'Mechanical Engg.' },
    { code: 'CIVIL', name: 'Civil Engineering' },
    { code: 'AIDS', name: 'Artificial Intelligence' }
  ];

  const getODCountForDept = (deptCode: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return requests.filter(
      (r) =>
        r.department === deptCode &&
        r.finalStatus === 'APPROVED' &&
        (r.startDate === todayStr || (r.endDate && todayStr >= r.startDate && todayStr <= r.endDate))
    ).length;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {depts.map((dept) => {
        const isActive = selectedDept === dept.code;
        const count = getODCountForDept(dept.code);

        return (
          <Card
            key={dept.code}
            onClick={() => onSelectDept(isActive ? null : dept.code)}
            className={`p-4 flex flex-col items-center justify-center text-center cursor-pointer border transition-all ${
              isActive
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-gray-100 dark:border-zinc-800'
            }`}
          >
            <span className={`text-lg font-extrabold ${isActive ? 'text-blue-600' : 'text-gray-900 dark:text-zinc-100'}`}>
              {dept.code}
            </span>
            <span className="text-[9px] font-semibold text-gray-450 dark:text-zinc-500 mt-0.5 truncate max-w-full">
              {dept.name}
            </span>
            <span className={`text-xs font-bold mt-2 px-2 py-0.5 rounded-full ${
              count > 0 ? 'bg-green-100 text-green-700 dark:bg-green-950/30' : 'bg-gray-100 text-gray-500 dark:bg-zinc-850'
            }`}>
              {count} Active
            </span>
          </Card>
        );
      })}
    </div>
  );
};
