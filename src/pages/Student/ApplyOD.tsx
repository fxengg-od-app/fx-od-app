import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Send, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCreateODMutation } from '../../hooks/useODRequests';
import { odRequestSchema, type ODRequestFormData } from '../../schemas/odSchema';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { TextArea } from '../../components/common/TextArea';

export const ApplyOD: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const createODMutation = useCreateODMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ODRequestFormData>({
    resolver: zodResolver(odRequestSchema),
    defaultValues: {
      dateType: 'SINGLE',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      description: '',
      facultyInCharge: '',
      odType: 'Individual',
      proofDocumentUrl: '',
    },
  });

  const dateType = watch('dateType');

  const onSubmit = async (data: ODRequestFormData) => {
    if (!userProfile) return;
    try {
      await createODMutation.mutateAsync({
        dto: data,
        student: userProfile,
      });
      navigate('/student/requests');
    } catch (err) {
      console.error('Failed to submit OD application:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Send className="w-4 h-4 text-[#0B426E] dark:text-blue-400" /> Apply On-Duty (OD) Leave
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Submit OD request for faculty mentor review and department HOD sanction.
          </p>
        </div>
      </div>

      {/* Student Identity Card */}
      {userProfile && (
        <div className="p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-700 dark:text-gray-300 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#0B426E] text-white flex items-center justify-center font-bold shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{userProfile.displayName}</p>
              <p className="text-gray-500 dark:text-gray-400">Reg: {userProfile.registerNumber || '951221104000'} • Dept: {userProfile.department}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Assigned Mentor</span>
            <span className="font-medium text-[#0B426E] dark:text-blue-300">{userProfile.mentorName || 'Faculty Mentor'}</span>
          </div>
        </div>
      )}

      {/* Form Application - Mobile First Single Column Layout */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Date Duration Type"
            {...register('dateType')}
            options={[
              { value: 'SINGLE', label: 'Single Day OD' },
              { value: 'MULTIPLE', label: 'Multiple Days OD' },
            ]}
            error={errors.dateType?.message}
          />

          <Select
            label="OD Category"
            {...register('odType')}
            options={[
              { value: 'Individual', label: 'Individual Technical Event' },
              { value: 'Applied Lab', label: 'Applied Lab Training' },
              { value: 'Symposium', label: 'College Symposium' },
              { value: 'Sports', label: 'Sports Tournament' },
              { value: 'Workshop', label: 'Hands-on Workshop' },
              { value: 'Industrial Visit', label: 'Industrial Visit' },
              { value: 'Other', label: 'Other Official Activity' },
            ]}
            error={errors.odType?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            {...register('startDate')}
            error={errors.startDate?.message}
          />

          {dateType === 'MULTIPLE' && (
            <Input
              label="End Date"
              type="date"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          )}
        </div>

        <Input
          label="Faculty In Charge"
          placeholder="Name of coordinating faculty member"
          {...register('facultyInCharge')}
          error={errors.facultyInCharge?.message}
        />

        <Input
          label="Proof Document URL (Optional)"
          placeholder="https://drive.google.com/file/d/..."
          {...register('proofDocumentUrl')}
          error={errors.proofDocumentUrl?.message}
        />

        <TextArea
          label="Reason & Description of Activity"
          rows={3}
          placeholder="Describe the institutional purpose of the OD request, event details, venue location..."
          {...register('description')}
          error={errors.description?.message}
        />

        {createODMutation.isError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-700 dark:text-red-300 font-medium">
            {(createODMutation.error as Error).message}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={() => navigate('/student/requests')} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={createODMutation.isPending} className="w-full sm:w-auto">
            Submit OD Application
          </Button>
        </div>
      </form>
    </div>
  );
};
