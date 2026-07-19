import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../../config/firebase';
import type { UserProfile, ImportedUserRecord } from '../../types/user';
import { logAudit } from './auditService';
import { seedDefaultRegistryIfEmpty } from './registryService';
import { syncMentorUIDsForStudents } from './userService';
import { sanitizeFirestoreData } from '../../utils/sanitize';

// Helper to safely check boolean flags regardless of Firestore storing boolean or string ("true"/"false")
const parseBool = (val: unknown, defaultVal: boolean): boolean => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
  }
  return defaultVal;
};

export const signInWithGoogle = async (): Promise<UserProfile> => {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;
  const email = firebaseUser.email?.toLowerCase();

  if (!email) {
    await firebaseSignOut(auth);
    throw new Error('Authenticated Google account does not contain a valid email address.');
  }

  // 1. Direct Lookup by UID in Firestore (`users/{firebaseUid}`)
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  let userSnap = await getDoc(userDocRef);

  // 2. Secondary Lookup by Email in `users` (If document was created under different ID)
  if (!userSnap.exists()) {
    const userEmailQuery = query(
      collection(db, 'users'),
      where('email', '==', email),
      where('isDeleted', '==', false)
    );
    const emailSnap = await getDocs(userEmailQuery);

    if (!emailSnap.empty) {
      const existingData = emailSnap.docs[0].data() as UserProfile;
      const updatedProfile = sanitizeFirestoreData({
        ...existingData,
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || existingData.displayName,
        photoURL: firebaseUser.photoURL || existingData.photoURL || null,
        updatedAt: serverTimestamp(),
      });
      await setDoc(userDocRef, updatedProfile, { merge: true });
      userSnap = await getDoc(userDocRef);
    }
  }

  // 3. Tertiary Lookup in `imported_users` Registry (Allowlist Auto-Onboarding)
  if (!userSnap.exists()) {
    await seedDefaultRegistryIfEmpty();

    const registryRef = collection(db, 'imported_users');
    const q = query(registryRef, where('email', '==', email));
    const registrySnap = await getDocs(q);

    if (registrySnap.empty) {
      await logAudit(
        'LOGIN_ACCESS_DENIED',
        {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Unregistered User',
          email,
          role: 'UNAUTHORIZED',
        },
        { reason: 'Email address not found in users collection or imported roster registry' }
      );
      await firebaseSignOut(auth);
      throw new Error(
        `Access Denied (${email}): Your email address is not registered in the institution roster. Contact your HOD or Super Admin.`
      );
    }

    const registryDoc = registrySnap.docs[0];
    const registryData = registryDoc.data() as ImportedUserRecord;

    // Optional Mentor Lookup: Never assume mentorUid exists! Store mentorEmail as primary relationship.
    let mentorUid: string | null = null;
    let mentorName: string | null = null;

    if (registryData.role === 'STUDENT' && registryData.mentorEmail) {
      const mentorQ = query(
        collection(db, 'users'),
        where('email', '==', registryData.mentorEmail.toLowerCase()),
        where('isDeleted', '==', false)
      );
      const mentorSnap = await getDocs(mentorQ);
      if (!mentorSnap.empty) {
        const mProfile = mentorSnap.docs[0].data() as UserProfile;
        mentorUid = mProfile.uid;
        mentorName = mProfile.displayName;
      }
    }

    // Build raw profile object with nulls for missing optional fields (never undefined!)
    const rawNewProfile: Record<string, unknown> = {
      uid: firebaseUser.uid,
      email,
      displayName: firebaseUser.displayName || registryData.displayName,
      photoURL: firebaseUser.photoURL || null,
      role: registryData.role,
      department: registryData.department,
      section: registryData.section || 'A',
      year: registryData.year || 'III',
      registerNumber: registryData.registerNumber || null,
      mentorUid: mentorUid || null,
      mentorName: mentorName || null,
      mentorEmail: registryData.mentorEmail ? registryData.mentorEmail.toLowerCase() : null,
      isActive: true,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Sanitize object recursively before writing to Firestore
    const cleanProfile = sanitizeFirestoreData(rawNewProfile);
    await setDoc(userDocRef, cleanProfile);

    // Mark imported registry doc as linked
    const cleanRegistryUpdate = sanitizeFirestoreData({
      isLinked: true,
      linkedUid: firebaseUser.uid,
      linkedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'imported_users', registryDoc.id), cleanRegistryUpdate);

    await logAudit(
      'USER_CREATED',
      {
        uid: firebaseUser.uid,
        name: (rawNewProfile.displayName as string),
        email: (rawNewProfile.email as string),
        role: (rawNewProfile.role as string),
      },
      { source: 'REGISTRY_AUTO_ONBOARDING', registryId: registryDoc.id }
    );

    userSnap = await getDoc(userDocRef);
  }

  const rawData = userSnap.data() || {};
  const isDeleted = parseBool(rawData.isDeleted, false);
  const isActive = parseBool(rawData.isActive, true);

  const userProfile: UserProfile = {
    ...(rawData as UserProfile),
    isDeleted,
    isActive,
  };

  // Safe Deactivated check
  if (isDeleted || !isActive) {
    await logAudit(
      'LOGIN_ACCESS_DENIED',
      {
        uid: firebaseUser.uid,
        name: userProfile.displayName,
        email,
        role: userProfile.role,
      },
      { reason: 'User account has been deactivated or soft-deleted' }
    );
    await firebaseSignOut(auth);
    throw new Error(
      'Access Denied: Your institutional account has been deactivated. Contact your HOD or Super Admin.'
    );
  }

  // If logged-in user is a MENTOR, run dynamic mentor-student UID synchronization
  if (userProfile.role === 'MENTOR') {
    syncMentorUIDsForStudents(
      userProfile.email,
      userProfile.uid,
      userProfile.displayName
    ).catch((err) => console.error('Background mentor UID sync error:', err));
  }

  // Log Successful Login Audit
  await logAudit(
    'USER_LOGIN',
    {
      uid: userProfile.uid,
      name: userProfile.displayName,
      email: userProfile.email,
      role: userProfile.role,
    },
    { department: userProfile.department }
  );

  return userProfile;
};

export const fetchUserProfileByUid = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      const rawData = userSnap.data();
      return {
        ...(rawData as UserProfile),
        isDeleted: parseBool(rawData.isDeleted, false),
        isActive: parseBool(rawData.isActive, true),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile by UID:', error);
    return null;
  }
};

export const signOutUser = async (currentProfile?: UserProfile | null): Promise<void> => {
  if (currentProfile) {
    await logAudit(
      'USER_LOGOUT',
      {
        uid: currentProfile.uid,
        name: currentProfile.displayName,
        email: currentProfile.email,
        role: currentProfile.role,
      },
      {}
    );
  }
  await firebaseSignOut(auth);
};
