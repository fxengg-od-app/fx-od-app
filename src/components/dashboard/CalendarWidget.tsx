import React, { useState } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import type { ODRequest } from '../../context/AppContext';

interface CalendarWidgetProps {
  data?: ODRequest[];
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ data, selectedDate, onSelectDate }) => {
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const { requests } = useApp();
  const displayRequests = data || requests;

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const today = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getODCountForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return displayRequests.filter((r) => {
      if (r.finalStatus !== 'APPROVED') return false;
      if (r.dateType === 'SINGLE') return r.startDate === dateStr;
      const start = new Date(r.startDate);
      const end = r.endDate ? new Date(r.endDate) : start;
      const current = new Date(dateStr);
      return current >= start && current <= end;
    }).length;
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const odCount = getODCountForDay(d);

    days.push(
      <button
        key={d}
        type="button"
        onClick={() => onSelectDate?.(dateStr)}
        className={`h-10 w-full relative flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all hover:bg-blue-50 ${
          isSelected
            ? 'bg-fx-blue text-white hover:bg-blue-600 ring-2 ring-fx-blue ring-offset-1'
            : isToday
            ? 'bg-blue-100 text-fx-blue hover:bg-blue-200'
            : 'text-gray-700'
        }`}
      >
        <span>{d}</span>
        {odCount > 0 && (
          <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`} />
        )}
      </button>
    );
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            OD Calendar
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {selectedDate
              ? `Viewing: ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : 'Click any date to filter records'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-500 font-bold text-xs"
          >
            ‹
          </button>
          <span className="text-xs font-bold text-gray-700 px-2">{monthNames[month]} {year}</span>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-500 font-bold text-xs"
          >
            ›
          </button>
          {selectedDate && (
            <button
              onClick={() => onSelectDate?.('')}
              className="ml-1 text-[10px] font-semibold text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-50 cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {weekdays.map((w) => (
          <div key={w} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{w}</div>
        ))}
        {days}
      </div>
    </Card>
  );
};
