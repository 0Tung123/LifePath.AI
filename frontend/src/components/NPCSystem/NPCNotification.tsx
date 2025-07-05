'use client';

import React, { useEffect, useState } from 'react';
import { NPCNotificationProps, NPCNotificationData } from '@/types/npc.types';

/**
 * NPCNotification Component
 * Displays NPC-related notifications in a non-intrusive way
 * Supports auto-close, manual dismiss, and different priority levels
 */
const NPCNotification: React.FC<NPCNotificationProps> = ({
  notifications,
  onDismiss,
  onDismissAll,
  position,
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<
    NPCNotificationData[]
  >([]);

  // Update visible notifications when props change
  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  // Auto-dismiss notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.autoClose && notification.autoCloseDelay) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.autoCloseDelay);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications, onDismiss]);

  // Get position classes
  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 flex flex-col space-y-2 max-w-sm';

    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: NPCNotificationData['type']) => {
    switch (type) {
      case 'relationship-change':
        return (
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        );
      case 'faction-change':
        return (
          <svg
            className="w-5 h-5 text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        );
      case 'status-change':
        return (
          <svg
            className="w-5 h-5 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'discovery':
        return (
          <svg
            className="w-5 h-5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        );
      case 'important-update':
        return (
          <svg
            className="w-5 h-5 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  // Get notification colors based on priority
  const getNotificationColors = (priority: NPCNotificationData['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900/90 border-red-500/50 text-red-100';
      case 'medium':
        return 'bg-amber-900/90 border-amber-500/50 text-amber-100';
      case 'low':
        return 'bg-blue-900/90 border-blue-500/50 text-blue-100';
      default:
        return 'bg-gray-900/90 border-gray-500/50 text-gray-100';
    }
  };

  // Get priority indicator
  const getPriorityIndicator = (priority: NPCNotificationData['priority']) => {
    switch (priority) {
      case 'high':
        return <div className="w-1 h-full bg-red-500 rounded-l-lg"></div>;
      case 'medium':
        return <div className="w-1 h-full bg-amber-500 rounded-l-lg"></div>;
      case 'low':
        return <div className="w-1 h-full bg-blue-500 rounded-l-lg"></div>;
      default:
        return <div className="w-1 h-full bg-gray-500 rounded-l-lg"></div>;
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={getPositionClasses()}>
      {/* Dismiss All Button */}
      {visibleNotifications.length > 1 && (
        <button
          onClick={onDismissAll}
          className="self-end mb-2 px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
        >
          Đóng tất cả
        </button>
      )}

      {/* Notifications */}
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl ${getNotificationColors(notification.priority)}`}
        >
          {/* Priority Indicator */}
          {getPriorityIndicator(notification.priority)}

          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  {notification.message}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs opacity-70">
                    {notification.npcName}
                  </span>
                  <span className="text-xs opacity-50">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 ml-3 text-gray-400 hover:text-white transition-colors"
                title="Đóng thông báo"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NPCNotification;
