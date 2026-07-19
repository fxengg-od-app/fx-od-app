import { getToken, onMessage } from 'firebase/messaging';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db, getFCM } from '../../config/firebase';
import { sanitizeFirestoreData } from '../../utils/sanitize';

// Structured logger for FCM events
const logFCMEvent = (eventType: string, details: Record<string, unknown>) => {
  console.groupCollapsed(
    `%c[FCM_SERVICE] ${eventType}`,
    'color: #8b5cf6; font-weight: bold; font-size: 12px;'
  );
  console.log('%cTimestamp:', 'color: #64748b;', new Date().toISOString());
  console.log('%cDetails:', 'color: #06b6d4; font-weight: bold;', details);
  console.groupEnd();
};

/**
 * Requests browser push notification permission, retrieves FCM token with VAPID key,
 * and persists/refreshes the token in Firestore under users/{userUid}.
 */
export const requestAndSaveFCMToken = async (userUid: string): Promise<string | null> => {
  try {
    if (!('Notification' in window)) {
      logFCMEvent('Browser Unsupported', { reason: 'Browser does not support HTML5 Notifications' });
      return null;
    }

    logFCMEvent('Requesting Permission', { userUid, currentPermission: Notification.permission });

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      logFCMEvent('Permission Denied / Dismissed', { permission });
      return null;
    }

    const messaging = await getFCM();
    if (!messaging) {
      logFCMEvent('Messaging Unavailable', { reason: 'Firebase Messaging not supported in this environment' });
      return null;
    }

    // Register service worker if not already registered
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const tokenOptions: { serviceWorkerRegistration?: ServiceWorkerRegistration; vapidKey?: string } = {};

    if (swRegistration) {
      tokenOptions.serviceWorkerRegistration = swRegistration;
    }
    if (vapidKey) {
      tokenOptions.vapidKey = vapidKey;
    }

    // Retrieve FCM Token
    const token = await getToken(messaging, tokenOptions);

    if (!token) {
      logFCMEvent('Token Retrieval Failed', { reason: 'No FCM token returned from Firebase' });
      return null;
    }

    logFCMEvent('FCM Token Retrieved', { userUid, tokenPrefix: token.substring(0, 15) + '...' });

    // Persist & Deduplicate FCM token in Firestore users/{userUid}
    const userRef = doc(db, 'users', userUid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const existingData = userSnap.data();
      const existingTokens: string[] = existingData.fcmTokens || [];

      if (!existingTokens.includes(token)) {
        const updatePayload = sanitizeFirestoreData({
          fcmTokens: arrayUnion(token),
          lastTokenRefresh: serverTimestamp(),
        });
        await updateDoc(userRef, updatePayload);
        logFCMEvent('FCM Token Persisted in Firestore', { userUid, tokenCount: existingTokens.length + 1 });
      } else {
        logFCMEvent('FCM Token Already Registered', { userUid });
      }
    }

    return token;
  } catch (error) {
    console.error('[FCM_SERVICE ERROR] Failed to register FCM token:', error);
    return null;
  }
};

/**
 * Subscribes to foreground push notifications and displays desktop OS toasts when active.
 */
export const setupForegroundNotificationListener = async (
  onNotificationReceived: (payload: { title: string; message: string; navigationTarget: string }) => void
) => {
  try {
    const messaging = await getFCM();
    if (!messaging) return () => {};

    const unsubscribe = onMessage(messaging, (payload) => {
      logFCMEvent('Foreground Message Received', { payload });

      const title = payload.notification?.title || payload.data?.title || 'FX OD Portal Notification';
      const message = payload.notification?.body || payload.data?.message || payload.data?.body || 'New institutional update';
      const navigationTarget = payload.data?.navigationTarget || payload.data?.route || payload.data?.url || '/dashboard';

      // Trigger HTML5 Notification toast if allowed
      if ('Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification(title, {
          body: message,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          data: { url: navigationTarget },
        });

        notif.onclick = () => {
          logFCMEvent('Foreground Toast Clicked', { navigationTarget });
          window.focus();
          window.location.href = navigationTarget;
        };
      }

      onNotificationReceived({ title, message, navigationTarget });
    });

    return unsubscribe;
  } catch (error) {
    console.error('[FCM_SERVICE ERROR] Foreground listener setup failed:', error);
    return () => {};
  }
};
