import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { TextArea } from '../common/TextArea';
import { Button } from '../common/Button';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    setError('');
    onSubmit(reason);
    setReason('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject OD Request">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <TextArea
          label="Reason for Rejection"
          placeholder="e.g. Incomplete details, attendance too low, etc."
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (e.target.value.trim()) setError('');
          }}
          error={error}
          rows={4}
          required
        />
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger">
            Confirm Rejection
          </Button>
        </div>
      </form>
    </Modal>
  );
};
