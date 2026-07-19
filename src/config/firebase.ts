import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase Config initialized from Vite Environment Variables with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForInstitutionalApp2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fx-od-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fx-od-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fx-od-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '951221104000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:951221104000:web:abcdef123456',
};

// Initialize Firebase App instance idempotently
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);

// Messaging initialized conditionally (supported in HTTPS/supported browsers)
export const getFCM = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};

export default app;
