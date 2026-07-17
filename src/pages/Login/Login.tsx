import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { FaGraduationCap, FaGoogle } from 'react-icons/fa';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    // Mock authentication: route directly to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-55/40 dark:bg-zinc-950 flex flex-col justify-between items-center p-4">
      {/* Top spacer */}
      <div />

      {/* Main card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
        {/* Logo and title */}
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full">
            <FaGraduationCap className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 m-0">
              FX On-Duty Portal
            </h1>
            <p className="text-xs font-semibold text-gray-550 dark:text-zinc-400 uppercase tracking-widest mt-1">
              v2.0 College Management
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xs mx-auto">
          Sign in using your college Google Workspace account to apply for and manage On-Duty permissions.
        </p>

        {/* Button */}
        <div className="pt-2">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 font-bold flex items-center justify-center gap-2"
          >
            <FaGoogle />
            Sign in with Google
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 dark:text-zinc-600">
        <p>© 2026 Francis Xavier Engineering College. All rights reserved.</p>
        <p className="mt-1 font-medium">Developed by the FX OD Development Team</p>
      </footer>
    </div>
  );
};
