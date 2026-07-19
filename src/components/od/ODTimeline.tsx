import React from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle, FaUser } from 'react-icons/fa';
import type { TimelineEntry } from '../../types/od';

interface ODTimelineProps {
  timeline: TimelineEntry[];
}

export const ODTimeline: React.FC<ODTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <p className="text-xs text-slate-500 italic">No timeline records available.</p>;
  }

  return (
    <div className="relative pl-6 border-l-2 border-slate-700/60 space-y-6 my-4">
      {timeline.map((entry) => {
        let Icon = FaClock;
        let iconBg = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';

        if (entry.action.toLowerCase().includes('approved') || entry.action.toLowerCase().includes('sanctioned')) {
          Icon = FaCheckCircle;
          iconBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
        } else if (entry.action.toLowerCase().includes('rejected')) {
          Icon = FaTimesCircle;
          iconBg = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
        }

        return (
          <div key={entry.id} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={`absolute -left-[35px] top-0 h-7 w-7 rounded-full border flex items-center justify-center ${iconBg} shadow-sm backdrop-blur-sm`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Entry Content */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-1 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{entry.action}</span>
                <span className="text-[10px] font-medium text-slate-400">
                  {new Date(entry.timestamp as string).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <FaUser className="w-2.5 h-2.5 text-indigo-400" />
                <span>
                  {entry.performedBy.name} ({entry.performedBy.role})
                </span>
              </div>
              {entry.details && (
                <p className="text-xs text-slate-400 pt-1 border-t border-slate-700/40 mt-1 leading-relaxed">
                  {entry.details}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
