import type { Timestamp } from 'firebase/firestore';

export type NotificationType =
  | 'OD_SUBMITTED'
  | 'OD_MENTOR_APPROVED'
  | 'OD_MENTOR_REJECTED'
  | 'OD_HOD_APPROVED'
  | 'OD_HOD_REJECTED'
  | 'SYSTEM';

export interface SystemNotification {
  id: string;
  recipientUid: string;
  sender: {
    uid: string;
    name: string;
    role: string;
  };
  title: string;
  message: string;
  type?: NotificationType | string;
  referenceId?: string;
  route?: string;
  navigationTarget?: string;
  read: boolean;
  createdAt: Timestamp | string | Date | number | null;
}
