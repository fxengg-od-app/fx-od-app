import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ODForm } from '../../components/forms/ODForm';


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
    <div className="flex flex-col items-center justify-start min-h-[80vh] pt-10">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center relative">
        <h1 className="text-lg font-medium text-gray-700 mb-6">
          Leave Application
        </h1>
        <div className="absolute top-0 right-0 m-4">
          <button 
            onClick={handleCancel}
            className="bg-red-500 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 hover:bg-red-600 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Cancel
          </button>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-semibold flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Submitted successfully!
          </div>
        )}

        <ODForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
};
