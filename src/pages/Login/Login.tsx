// ============================================================
//  src/pages/Login/Login.tsx
//  Two-step institutional sign-in (mock Google OAuth flow).
//
//  SWITCH TO REAL AUTH:
//    • Set VITE_APP_MODE=live in .env
//    • In handleAccountSelect, the signIn() call already goes
//      to the live backend — no component change needed.
//    • For real Google button: call signInWithGoogle(googleIdToken)
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaGoogle, FaLock } from 'react-icons/fa';
import { useApp } from '../../context/AppContext';
import {
  getMockAccounts,
  signIn,
  isValidInstitutionalEmail,
} from '../../services/authService';
import type { AuthUser } from '../../services/authService';

type Step = 'email' | 'pick-account' | 'signing-in' | 'error';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentRole, setCurrentUser } = useApp();

  const [step, setStep]     = useState<Step>('email');
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');

  const allAccounts: AuthUser[] = getMockAccounts();

  // ── Step 1: validate domain, advance to account picker ──────
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email address is required.'); return; }
    if (!isValidInstitutionalEmail(email)) {
      setError(
        'Access restricted. Only institutional emails are accepted ' +
        '(@francisxavier.ac.in or @scad.ac.in).'
      );
      return;
    }
    setError('');
    setStep('pick-account');
  };

  // ── Step 2: pick a demo account → sign in ───────────────────
  const handleAccountSelect = async (selectedEmail: string) => {
    setStep('signing-in');
    try {
      const user = await signIn(selectedEmail); // → authService (mock or live)
      setCurrentUser(user);
      setCurrentRole(user.role);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed.';
      setError(msg);
      setStep('error');
    }
  };

  const roleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':  return 'bg-purple-50 text-purple-700';
      case 'HOD':    return 'bg-orange-50 text-orange-700';
      case 'MENTOR': return 'bg-green-50  text-green-700';
      default:       return 'bg-blue-50   text-fx-blue';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col justify-between items-center p-4">
      <div />

      <div className="w-full max-w-md space-y-4">
        {/* Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-fx-blue rounded-2xl shadow-lg mb-3">
            <FaGraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Francis Xavier Engineering College
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-widest font-semibold">
            On-Duty Management System — v2.0
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

          {/* ── Step 1: Email entry ──────────────────────────── */}
          {step === 'email' && (
            <div className="p-8 space-y-5">
              <div className="text-center">
                <h2 className="text-base font-bold text-gray-800">Sign in to continue</h2>
                <p className="text-xs text-gray-500 mt-1">Use your college institutional email to proceed.</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    placeholder="yourname@francisxavier.ac.in"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-fx-blue focus:ring-2 focus:ring-fx-blue/20 transition-all"
                    value={email}
                    autoFocus
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  />
                  {error && (
                    <div className="flex items-start gap-2 mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <FaLock className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-red-600 text-xs font-medium">{error}</p>
                    </div>
                  )}
                </div>

                <button
                  id="btn-continue-google"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow transition-all"
                >
                  <FaGoogle className="h-4 w-4 text-red-500" />
                  Continue with Google
                </button>
              </form>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] text-gray-400 font-medium">Authorised Personnel Only</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Demo hint */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-1">
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">Demo mode</p>
                <p className="text-[11px] text-blue-600">
                  Enter any email ending with <span className="font-mono font-bold">@francisxavier.ac.in</span>{' '}
                  or <span className="font-mono font-bold">@scad.ac.in</span>, then pick your role.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Account picker ───────────────────────── */}
          {step === 'pick-account' && (
            <div className="p-0">
              <div className="px-8 pt-7 pb-5 text-center border-b border-gray-100">
                <FaGoogle className="h-7 w-7 mx-auto text-blue-500 mb-3" />
                <h2 className="text-base font-semibold text-gray-800">Choose an account</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  to continue to <span className="font-medium">FX OD Portal</span>
                </p>
              </div>

              <div className="py-2 max-h-80 overflow-y-auto divide-y divide-gray-50">
                {allAccounts.map((user) => (
                  <button
                    key={user.email}
                    id={`account-${user.role.toLowerCase()}`}
                    onClick={() => handleAccountSelect(user.email)}
                    className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-fx-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${roleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>

              <div className="px-8 py-4 border-t border-gray-100">
                <button
                  onClick={() => { setStep('email'); setError(''); }}
                  className="w-full text-center text-xs text-fx-blue font-semibold hover:underline cursor-pointer"
                >
                  ← Use a different account
                </button>
              </div>
            </div>
          )}

          {/* ── Signing in loader ────────────────────────────── */}
          {step === 'signing-in' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-fx-blue border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600 font-medium">Signing you in…</p>
            </div>
          )}

          {/* ── Error ────────────────────────────────────────── */}
          {step === 'error' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <FaLock className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Access Denied</h2>
                <p className="text-xs text-red-600 mt-2 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
              </div>
              <button
                onClick={() => { setStep('email'); setEmail(''); setError(''); }}
                className="w-full py-2.5 bg-fx-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 pb-2">
        <p>© 2026 Francis Xavier Engineering College. All rights reserved.</p>
        <p className="mt-0.5">Secured via Google OAuth 2.0 • Role-Based Access Control (RBAC)</p>
      </footer>
    </div>
  );
};
