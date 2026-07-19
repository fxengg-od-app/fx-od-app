import type { Timestamp } from 'firebase/firestore';

/**
 * Safely parses any Firestore Timestamp, ISO string, Date object, or milliseconds into a JS Date object.
 */
export const parseNotificationDate = (createdAt: Timestamp | string | Date | number | null | undefined): Date => {
  if (!createdAt) return new Date();

  // Firestore Timestamp object (has .seconds or .toDate())
  if (typeof createdAt === 'object') {
    if ('toDate' in createdAt && typeof createdAt.toDate === 'function') {
      return createdAt.toDate();
    }
    if ('seconds' in createdAt && typeof createdAt.seconds === 'number') {
      return new Date(createdAt.seconds * 1000);
    }
  }

  if (createdAt instanceof Date) return createdAt;
  if (typeof createdAt === 'number') return new Date(createdAt);

  const parsed = new Date(createdAt as string);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

/**
 * Formats a notification date into a human-readable relative time string.
 * Examples: 'Just now', '5 min ago', '2 hours ago', 'Yesterday', '3 days ago', 'Jul 18, 2026'
 */
export const formatRelativeTime = (createdAt: Timestamp | string | Date | number | null | undefined): string => {
  const date = parseNotificationDate(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle future dates or tiny negative diffs from slight server time offsets
  if (diffInSeconds < 30) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats a notification date into an absolute timestamp string for tooltips / title attributes.
 * Example: 'Jul 18, 2026, 4:15 PM'
 */
export const formatAbsoluteTimestamp = (createdAt: Timestamp | string | Date | number | null | undefined): string => {
  const date = parseNotificationDate(createdAt);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
