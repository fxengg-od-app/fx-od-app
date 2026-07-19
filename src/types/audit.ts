import type { Timestamp } from 'firebase/firestore';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'LOGIN_ACCESS_DENIED'
  | 'OD_CREATED'
  | 'MENTOR_APPROVED'
  | 'MENTOR_REJECTED'
  | 'HOD_APPROVED'
  | 'HOD_REJECTED'
  | 'BULK_HOD_APPROVED'
  | 'BULK_HOD_REJECTED'
  | 'ROLE_CHANGED'
  | 'MENTOR_REASSIGNED'
  | 'USER_DISABLED'
  | 'USER_CREATED'
  | 'USER_UPDATED';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  performedBy: {
    uid: string;
    name: string;
    email: string;
    role: string;
  };
  targetResource?: {
    collection: string;
    id: string;
  };
  details: Record<string, unknown>;
  createdAt: Timestamp | string;
}
