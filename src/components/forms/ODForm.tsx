import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { TextArea } from '../common/TextArea';
import { useApp } from '../../context/AppContext';

interface ODFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ODForm: React.FC<ODFormProps> = ({ onSuccess, onCancel }) => {
  const { addRequest } = useApp();
  const [dateType, setDateType] = useState<'SINGLE' | 'MULTIPLE' | ''>('');
  
  const [description, setDescription] = useState('');
  const [faculty, setFaculty] = useState('');
  const [odType, setOdType] = useState<'Applied Lab' | 'Individual'>('Individual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!faculty.trim()) newErrors.faculty = 'Faculty In-Charge is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (dateType === 'MULTIPLE' && !endDate) {
      newErrors.endDate = 'End date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addRequest({
      registerNumber: '951221104001', // Mock log-in student register
      name: 'Arun Kumar K',
      year: 'III',
      section: 'A',
      department: 'CSE',
      dateType: dateType as 'SINGLE' | 'MULTIPLE',
      startDate,
      endDate: dateType === 'MULTIPLE' ? endDate : undefined,
      description,
      facultyInCharge: faculty,
      odType,
    });

    onSuccess();
  };

  return (
    <div className="space-y-6">
      {/* 1. Date Type Question */}
      <div className="bg-gray-55/60 dark:bg-zinc-900/60 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 text-left">
        <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 mb-3">
          Select OD Duration
        </h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="radio"
              name="dateType"
              checked={dateType === 'SINGLE'}
              onChange={() => {
                setDateType('SINGLE');
                setEndDate('');
              }}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            Single Day
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="radio"
              name="dateType"
              checked={dateType === 'MULTIPLE'}
              onChange={() => setDateType('MULTIPLE')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            Multiple Days
          </label>
        </div>
      </div>

      {/* 2. Main Form Fields (Unlocked only if duration is selected) */}
      <form
        onSubmit={handleSubmit}
        className={`space-y-5 transition-opacity duration-300 ${!dateType ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
      >
        <TextArea
          label="OD Description / Purpose"
          placeholder="e.g. Smart India Hackathon participation at IIT Madras"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          rows={3}
          disabled={!dateType}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Faculty In-Charge / Event Coordinator"
            placeholder="e.g. Dr. Premkumar"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            error={errors.faculty}
            disabled={!dateType}
          />
          <Select
            label="OD Type"
            options={[
              { label: 'Individual OD', value: 'Individual' },
              { label: 'Applied Lab OD (Group/Lab work)', value: 'Applied Lab' },
            ]}
            value={odType}
            onChange={(e) => setOdType(e.target.value as 'Applied Lab' | 'Individual')}
            disabled={!dateType}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={dateType === 'MULTIPLE' ? 'Start Date' : 'OD Date'}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={errors.startDate}
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            disabled={!dateType}
          />
          {dateType === 'MULTIPLE' && (
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={errors.endDate}
              min={startDate || new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              disabled={!dateType}
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!dateType}>
            Submit OD Request
          </Button>
        </div>
      </form>
    </div>
  );
};
