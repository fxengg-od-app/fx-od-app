import type { Timestamp } from 'firebase/firestore';

export type UserRole =
  | 'STUDENT'
  | 'MENTOR'
  | 'HOD'
  | 'PRINCIPAL'
  | 'ACADEMIC_COORDINATOR'
  | 'SUPER_ADMIN';

export type Department =
  | 'CSE'
  | 'ECE'
  | 'EEE'
  | 'MECH'
  | 'CIVIL'
  | 'IT'
  | 'AI_DS'
  | 'ALL';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  department: Department;
  section?: string;
  year?: 'I' | 'II' | 'III' | 'IV';
  registerNumber?: string;
  mentorUid?: string;
  mentorName?: string;
  mentorEmail?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  createdBy?: string;
  updatedBy?: string;
}

export interface UserSnapshot {
  uid: string;
  name: string;
  email: string;
  department?: Department;
  registerNumber?: string;
  year?: string;
  section?: string;
}

export interface ImportedUserRecord {
  id?: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: Department;
  registerNumber?: string;
  year?: 'I' | 'II' | 'III' | 'IV';
  section?: string;
  mentorEmail?: string;
  isLinked: boolean;
  linkedUid?: string;
  createdAt?: Timestamp | string;
}
