// ============================================================
//  src/services/authService.ts
//  Authentication service.
//
//  HOW TO SWITCH TO REAL BACKEND:
//    1. Set VITE_APP_MODE=live in .env
//    2. Implement the "live" branches below to call your API
//    3. Return the same AuthUser shape — nothing else changes
// ============================================================

import { IS_MOCK } from '../config';
import apiClient from './apiClient';
import type { UserRole } from '../constants/roles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  registerNumber?: string; // students only
  avatarUrl?: string;
}

// ── Mock database (used when VITE_APP_MODE=mock) ─────────────
const MOCK_USERS: Record<string, AuthUser> = {
  'student@francisxavier.ac.in': {
    id: 'u001', name: 'Arun Kumar K',      email: 'student@francisxavier.ac.in',
    role: 'STUDENT', department: 'CSE',    registerNumber: '951221104001',
  },
  'student@scad.ac.in': {
    id: 'u002', name: 'Sam Jeyaseelan A',  email: 'student@scad.ac.in',
    role: 'STUDENT', department: 'CSE',    registerNumber: '951221104002',
  },
  'mentor@francisxavier.ac.in': {
    id: 'u003', name: 'Dr. Manohar E',     email: 'mentor@francisxavier.ac.in',
    role: 'MENTOR', department: 'CSE',
  },
  'mentor@scad.ac.in': {
    id: 'u004', name: 'Dr. Premkumar S',   email: 'mentor@scad.ac.in',
    role: 'MENTOR', department: 'ECE',
  },
  'hod@francisxavier.ac.in': {
    id: 'u005', name: 'Dr. R. Jayakumar', email: 'hod@francisxavier.ac.in',
    role: 'HOD', department: 'CSE',
  },
  'hod@scad.ac.in': {
    id: 'u006', name: 'Dr. P. Sivakumar', email: 'hod@scad.ac.in',
    role: 'HOD', department: 'ECE',
  },
  'admin@francisxavier.ac.in': {
    id: 'u007', name: 'Principal',          email: 'admin@francisxavier.ac.in',
    role: 'ADMIN', department: 'Administration',
  },
};

export const VALID_DOMAINS = ['@francisxavier.ac.in', '@scad.ac.in'];

/**
 * Validate that the email belongs to a permitted institutional domain.
 */
export function isValidInstitutionalEmail(email: string): boolean {
  return VALID_DOMAINS.some((d) => email.toLowerCase().endsWith(d));
}

/**
 * Returns all available demo accounts (mock mode only).
 * In live mode, replace with a paginated user-search endpoint.
 */
export function getMockAccounts(): AuthUser[] {
  return Object.values(MOCK_USERS);
}

/**
 * Sign in with email (mock) or Google ID token (live).
 *
 * MOCK  → instant lookup in MOCK_USERS, stores user in localStorage
 * LIVE  → POST /auth/login with { email, googleIdToken }
 *          expects { token: string, user: AuthUser }
 */
export async function signIn(email: string): Promise<AuthUser> {
  if (IS_MOCK) {
    const user = MOCK_USERS[email];
    if (!user) throw new Error('User not found in demo database.');
    localStorage.setItem('auth_token', `mock-jwt-${user.id}`);
    localStorage.setItem('auth_user', JSON.stringify(user));
    return user;
  }

  // ── LIVE implementation ───────────────────────────────────
  // const { data } = await apiClient.post<{ token: string; user: AuthUser }>('/auth/login', { email });
  // localStorage.setItem('auth_token', data.token);
  // localStorage.setItem('auth_user', JSON.stringify(data.user));
  // return data.user;
  throw new Error('Live auth not yet configured. Set VITE_APP_MODE=mock.');
}

/**
 * Sign in with Google OAuth token (live only).
 * Call this after receiving `credential` from Google Identity Services.
 */
export async function signInWithGoogle(googleIdToken: string): Promise<AuthUser> {
  if (IS_MOCK) throw new Error('Google OAuth requires live mode.');

  const { data } = await apiClient.post<{ token: string; user: AuthUser }>(
    '/auth/google',
    { idToken: googleIdToken }
  );
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('auth_user', JSON.stringify(data.user));
  return data.user;
}

/**
 * Retrieve the currently authenticated user from storage.
 */
export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; }
  catch { return null; }
}

/**
 * Sign out — clears storage. Add a backend call if needed.
 */
export async function signOut(): Promise<void> {
  if (!IS_MOCK) {
    // await apiClient.post('/auth/logout');
  }
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}
