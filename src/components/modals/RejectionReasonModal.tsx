import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { rejectionReasonSchema, type RejectionReasonFormData } from '../../schemas/odSchema';

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title?: string;
  isSubmitting?: boolean;
}

export const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Specify Rejection Reason',
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectionReasonFormData>({
    resolver: zodResolver(rejectionReasonSchema),
    defaultValues: { reason: '' },
  });

  const handleFormSubmit = (data: RejectionReasonFormData) => {
    onSubmit(data.reason);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Reason for Rejection <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <textarea
            {...register('reason')}
            rows={4}
            placeholder="Provide a clear institutional reason for rejecting this OD request (e.g. low attendance, duplicate date)..."
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
          />
          {errors.reason && (
            <p className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1">
              {errors.reason.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" isLoading={isSubmitting}>
            Confirm Rejection
          </Button>
        </div>
      </form>
    </Modal>
  );
};
