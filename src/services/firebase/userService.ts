import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { UserProfile, Department } from '../../types/user';
import { logAudit } from './auditService';
import { sanitizeFirestoreData } from '../../utils/sanitize';

export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({
      ...d.data(),
    })) as UserProfile[];
    return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

export const fetchMentorsByDepartment = async (
  department: Department
): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'MENTOR'),
      where('department', '==', department),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data() })) as UserProfile[];
  } catch (error) {
    console.error('Error fetching mentors by department:', error);
    return [];
  }
};

export const fetchAllMentors = async (): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'MENTOR'),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ ...d.data() })) as UserProfile[];
    return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    console.error('Error fetching all mentors:', error);
    return [];
  }
};

export const fetchHODsByDepartment = async (
  department: Department
): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'HOD'),
      where('department', '==', department),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data() })) as UserProfile[];
  } catch (error) {
    console.error('Error fetching HODs by department:', error);
    return [];
  }
};

export const fetchStudentsForMentor = async (
  mentorUid: string,
  mentorEmail?: string
): Promise<UserProfile[]> => {
  try {
    const studentsMap = new Map<string, UserProfile>();

    if (mentorUid) {
      const q1 = query(
        collection(db, 'users'),
        where('role', '==', 'STUDENT'),
        where('mentorUid', '==', mentorUid),
        where('isDeleted', '==', false)
      );
      const snap1 = await getDocs(q1);
      snap1.docs.forEach((d) => {
        const u = d.data() as UserProfile;
        studentsMap.set(u.uid, u);
      });
    }

    if (mentorEmail) {
      const q2 = query(
        collection(db, 'users'),
        where('role', '==', 'STUDENT'),
        where('mentorEmail', '==', mentorEmail.toLowerCase()),
        where('isDeleted', '==', false)
      );
      const snap2 = await getDocs(q2);
      snap2.docs.forEach((d) => {
        const u = d.data() as UserProfile;
        studentsMap.set(u.uid, u);
      });
    }

    return Array.from(studentsMap.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );
  } catch (error) {
    console.error('Error fetching students for mentor:', error);
    return [];
  }
};

export const fetchStudentsForDepartment = async (
  department: Department
): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'STUDENT'),
      where('department', '==', department),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ ...d.data() })) as UserProfile[];
    return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    console.error('Error fetching department students:', error);
    return [];
  }
};

export const assignMentorToStudent = async (
  studentUid: string,
  mentor: UserProfile,
  performedBy: { uid: string; name: string; email: string; role: string }
): Promise<void> => {
  const studentRef = doc(db, 'users', studentUid);
  const updateData = sanitizeFirestoreData({
    mentorUid: mentor.uid,
    mentorName: mentor.displayName,
    mentorEmail: mentor.email,
    updatedAt: serverTimestamp(),
    updatedBy: performedBy.uid,
  });

  await updateDoc(studentRef, updateData);

  await logAudit(
    'MENTOR_REASSIGNED',
    performedBy,
    { studentUid, mentorUid: mentor.uid, mentorName: mentor.displayName },
    { collection: 'users', id: studentUid }
  );
};

export const syncMentorUIDsForStudents = async (
  mentorEmail: string,
  mentorUid: string,
  mentorName: string
): Promise<number> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('mentorEmail', '==', mentorEmail.toLowerCase()),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    if (snap.empty) return 0;

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      const cleanData = sanitizeFirestoreData({
        mentorUid,
        mentorName,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'users', d.id), cleanData);
    });

    await batch.commit();
    return snap.docs.length;
  } catch (error) {
    console.error('Error syncing mentor UIDs for students:', error);
    return 0;
  }
};

export const unassignStudentsOfDeletedMentor = async (
  mentorUid: string,
  mentorEmail: string,
  performedBy: { uid: string; name: string; email: string; role: string }
): Promise<number> => {
  try {
    const studentsMap = new Map<string, string>(); // studentDocId -> studentDocId

    if (mentorUid) {
      const q1 = query(
        collection(db, 'users'),
        where('mentorUid', '==', mentorUid),
        where('isDeleted', '==', false)
      );
      const snap1 = await getDocs(q1);
      snap1.docs.forEach((d) => studentsMap.set(d.id, d.id));
    }

    if (mentorEmail) {
      const q2 = query(
        collection(db, 'users'),
        where('mentorEmail', '==', mentorEmail.toLowerCase()),
        where('isDeleted', '==', false)
      );
      const snap2 = await getDocs(q2);
      snap2.docs.forEach((d) => studentsMap.set(d.id, d.id));
    }

    if (studentsMap.size === 0) return 0;

    const batch = writeBatch(db);
    studentsMap.forEach((studentId) => {
      const studentRef = doc(db, 'users', studentId);
      const cleanData = sanitizeFirestoreData({
        mentorUid: '',
        mentorEmail: '',
        mentorName: 'Unassigned Mentor',
        isMentorAssigned: false,
        updatedAt: serverTimestamp(),
        updatedBy: performedBy.uid,
      });
      batch.update(studentRef, cleanData);
    });

    await batch.commit();

    await logAudit(
      'MENTOR_REASSIGNED',
      performedBy,
      { mentorUid, mentorEmail, unassignedCount: studentsMap.size, action: 'UNASSIGN_DELETED_MENTOR' },
      { collection: 'users', id: mentorUid }
    );

    return studentsMap.size;
  } catch (error) {
    console.error('Error unassigning students of deleted mentor:', error);
    return 0;
  }
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>,
  performedBy: { uid: string; name: string; email: string; role: string }
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  const cleanData = sanitizeFirestoreData({
    ...updates,
    updatedAt: serverTimestamp(),
    updatedBy: performedBy.uid,
  });
  await updateDoc(userRef, cleanData);

  await logAudit(
    'USER_UPDATED',
    performedBy,
    { targetUid: uid, updates: cleanData },
    { collection: 'users', id: uid }
  );
};

export const softDeleteUser = async (
  targetUid: string,
  performedBy: { uid: string; name: string; email: string; role: string }
): Promise<void> => {
  const userRef = doc(db, 'users', targetUid);
  let mentorEmail = '';

  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      mentorEmail = userData.email || '';
    }
  } catch (err) {
    console.warn('Could not fetch user snap before soft delete:', err);
  }

  const cleanData = sanitizeFirestoreData({
    isDeleted: true,
    isActive: false,
    updatedAt: serverTimestamp(),
    updatedBy: performedBy.uid,
  });
  await updateDoc(userRef, cleanData);

  // Safely transition affected students into Unassigned Mentor state
  await unassignStudentsOfDeletedMentor(targetUid, mentorEmail, performedBy);

  await logAudit(
    'USER_DISABLED',
    performedBy,
    { targetUid },
    { collection: 'users', id: targetUid }
  );
};

export const createOrUpdateUserDoc = async (
  userProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'>
): Promise<void> => {
  const userRef = doc(db, 'users', userProfile.uid);
  const cleanData = sanitizeFirestoreData({
    ...userProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await setDoc(userRef, cleanData, { merge: true });
};
