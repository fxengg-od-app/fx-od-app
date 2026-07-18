
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface ODFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MENTORS = [
  'Dr. Manohar E',
  'Mrs. P. Kavitha',
  'Mr. K. Suresh',
  'Dr. L. Priya',
  'Dr. S. Premkumar',
  'Mrs. R. Jeyanthi',
  'Dr. G. Rajkumar',
  'Mr. A. Albert',
  'Mr. B. Naveen',
];

export const ODForm: React.FC<ODFormProps> = ({ onSuccess, onCancel }) => {
  const { addRequest } = useApp();
  const [dateType, setDateType] = useState<'SINGLE' | 'MULTIPLE' | ''>('');
  const [mentorName, setMentorName] = useState('');
  const [description, setDescription] = useState('');
  const [faculty, setFaculty] = useState('');
  const [odType, setOdType] = useState<'Applied Lab' | 'Individual'>('Individual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!dateType) newErrors.dateType = 'Leave type is required';
    if (!mentorName) newErrors.mentorName = 'Mentor selection is required';
    if (!description.trim()) newErrors.description = 'Reason is required';
    if (!faculty.trim()) newErrors.faculty = 'Faculty In-Charge is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (dateType === 'MULTIPLE' && !endDate) newErrors.endDate = 'End date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addRequest({
      registerNumber: '951221104001',
      name: 'Arun Kumar K',
      year: 'III',
      section: 'A',
      department: 'CSE',
      mentorName,
      dateType: dateType as 'SINGLE' | 'MULTIPLE',
      startDate,
      endDate: dateType === 'MULTIPLE' ? endDate : undefined,
      description,
      facultyInCharge: faculty,
      odType,
    });

    onSuccess();
  };

  const duration = React.useMemo(() => {
    if (dateType === 'SINGLE' && startDate) return 1;
    if (dateType === 'MULTIPLE' && startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffDays = Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays + 1 : 0;
    }
    return 0;
  }, [startDate, endDate, dateType]);

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-fx-blue focus:ring-1 focus:ring-fx-blue/30 bg-white transition-all';
  const labelCls = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';
  const errorCls = 'text-red-500 text-xs mt-1';

  return (
    <div className="space-y-5 text-left">
      {/* Leave Type */}
      <div>
        <label className={labelCls}>Leave Type <span className="text-red-400">*</span></label>
        <select
          className={inputCls}
          value={dateType}
          onChange={(e) => {
            setDateType(e.target.value as any);
            if (e.target.value === 'SINGLE') setEndDate('');
            if (errors.dateType) setErrors(p => ({ ...p, dateType: '' }));
          }}
        >
          <option value="" disabled>Select type...</option>
          <option value="SINGLE">Single Day OD</option>
          <option value="MULTIPLE">Multiple Days OD</option>
        </select>
        {errors.dateType && <p className={errorCls}>{errors.dateType}</p>}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>From Date <span className="text-red-400">*</span></label>
          <input
            type="date"
            className={inputCls}
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); if (errors.startDate) setErrors(p => ({ ...p, startDate: '' })); }}
            disabled={!dateType}
          />
          {errors.startDate && <p className={errorCls}>{errors.startDate}</p>}
        </div>
        <div>
          <label className={labelCls}>To Date {dateType === 'MULTIPLE' && <span className="text-red-400">*</span>}</label>
          <input
            type="date"
            className={`${inputCls} disabled:bg-gray-50 disabled:cursor-not-allowed`}
            value={dateType === 'SINGLE' ? startDate : endDate}
            onChange={(e) => { setEndDate(e.target.value); if (errors.endDate) setErrors(p => ({ ...p, endDate: '' })); }}
            disabled={dateType !== 'MULTIPLE'}
            min={startDate}
          />
          {errors.endDate && <p className={errorCls}>{errors.endDate}</p>}
        </div>
      </div>

      {/* Duration indicator */}
      {duration > 0 && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <span className="text-[11px] font-semibold text-fx-blue uppercase tracking-wide">Duration:</span>
          <span className="text-sm font-bold text-fx-blue">{duration} day{duration > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Mentor */}
      <div>
        <label className={labelCls}>Select Mentor <span className="text-red-400">*</span></label>
        <select
          className={inputCls}
          value={mentorName}
          onChange={(e) => { setMentorName(e.target.value); if (errors.mentorName) setErrors(p => ({ ...p, mentorName: '' })); }}
          disabled={!dateType}
        >
          <option value="" disabled>Select your mentor...</option>
          {MENTORS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {errors.mentorName && <p className={errorCls}>{errors.mentorName}</p>}
      </div>

      {/* OD Type */}
      <div>
        <label className={labelCls}>OD Type <span className="text-red-400">*</span></label>
        <select
          className={inputCls}
          value={odType}
          onChange={(e) => setOdType(e.target.value as any)}
          disabled={!dateType}
        >
          <option value="Individual">Individual</option>
          <option value="Applied Lab">Applied Lab</option>
        </select>
      </div>

      {/* Faculty In-Charge */}
      <div>
        <label className={labelCls}>Faculty In-Charge <span className="text-red-400">*</span></label>
        <input
          type="text"
          className={inputCls}
          placeholder="e.g. Dr. S. Premkumar"
          value={faculty}
          onChange={(e) => { setFaculty(e.target.value); if (errors.faculty) setErrors(p => ({ ...p, faculty: '' })); }}
          disabled={!dateType}
        />
        {errors.faculty && <p className={errorCls}>{errors.faculty}</p>}
      </div>

      {/* Reason */}
      <div>
        <label className={labelCls}>Reason / Event Description <span className="text-red-400">*</span></label>
        <textarea
          className={`${inputCls} resize-none`}
          placeholder="e.g. Smart India Hackathon 2026 Preliminary Round"
          value={description}
          onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(p => ({ ...p, description: '' })); }}
          rows={3}
          disabled={!dateType}
        />
        {errors.description && <p className={errorCls}>{errors.description}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!dateType}
          className="px-5 py-2 text-sm font-semibold text-white bg-fx-blue rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit OD Request
        </button>
      </div>
    </div>
  );
};
