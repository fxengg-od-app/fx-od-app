import React, { useState } from 'react';
import { Bell, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkNotificationReadMutation } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import { formatRelativeTime, formatAbsoluteTimestamp } from '../../utils/dateUtils';
import type { SystemNotification } from '../../types/notification';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications(userProfile?.uid, 10);

  const markReadMutation = useMarkNotificationReadMutation();

  const handleNotificationClick = (item: SystemNotification) => {
    if (!item.read) {
      markReadMutation.mutate(item.id);
    }
    setIsOpen(false);
    const targetRoute = item.route || item.navigationTarget;
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-md border border-white/20 transition-colors focus:outline-none cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-40 overflow-hidden text-gray-800 dark:text-gray-100">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/80 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="text-[#0B426E] dark:text-blue-400 w-4 h-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-xs">Notifications</h3>
              </div>
              <span className="text-[11px] bg-blue-50 dark:bg-blue-950/60 text-[#0B426E] dark:text-blue-300 px-2 py-0.5 rounded-md font-medium border border-blue-200 dark:border-blue-800">
                {unreadCount} Unread
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => {
                  const targetRoute = item.route || item.navigationTarget;
                  const relativeTimeStr = formatRelativeTime(item.createdAt);
                  const absoluteTimestampStr = formatAbsoluteTimestamp(item.createdAt);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      title={absoluteTimestampStr}
                      className={`p-3 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        item.read
                          ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/40 text-gray-600 dark:text-gray-300'
                          : 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-900 dark:text-gray-100 border-l-4 border-[#0B426E]'
                      }`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {!item.read && (
                              <span
                                className="w-2 h-2 rounded-full bg-[#0B426E] dark:bg-blue-400 shrink-0"
                                title="Unread"
                              />
                            )}
                            <span
                              className={`text-xs truncate ${
                                item.read
                                  ? 'font-normal text-gray-700 dark:text-gray-300'
                                  : 'font-bold text-gray-900 dark:text-white'
                              }`}
                            >
                              {item.title}
                            </span>
                          </div>

                          <span
                            className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0"
                            title={absoluteTimestampStr}
                          >
                            {relativeTimeStr}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          {item.message}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-gray-400">
                            Sender: {item.sender.name} ({item.sender.role})
                          </span>
                          {targetRoute && (
                            <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Lazy Loading Pagination trigger in Bell dropdown */}
              {hasNextPage && (
                <div className="p-2 text-center bg-gray-50 dark:bg-gray-700/30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchNextPage();
                    }}
                    disabled={isFetchingNextPage}
                    className="text-xs text-[#0B426E] dark:text-blue-300 font-semibold hover:underline flex items-center justify-center gap-1.5 w-full cursor-pointer py-1"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" /> Loading older...
                      </>
                    ) : (
                      'Load older notifications'
                    )}
                  </button>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-white font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
