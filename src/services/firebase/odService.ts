import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type {
  ODRequest,
  CreateODDTO,
  TimelineEntry,
  ApprovalSnapshot,
  ODStatus,
} from '../../types/od';
import type { UserProfile, Department } from '../../types/user';
import { logAudit } from './auditService';
import { sendNotification } from './notificationService';
import { fetchHODsByDepartment } from './userService';
import { sanitizeFirestoreData } from '../../utils/sanitize';
import { debugLogger } from '../../utils/debugLogger';

// Helper to calculate total calendar days between two dates inclusive
const calculateTotalDays = (startDateStr: string, endDateStr?: string): number => {
  if (!endDateStr || startDateStr === endDateStr) return 1;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
};

// Generate unique sequential style request number
const generateRequestNumber = (): string => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `OD-${year}-${random}`;
};

export const createODRequest = async (
  dto: CreateODDTO,
  student: UserProfile
): Promise<string> => {
  debugLogger.groupStart('createODRequest: Submitting New OD', {
    currentUser: { uid: student.uid, name: student.displayName, role: student.role, email: student.email },
    action: 'OD_SUBMIT',
    details: { dto },
  });

  try {
    // Backend Date Validation (Today to Next 60 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(dto.startDate);
    start.setHours(0, 0, 0, 0);
    if (start < today) {
      throw new Error('OD start date cannot be in the past.');
    }

    const max60Days = new Date();
    max60Days.setDate(max60Days.getDate() + 60);
    max60Days.setHours(23, 59, 59, 999);
    if (start > max60Days) {
      throw new Error('OD start date cannot be more than 60 calendar days in advance.');
    }

    let mentorUid = student.mentorUid;
    let mentorName = student.mentorName || 'Faculty Mentor';
    let mentorEmail = student.mentorEmail;

    debugLogger.step('Checking Mentor Assignment', { mentorUid, mentorEmail });

    // Dynamic Lookup by mentorEmail if mentorUid is not yet populated
    if (!mentorUid && mentorEmail) {
      const mentorQ = query(
        collection(db, 'users'),
        where('email', '==', mentorEmail.toLowerCase()),
        where('isDeleted', '==', false)
      );
      const mentorSnap = await getDocs(mentorQ);
      if (!mentorSnap.empty) {
        const mProfile = mentorSnap.docs[0].data() as UserProfile;
        mentorUid = mProfile.uid;
        mentorName = mProfile.displayName;
        debugLogger.step('Resolved Mentor from Email Lookup', { mentorUid, mentorName });
      }
    }

    const totalDays = calculateTotalDays(dto.startDate, dto.endDate);
    const requestNumber = generateRequestNumber();
    const now = new Date().toISOString();

    const initialTimeline: TimelineEntry = {
      id: `tl-${Date.now()}`,
      action: 'OD Request Submitted',
      performedBy: {
        uid: student.uid,
        name: student.displayName,
        role: student.role,
      },
      timestamp: now,
      details: `Applied for ${totalDays} day(s) ${dto.odType} (${dto.startDate}${dto.endDate ? ' to ' + dto.endDate : ''})`,
    };

    const rawODData: Record<string, unknown> = {
      requestNumber,
      studentUid: student.uid,
      studentSnapshot: {
        uid: student.uid,
        name: student.displayName,
        email: student.email,
        department: student.department,
        registerNumber: student.registerNumber || 'N/A',
        year: student.year || 'N/A',
        section: student.section || 'N/A',
      },
      assignedMentorUid: mentorUid || null,
      assignedMentorSnapshot: {
        uid: mentorUid || null,
        name: mentorName,
        email: mentorEmail || 'mentor@institution.edu',
      },
      department: student.department,
      dateType: dto.dateType,
      startDate: dto.startDate,
      endDate: dto.endDate || null,
      totalDays,
      description: dto.description,
      facultyInCharge: dto.facultyInCharge,
      odType: dto.odType,
      proofDocumentUrl: dto.proofDocumentUrl || null,
      status: 'PENDING',
      timeline: [initialTimeline],
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: student.uid,
      updatedBy: student.uid,
    };

    const cleanData = sanitizeFirestoreData(rawODData);
    debugLogger.step('Writing to Firestore od_requests', cleanData);

    const docRef = await addDoc(collection(db, 'od_requests'), cleanData);
    debugLogger.step('Firestore Write Succeeded', { docId: docRef.id });

    // 1. Audit Log
    await logAudit(
      'OD_CREATED',
      {
        uid: student.uid,
        name: student.displayName,
        email: student.email,
        role: student.role,
      },
      { requestNumber, odType: dto.odType, totalDays },
      { collection: 'od_requests', id: docRef.id }
    );
    debugLogger.step('Audit Log Created');

    // 2. Notification to Mentor (if mentorUid is available)
    if (mentorUid) {
      await sendNotification(
        mentorUid,
        { uid: student.uid, name: student.displayName, role: student.role },
        'New OD Approval Required',
        `${student.displayName} submitted OD Request ${requestNumber} for ${dto.startDate}.`,
        `/mentor/pending?highlight=${docRef.id}`,
        'OD_SUBMITTED',
        docRef.id
      );
      debugLogger.step('Mentor Notification Sent', { recipientUid: mentorUid });
    }

    debugLogger.success(`OD Request ${requestNumber} created successfully`, { docId: docRef.id });
    return docRef.id;
  } catch (error) {
    debugLogger.error('createODRequest', error);
    throw error;
  }
};

export const mentorReviewODRequest = async (
  odId: string,
  decision: 'APPROVED' | 'REJECTED',
  mentor: UserProfile,
  rejectionReason?: string
): Promise<void> => {
  debugLogger.groupStart('mentorReviewODRequest: Reviewing OD', {
    currentUser: { uid: mentor.uid, name: mentor.displayName, role: mentor.role, email: mentor.email },
    odId,
    action: decision,
    details: { rejectionReason },
  });

  try {
    debugLogger.step('Fetching OD Document from Firestore');
    const odRef = doc(db, 'od_requests', odId);
    const snap = await getDoc(odRef);

    if (!snap.exists()) {
      const err = new Error(`OD Request ${odId} not found in Firestore`);
      debugLogger.error('mentorReviewODRequest', err, odId);
      throw err;
    }

    const od = snap.data() as ODRequest;
    debugLogger.step('OD Document Loaded', { requestNumber: od.requestNumber, currentStatus: od.status });

    const now = new Date().toISOString();

    // Rejection reason MUST ONLY exist when decision == 'REJECTED'
    const reviewSnapshot: ApprovalSnapshot = {
      status: decision,
      approverUid: mentor.uid,
      approverName: mentor.displayName,
      approverEmail: mentor.email,
      timestamp: now,
      ...(decision === 'REJECTED' && rejectionReason ? { rejectionReason } : {}),
    };

    const newStatus = decision === 'APPROVED' ? 'MENTOR_APPROVED' : 'MENTOR_REJECTED';

    const timelineEntry: TimelineEntry = {
      id: `tl-${Date.now()}`,
      action: decision === 'APPROVED' ? 'Mentor Approved OD' : 'Mentor Rejected OD',
      performedBy: {
        uid: mentor.uid,
        name: mentor.displayName,
        role: mentor.role,
      },
      timestamp: now,
      details: decision === 'REJECTED' ? `Reason: ${rejectionReason}` : 'Approved by Faculty Mentor',
    };

    const rawUpdateData: Record<string, unknown> = {
      status: newStatus,
      mentorStatus: decision,
      mentorApprovedBy: decision === 'APPROVED' ? { uid: mentor.uid, name: mentor.displayName, email: mentor.email } : null,
      mentorApprovedAt: decision === 'APPROVED' ? now : null,
      mentorRejectedBy: decision === 'REJECTED' ? { uid: mentor.uid, name: mentor.displayName, email: mentor.email } : null,
      mentorRejectedAt: decision === 'REJECTED' ? now : null,
      ...(decision === 'REJECTED' && rejectionReason ? { mentorRemarks: rejectionReason } : {}),
      mentorReview: reviewSnapshot,
      timeline: arrayUnion(timelineEntry),
      updatedAt: serverTimestamp(),
      updatedBy: mentor.uid,
    };

    const updateData = sanitizeFirestoreData(rawUpdateData);

    debugLogger.step('Updating Firestore OD Document', updateData);
    await updateDoc(odRef, updateData);
    debugLogger.step('Firestore Document Updated Successfully');

    // Audit log
    await logAudit(
      decision === 'APPROVED' ? 'MENTOR_APPROVED' : 'MENTOR_REJECTED',
      { uid: mentor.uid, name: mentor.displayName, email: mentor.email, role: mentor.role },
      { odId, requestNumber: od.requestNumber, rejectionReason: decision === 'REJECTED' ? rejectionReason : undefined },
      { collection: 'od_requests', id: odId }
    );
    debugLogger.step('Audit Log Written');

    if (decision === 'APPROVED') {
      // Notify Student
      await sendNotification(
        od.studentUid,
        { uid: mentor.uid, name: mentor.displayName, role: mentor.role },
        'OD Request Approved by Mentor',
        `Your OD Request ${od.requestNumber} was approved by your mentor and is now pending HOD sanction.`,
        `/student/requests?highlight=${odId}`,
        'OD_MENTOR_APPROVED',
        odId
      );
      debugLogger.step('Student Notification Sent', { studentUid: od.studentUid });

      // Notify HOD(s)
      const hods = await fetchHODsByDepartment(od.department);
      debugLogger.step('Fetched Department HODs for Notification', { hodCount: hods.length });
      for (const hod of hods) {
        await sendNotification(
          hod.uid,
          { uid: mentor.uid, name: mentor.displayName, role: mentor.role },
          'Pending HOD Approval Required',
          `OD Request ${od.requestNumber} (${od.studentSnapshot.name}) was approved by mentor and requires HOD sanction.`,
          `/hod/pending?highlight=${odId}`,
          'OD_SUBMITTED',
          odId
        );
      }
    } else {
      // Notify Student of rejection
      await sendNotification(
        od.studentUid,
        { uid: mentor.uid, name: mentor.displayName, role: mentor.role },
        'OD Request Rejected by Mentor',
        `Your OD Request ${od.requestNumber} was rejected by your mentor. Reason: ${rejectionReason || 'No reason specified'}`,
        `/student/requests?highlight=${odId}`,
        'OD_MENTOR_REJECTED',
        odId
      );
      debugLogger.step('Student Rejection Notification Sent');
    }

    debugLogger.success(`Mentor review for OD ${od.requestNumber} completed successfully as ${decision}`);
  } catch (error) {
    debugLogger.error('mentorReviewODRequest', error, odId);
    throw error;
  }
};

export const hodReviewODRequest = async (
  odId: string,
  decision: 'APPROVED' | 'REJECTED',
  hod: UserProfile,
  rejectionReason?: string
): Promise<void> => {
  debugLogger.groupStart('hodReviewODRequest: Reviewing OD', {
    currentUser: { uid: hod.uid, name: hod.displayName, role: hod.role, email: hod.email },
    odId,
    action: decision,
    details: { rejectionReason },
  });

  try {
    const odRef = doc(db, 'od_requests', odId);
    const snap = await getDoc(odRef);

    if (!snap.exists()) {
      const err = new Error(`OD Request ${odId} not found in Firestore`);
      debugLogger.error('hodReviewODRequest', err, odId);
      throw err;
    }

    const od = snap.data() as ODRequest;
    debugLogger.step('OD Document Loaded', { requestNumber: od.requestNumber, currentStatus: od.status });

    if (decision === 'APPROVED' && od.status !== 'MENTOR_APPROVED') {
      const err = new Error('HOD Approval is strictly disabled until Faculty Mentor approval is completed.');
      debugLogger.error('hodReviewODRequest - Gating Violation', err, odId);
      throw err;
    }

    const now = new Date().toISOString();

    // Rejection reason MUST ONLY exist when decision == 'REJECTED'
    const reviewSnapshot: ApprovalSnapshot = {
      status: decision,
      approverUid: hod.uid,
      approverName: hod.displayName,
      approverEmail: hod.email,
      timestamp: now,
      ...(decision === 'REJECTED' && rejectionReason ? { rejectionReason } : {}),
    };

    const newStatus = decision === 'APPROVED' ? 'HOD_APPROVED' : 'HOD_REJECTED';

    const timelineEntry: TimelineEntry = {
      id: `tl-${Date.now()}`,
      action: decision === 'APPROVED' ? 'HOD Sanctioned OD (Final Approval)' : 'HOD Rejected OD',
      performedBy: {
        uid: hod.uid,
        name: hod.displayName,
        role: hod.role,
      },
      timestamp: now,
      details: decision === 'REJECTED' ? `Reason: ${rejectionReason}` : 'Final Approval granted by Head of Department',
    };

    const rawUpdateData: Record<string, unknown> = {
      status: newStatus,
      hodStatus: decision,
      hodApprovedBy: decision === 'APPROVED' ? { uid: hod.uid, name: hod.displayName, email: hod.email } : null,
      hodApprovedAt: decision === 'APPROVED' ? now : null,
      hodRejectedBy: decision === 'REJECTED' ? { uid: hod.uid, name: hod.displayName, email: hod.email } : null,
      hodRejectedAt: decision === 'REJECTED' ? now : null,
      ...(decision === 'REJECTED' && rejectionReason ? { hodRemarks: rejectionReason } : {}),
      hodReview: reviewSnapshot,
      timeline: arrayUnion(timelineEntry),
      updatedAt: serverTimestamp(),
      updatedBy: hod.uid,
    };

    const updateData = sanitizeFirestoreData(rawUpdateData);

    debugLogger.step('Updating Firestore OD Document', updateData);
    await updateDoc(odRef, updateData);
    debugLogger.step('Firestore Document Updated Successfully');

    await logAudit(
      decision === 'APPROVED' ? 'HOD_APPROVED' : 'HOD_REJECTED',
      { uid: hod.uid, name: hod.displayName, email: hod.email, role: hod.role },
      { odId, requestNumber: od.requestNumber, rejectionReason: decision === 'REJECTED' ? rejectionReason : undefined },
      { collection: 'od_requests', id: odId }
    );
    debugLogger.step('Audit Log Written');

    await sendNotification(
      od.studentUid,
      { uid: hod.uid, name: hod.displayName, role: hod.role },
      decision === 'APPROVED' ? 'OD Request Approved by HOD' : 'OD Request Rejected by HOD',
      decision === 'APPROVED'
        ? `Your OD Request ${od.requestNumber} has been officially approved.`
        : `Your OD Request ${od.requestNumber} was rejected by HOD. Reason: ${rejectionReason}`,
      `/student/history?highlight=${odId}`,
      decision === 'APPROVED' ? 'OD_HOD_APPROVED' : 'OD_HOD_REJECTED',
      odId
    );
    debugLogger.step('Student Final Notification Sent');

    debugLogger.success(`HOD review for OD ${od.requestNumber} completed successfully as ${decision}`);
  } catch (error) {
    debugLogger.error('hodReviewODRequest', error, odId);
    throw error;
  }
};

export const bulkHODApproveODRequests = async (
  odIds: string[],
  hod: UserProfile
): Promise<{ successCount: number; skippedCount: number }> => {
  debugLogger.groupStart('bulkHODApproveODRequests: Bulk Approving ODs', {
    currentUser: { uid: hod.uid, name: hod.displayName, role: hod.role, email: hod.email },
    details: { totalCount: odIds.length, odIds },
  });

  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    let successCount = 0;
    let skippedCount = 0;

    for (const id of odIds) {
      const odRef = doc(db, 'od_requests', id);
      const snap = await getDoc(odRef);
      if (snap.exists()) {
        const od = snap.data() as ODRequest;
        if (od.status === 'MENTOR_APPROVED') {
          const reviewSnapshot: ApprovalSnapshot = {
            status: 'APPROVED',
            approverUid: hod.uid,
            approverName: hod.displayName,
            approverEmail: hod.email,
            timestamp: now,
          };
          const timelineEntry: TimelineEntry = {
            id: `tl-${Date.now()}-${Math.random()}`,
            action: 'HOD Sanctioned OD (Bulk Action)',
            performedBy: { uid: hod.uid, name: hod.displayName, role: hod.role },
            timestamp: now,
            details: 'Bulk approved by Head of Department',
          };

          const rawUpdateData: Record<string, unknown> = {
            status: 'HOD_APPROVED',
            hodStatus: 'APPROVED',
            hodApprovedBy: { uid: hod.uid, name: hod.displayName, email: hod.email },
            hodApprovedAt: now,
            hodReview: reviewSnapshot,
            timeline: arrayUnion(timelineEntry),
            updatedAt: serverTimestamp(),
            updatedBy: hod.uid,
          };

          const updateData = sanitizeFirestoreData(rawUpdateData);

          batch.update(odRef, updateData);
          successCount++;

          sendNotification(
            od.studentUid,
            { uid: hod.uid, name: hod.displayName, role: hod.role },
            'OD Request Approved by HOD',
            `Your OD Request ${od.requestNumber} has been officially approved.`,
            `/student/history?highlight=${id}`,
            'OD_HOD_APPROVED',
            id
          ).catch(() => {});
        } else {
          skippedCount++;
        }
      }
    }

    if (successCount > 0) {
      await batch.commit();
      await logAudit(
        'BULK_HOD_APPROVED',
        { uid: hod.uid, name: hod.displayName, email: hod.email, role: hod.role },
        { processedCount: successCount, skippedCount }
      );
    }

    debugLogger.success(`Bulk HOD Approval completed`, { successCount, skippedCount });
    return { successCount, skippedCount };
  } catch (error) {
    debugLogger.error('bulkHODApproveODRequests', error);
    throw error;
  }
};

export const bulkHODRejectODRequests = async (
  odIds: string[],
  rejectionReason: string,
  hod: UserProfile
): Promise<void> => {
  debugLogger.groupStart('bulkHODRejectODRequests: Bulk Rejecting ODs', {
    currentUser: { uid: hod.uid, name: hod.displayName, role: hod.role, email: hod.email },
    details: { totalCount: odIds.length, rejectionReason },
  });

  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    for (const id of odIds) {
      const odRef = doc(db, 'od_requests', id);
      const snap = await getDoc(odRef);
      if (snap.exists()) {
        const od = snap.data() as ODRequest;
        const reviewSnapshot: ApprovalSnapshot = {
          status: 'REJECTED',
          approverUid: hod.uid,
          approverName: hod.displayName,
          approverEmail: hod.email,
          timestamp: now,
          rejectionReason,
        };
        const timelineEntry: TimelineEntry = {
          id: `tl-${Date.now()}-${Math.random()}`,
          action: 'HOD Rejected OD (Bulk Action)',
          performedBy: { uid: hod.uid, name: hod.displayName, role: hod.role },
          timestamp: now,
          details: `Bulk rejected. Reason: ${rejectionReason}`,
        };

        const rawUpdateData: Record<string, unknown> = {
          status: 'HOD_REJECTED',
          hodStatus: 'REJECTED',
          hodRejectedBy: { uid: hod.uid, name: hod.displayName, email: hod.email },
          hodRejectedAt: now,
          hodRemarks: rejectionReason,
          hodReview: reviewSnapshot,
          timeline: arrayUnion(timelineEntry),
          updatedAt: serverTimestamp(),
          updatedBy: hod.uid,
        };

        const updateData = sanitizeFirestoreData(rawUpdateData);

        batch.update(odRef, updateData);

        sendNotification(
          od.studentUid,
          { uid: hod.uid, name: hod.displayName, role: hod.role },
          'OD Request Rejected by HOD',
          `Your OD Request ${od.requestNumber} was rejected by HOD. Reason: ${rejectionReason}`,
          `/student/history?highlight=${id}`,
          'OD_HOD_REJECTED',
          id
        ).catch(() => {});
      }
    }

    await batch.commit();
    await logAudit(
      'BULK_HOD_REJECTED',
      { uid: hod.uid, name: hod.displayName, email: hod.email, role: hod.role },
      { processedCount: odIds.length, rejectionReason }
    );

    debugLogger.success('Bulk HOD Rejection completed');
  } catch (error) {
    debugLogger.error('bulkHODRejectODRequests', error);
    throw error;
  }
};

// Fetch Methods
export const fetchStudentODRequests = async (studentUid: string): Promise<ODRequest[]> => {
  try {
    const q = query(
      collection(db, 'od_requests'),
      where('studentUid', '==', studentUid),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ODRequest[];

    return list.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
      return tB - tA;
    });
  } catch (error) {
    console.error('Error fetching student OD requests:', error);
    return [];
  }
};

export const fetchMentorPendingRequests = async (
  mentorUid: string,
  mentorEmail?: string
): Promise<ODRequest[]> => {
  try {
    const itemsMap = new Map<string, ODRequest>();

    if (mentorUid) {
      const q1 = query(
        collection(db, 'od_requests'),
        where('assignedMentorUid', '==', mentorUid),
        where('status', '==', 'PENDING'),
        where('isDeleted', '==', false)
      );
      const snap1 = await getDocs(q1);
      snap1.docs.forEach((d) => itemsMap.set(d.id, { id: d.id, ...d.data() } as ODRequest));
    }

    if (mentorEmail) {
      const q2 = query(
        collection(db, 'od_requests'),
        where('assignedMentorSnapshot.email', '==', mentorEmail.toLowerCase()),
        where('status', '==', 'PENDING'),
        where('isDeleted', '==', false)
      );
      const snap2 = await getDocs(q2);
      snap2.docs.forEach((d) => itemsMap.set(d.id, { id: d.id, ...d.data() } as ODRequest));
    }

    return Array.from(itemsMap.values());
  } catch (error) {
    console.error('Error fetching mentor pending requests:', error);
    return [];
  }
};

export const fetchMentorHistoryRequests = async (
  mentorUid: string,
  mentorEmail?: string
): Promise<ODRequest[]> => {
  try {
    const itemsMap = new Map<string, ODRequest>();

    const processDocs = (snapDocs: any[]) => {
      snapDocs.forEach((d) => {
        const item = { id: d.id, ...d.data() } as ODRequest;
        if (item.status !== 'PENDING') {
          itemsMap.set(d.id, item);
        }
      });
    };

    if (mentorUid) {
      const q1 = query(
        collection(db, 'od_requests'),
        where('assignedMentorUid', '==', mentorUid),
        where('isDeleted', '==', false)
      );
      const snap1 = await getDocs(q1);
      processDocs(snap1.docs);
    }

    if (mentorEmail) {
      const q2 = query(
        collection(db, 'od_requests'),
        where('assignedMentorSnapshot.email', '==', mentorEmail.toLowerCase()),
        where('isDeleted', '==', false)
      );
      const snap2 = await getDocs(q2);
      processDocs(snap2.docs);
    }

    return Array.from(itemsMap.values()).sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
      return tB - tA;
    });
  } catch (error) {
    console.error('Error fetching mentor history requests:', error);
    return [];
  }
};

export const fetchHODPendingRequests = async (department: Department): Promise<ODRequest[]> => {
  try {
    const q = query(
      collection(db, 'od_requests'),
      where('department', '==', department),
      where('status', 'in', ['PENDING', 'MENTOR_APPROVED']),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ODRequest[];
    return list.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
      return tB - tA;
    });
  } catch (error) {
    console.error('Error fetching HOD pending requests:', error);
    return [];
  }
};

export const fetchHODHistoryRequests = async (department: Department): Promise<ODRequest[]> => {
  try {
    const q = query(
      collection(db, 'od_requests'),
      where('department', '==', department),
      where('status', 'in', ['HOD_APPROVED', 'HOD_REJECTED', 'MENTOR_REJECTED']),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ODRequest[];
    return list.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
      return tB - tA;
    });
  } catch (error) {
    console.error('Error fetching HOD history requests:', error);
    return [];
  }
};

export const fetchAllODRequests = async (): Promise<ODRequest[]> => {
  try {
    const q = query(
      collection(db, 'od_requests'),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ODRequest[];
    const sorted = list.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
      return tB - tA;
    });
    return checkAndExpireODRequests(sorted);
  } catch (error) {
    console.error('Error fetching all OD requests:', error);
    return [];
  }
};

export const checkAndExpireODRequests = async (requests: ODRequest[]): Promise<ODRequest[]> => {
  const todayStr = new Date().toISOString().split('T')[0];
  const expiredPromises: Promise<void>[] = [];

  const updatedRequests = requests.map((req) => {
    if (req.status === 'PENDING' || req.status === 'MENTOR_APPROVED') {
      const targetDate = req.endDate || req.startDate;
      if (targetDate && targetDate < todayStr) {
        expiredPromises.push(
          (async () => {
            try {
              const reqRef = doc(db, 'od_requests', req.id);
              const now = new Date().toISOString();
              const expiredTimeline: TimelineEntry = {
                id: `tl-${Date.now()}`,
                action: 'OD Request Expired (Date Passed)',
                performedBy: { uid: 'system', name: 'System Auto-Expiry', role: 'SYSTEM' },
                timestamp: now,
                details: `OD date (${targetDate}) passed prior to final sanction.`,
              };

              const cleanData = sanitizeFirestoreData({
                status: 'EXPIRED',
                timeline: arrayUnion(expiredTimeline),
                updatedAt: serverTimestamp(),
              });

              await updateDoc(reqRef, cleanData);

              sendNotification(
                req.studentUid,
                { uid: 'system', name: 'System Auto-Expiry', role: 'SYSTEM' },
                'OD Request Expired',
                `Your OD application (${req.requestNumber}) expired because its scheduled date (${targetDate}) passed prior to final sanction.`,
                '/student/requests',
                'SYSTEM',
                req.id
              ).catch(console.error);

              if (req.assignedMentorUid) {
                sendNotification(
                  req.assignedMentorUid,
                  { uid: 'system', name: 'System Auto-Expiry', role: 'SYSTEM' },
                  'Assigned OD Expired',
                  `OD request (${req.requestNumber}) for ${req.studentSnapshot?.name} expired as scheduled date passed.`,
                  '/mentor/history',
                  'SYSTEM',
                  req.id
                ).catch(console.error);
              }
            } catch (err) {
              console.error('Error auto-expiring OD request:', req.id, err);
            }
          })()
        );

        return { ...req, status: 'EXPIRED' as ODStatus };
      }
    }
    return req;
  });

  if (expiredPromises.length > 0) {
    Promise.all(expiredPromises).catch(console.error);
  }

  return updatedRequests;
};

export const withdrawODRequest = async (
  requestId: string,
  studentUser: UserProfile
): Promise<void> => {
  const reqRef = doc(db, 'od_requests', requestId);
  const snap = await getDoc(reqRef);

  if (!snap.exists()) {
    throw new Error('OD Request not found.');
  }

  const reqData = snap.data() as ODRequest;
  if (reqData.studentUid !== studentUser.uid) {
    throw new Error('Only the student who created this OD application may withdraw it.');
  }

  if (reqData.status === 'WITHDRAWN' || reqData.status === 'EXPIRED') {
    throw new Error(`This application is already ${reqData.status.toLowerCase()}.`);
  }

  const now = new Date().toISOString();
  const withdrawTimeline: TimelineEntry = {
    id: `tl-${Date.now()}`,
    action: 'OD Request Withdrawn by Student',
    performedBy: {
      uid: studentUser.uid,
      name: studentUser.displayName,
      role: studentUser.role,
    },
    timestamp: now,
  };

  const cleanData = sanitizeFirestoreData({
    status: 'WITHDRAWN',
    timeline: arrayUnion(withdrawTimeline),
    updatedAt: serverTimestamp(),
    updatedBy: studentUser.uid,
  });

  await updateDoc(reqRef, cleanData);

  if (reqData.assignedMentorUid) {
    sendNotification(
      reqData.assignedMentorUid,
      { uid: studentUser.uid, name: studentUser.displayName, role: studentUser.role },
      'OD Request Withdrawn',
      `${studentUser.displayName} has withdrawn OD request (${reqData.requestNumber}).`,
      '/mentor/history',
      'STATUS_UPDATE',
      requestId
    ).catch(console.error);
  }

  fetchHODsByDepartment(reqData.department)
    .then((hods) => {
      hods.forEach((hod) => {
        sendNotification(
          hod.uid,
          { uid: studentUser.uid, name: studentUser.displayName, role: studentUser.role },
          'OD Request Withdrawn',
          `${studentUser.displayName} (${reqData.department}) has withdrawn OD request (${reqData.requestNumber}).`,
          '/hod/history',
          'STATUS_UPDATE',
          requestId
        ).catch(console.error);
      });
    })
    .catch(console.error);

  await logAudit(
    'USER_UPDATED',
    { uid: studentUser.uid, name: studentUser.displayName, email: studentUser.email, role: studentUser.role },
    { action: 'OD_WITHDRAWN', requestId, requestNumber: reqData.requestNumber },
    { collection: 'od_requests', id: requestId }
  );
};

export const fetchAuditLogs = async () => {
  try {
    const q = query(collection(db, 'audit_logs'));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, any>[];
    return list.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};
