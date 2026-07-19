import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Login: React.FC = () => {
  const { loginWithGoogle, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accessDeniedError, setAccessDeniedError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setLoading(true);
    setAccessDeniedError(null);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication Failed';
      setAccessDeniedError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0F172A] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 rounded-lg shadow-md">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-[#0B426E] flex items-center justify-center text-white font-bold shadow-xs">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Francis Xavier Engineering College
            </h2>
            <p className="text-xs text-[#0B426E] dark:text-blue-400 font-semibold mt-0.5">
              Institutional OD Management System v2.0
            </p>
          </div>
        </div>

        {/* Access Denied Banner */}
        {(accessDeniedError || authError) && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md space-y-1 text-red-700 dark:text-red-300">
            <div className="flex items-center gap-1.5 font-semibold text-xs">
              <Lock className="w-4 h-4 text-red-600" />
              <span>Institutional Authorization Error</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
              {accessDeniedError || authError}
            </p>
          </div>
        )}

        {/* Login Form Action */}
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Sign in using your official institutional Google Workspace account.
            </p>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-[#0B426E] hover:bg-[#083356] text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Google Account'}</span>
          </button>
        </div>

        {/* Footer Security Badge */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 text-center flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
          <span>Role-Based Institutional Access Control</span>
        </div>
      </div>
    </div>
  );
};
