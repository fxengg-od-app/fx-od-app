import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserNotifications,
  markNotificationAsRead,
  type PaginatedNotificationsResult,
} from '../services/firebase/notificationService';

export const useNotifications = (recipientUid?: string, pageSize = 15) => {
  const query = useInfiniteQuery({
    queryKey: ['notifications', recipientUid],
    queryFn: ({ pageParam }) =>
      fetchUserNotifications(recipientUid || '', pageSize, pageParam as any),
    initialPageParam: null as any,
    getNextPageParam: (lastPage: PaginatedNotificationsResult) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!recipientUid,
    refetchInterval: 15000,
  });

  const notifications = query.data?.pages.flatMap((page) => page.notifications) || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    ...query,
    notifications,
    unreadCount,
  };
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
