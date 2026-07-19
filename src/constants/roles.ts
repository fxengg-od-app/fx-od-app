import type { UserRole } from '../types/user';

export const ROLES: Record<UserRole, UserRole> = {
  STUDENT: 'STUDENT',
  MENTOR: 'MENTOR',
  HOD: 'HOD',
  PRINCIPAL: 'PRINCIPAL',
  ACADEMIC_COORDINATOR: 'ACADEMIC_COORDINATOR',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: 'Student',
  MENTOR: 'Faculty Mentor',
  HOD: 'Head of Department (HOD)',
  PRINCIPAL: 'Principal',
  ACADEMIC_COORDINATOR: 'Academic Coordinator',
  SUPER_ADMIN: 'Super Administrator',
};

export const DEPARTMENTS = [
  'CSE',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'IT',
  'AI_DS',
] as const;
