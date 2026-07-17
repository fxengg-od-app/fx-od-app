import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ODForm } from '../../components/forms/ODForm';
import { Card } from '../../components/common/Card';

export const ApplyOD: React.FC = () => {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSuccess = () => {
    setSuccessMsg(true);
    setTimeout(() => {
      navigate('/student/requests');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 m-0">
          Apply On-Duty (OD)
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Submit a new request for academic or extra-curricular On-Duty permission.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50 rounded-xl text-sm font-semibold flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          OD application submitted successfully! Redirecting to requests portal...
        </div>
      )}

      <Card className="p-6">
        <ODForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </Card>
    </div>
  );
};
