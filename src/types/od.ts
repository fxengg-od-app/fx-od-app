import type { Timestamp } from 'firebase/firestore';
import type { UserSnapshot, Department } from './user';

export type ODStatus =
  | 'PENDING'
  | 'MENTOR_APPROVED'
  | 'MENTOR_REJECTED'
  | 'HOD_APPROVED'
  | 'HOD_REJECTED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export type ODType =
  | 'Applied Lab'
  | 'Individual'
  | 'Symposium'
  | 'Sports'
  | 'Workshop'
  | 'Industrial Visit'
  | 'Other';

export interface ApprovalSnapshot {
  status: 'APPROVED' | 'REJECTED';
  approverUid: string;
  approverName: string;
  approverEmail: string;
  timestamp: string | Timestamp;
  rejectionReason?: string;
}

export interface TimelineEntry {
  id: string;
  action: string;
  performedBy: {
    uid: string;
    name: string;
    role: string;
  };
  timestamp: string | Timestamp;
  details?: string;
}

export interface ODRequest {
  id: string;
  requestNumber: string;
  studentUid: string;
  studentSnapshot: UserSnapshot;
  assignedMentorUid: string;
  assignedMentorSnapshot: UserSnapshot;
  department: Department;
  dateType: 'SINGLE' | 'MULTIPLE';
  startDate: string;
  endDate?: string;
  totalDays: number;
  description: string;
  facultyInCharge: string;
  odType: ODType;
  proofDocumentUrl?: string;
  status: ODStatus;

  // Specific Mentor Approval Fields
  mentorStatus?: 'APPROVED' | 'REJECTED';
  mentorApprovedBy?: { uid: string; name: string; email: string };
  mentorApprovedAt?: string;
  mentorRejectedBy?: { uid: string; name: string; email: string };
  mentorRejectedAt?: string;
  mentorRemarks?: string;
  mentorReview?: ApprovalSnapshot;

  // Specific HOD Approval Fields
  hodStatus?: 'APPROVED' | 'REJECTED';
  hodApprovedBy?: { uid: string; name: string; email: string };
  hodApprovedAt?: string;
  hodRejectedBy?: { uid: string; name: string; email: string };
  hodRejectedAt?: string;
  hodRemarks?: string;
  hodReview?: ApprovalSnapshot;

  timeline: TimelineEntry[];
  isDeleted: boolean;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateODDTO {
  dateType: 'SINGLE' | 'MULTIPLE';
  startDate: string;
  endDate?: string;
  description: string;
  facultyInCharge: string;
  odType: ODType;
  proofDocumentUrl?: string;
}
