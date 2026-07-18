import React from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import type { ODRequest } from '../../context/AppContext';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

interface RecentActivityProps {
  data?: ODRequest[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ data }) => {
  const { requests } = useApp();
  const displayRequests = data || requests;

  // Show top 4 requests based on applied date/id
  const recentItems = [...displayRequests]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 4);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <FaTimesCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FaHourglassHalf className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <Card className="p-5 text-left">
      <h3 className="text-sm font-bold text-gray-900 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {recentItems.length === 0 ? (
          <p className="text-xs text-gray-500">No recent activities.</p>
        ) : (
          recentItems.map((item) => (
            <div key={item.id} className="flex gap-3 text-xs leading-normal">
              <div className="flex-shrink-0 mt-0.5">{getStatusIcon(item.finalStatus)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">
                  {item.name} ({item.department})
                </p>
                <p className="text-gray-500 truncate text-[11px] mt-0.5">
                  {item.description}
                </p>
                <span className="text-[10px] text-gray-400 font-medium block mt-1">
                  {item.finalStatus} • Applied {item.appliedDate}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
