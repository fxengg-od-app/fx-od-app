import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { AuditAction } from '../../types/audit';
import { sanitizeFirestoreData } from '../../utils/sanitize';

export const logAudit = async (
  action: AuditAction,
  performedBy: {
    uid: string;
    name: string;
    email: string;
    role: string;
  },
  details: Record<string, unknown> = {},
  targetResource?: { collection: string; id: string }
): Promise<string> => {
  try {
    const rawData = {
      action,
      performedBy,
      targetResource: targetResource || null,
      details,
      createdAt: serverTimestamp(),
    };
    const cleanData = sanitizeFirestoreData(rawData);

    const docRef = await addDoc(collection(db, 'audit_logs'), cleanData);
    return docRef.id;
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Audit logging is non-blocking to prevent UI disruption
    return '';
  }
};
