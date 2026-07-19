const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * Cloud Function triggered automatically whenever a new document is written
 * to the `notifications` collection in Firestore.
 */
exports.sendFcmOnNotificationCreated = onDocumentCreated(
  {
    document: 'notifications/{notificationId}',
    region: 'us-central1',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the notification creation event.');
      return;
    }

    const notificationData = snapshot.data();
    const notificationId = event.params.notificationId;
    const recipientUid = notificationData.recipientUid;

    if (!recipientUid) {
      console.log(`[FCM_FUNCTION] Missing recipientUid for notification ${notificationId}`);
      return;
    }

    try {
      // 1. Fetch recipient's registered FCM tokens from Firestore users/{recipientUid}
      const userDocRef = db.collection('users').doc(recipientUid);
      const userSnap = await userDocRef.get();

      if (!userSnap.exists) {
        console.log(`[FCM_FUNCTION] Recipient user document not found for ${recipientUid}`);
        return;
      }

      const userData = userSnap.data();
      const fcmTokens = userData.fcmTokens || [];

      if (!Array.isArray(fcmTokens) || fcmTokens.length === 0) {
        console.log(`[FCM_FUNCTION] No FCM tokens registered for recipient ${recipientUid}`);
        return;
      }

      const title = notificationData.title || 'FX OD Portal Notification';
      const body = notificationData.message || 'You have a new institutional update.';
      const targetUrl = notificationData.route || notificationData.navigationTarget || '/dashboard';
      const icon = '/favicon.svg';

      console.log(`[FCM_FUNCTION] Dispatching push notification to ${fcmTokens.length} token(s) for ${recipientUid}`);

      // 2. Construct FCM Multicast Message Payload
      const messagePayload = {
        tokens: fcmTokens,
        notification: {
          title,
          body,
        },
        data: {
          notificationId,
          recipientUid,
          title,
          message: body,
          navigationTarget: targetUrl,
          route: targetUrl,
          url: targetUrl,
          type: notificationData.type || 'SYSTEM',
          referenceId: notificationData.referenceId || '',
        },
        webpush: {
          headers: {
            Urgency: 'high',
            TTL: '86400',
          },
          notification: {
            title,
            body,
            icon,
            badge: icon,
            click_action: targetUrl,
            tag: notificationId,
            renotify: true,
          },
          fcmOptions: {
            link: targetUrl,
          },
        },
      };

      // 3. Send Multicast Notification via FCM Admin SDK
      const response = await messaging.sendEachForMulticast(messagePayload);
      console.log(`[FCM_FUNCTION SUCCESS] Delivered: ${response.successCount}, Failed: ${response.failureCount}`);

      // 4. Clean up invalid / expired tokens if any failed
      if (response.failureCount > 0) {
        const tokensToRemove = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error?.code;
            if (
              errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered'
            ) {
              tokensToRemove.push(fcmTokens[idx]);
            }
          }
        });

        if (tokensToRemove.length > 0) {
          console.log(`[FCM_FUNCTION] Removing ${tokensToRemove.length} stale FCM token(s) for ${recipientUid}`);
          const validTokens = fcmTokens.filter((t) => !tokensToRemove.includes(t));
          await userDocRef.update({ fcmTokens: validTokens });
        }
      }
    } catch (error) {
      console.error(`[FCM_FUNCTION ERROR] Failed to send push notification for ${notificationId}:`, error);
    }
  }
);
