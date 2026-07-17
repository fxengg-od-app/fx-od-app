export type UserRole = 'STUDENT' | 'MENTOR' | 'HOD' | 'ADMIN';

export const ROLES = {
  STUDENT: 'STUDENT' as UserRole,
  MENTOR: 'MENTOR' as UserRole,
  HOD: 'HOD' as UserRole,
  ADMIN: 'ADMIN' as UserRole,
} as const;
