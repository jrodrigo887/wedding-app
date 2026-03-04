import { ref, type Ref } from 'vue';
import { generateId } from './helpers';
import { APP_CONFIG, NOTIFICATION_TYPES } from '@shared/config/constants';
import type { NotificationType } from '@shared/config/constants';

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

export interface UseNotificationReturn {
  notifications: Ref<NotificationItem[]>;
  addNotification: (message: string, type?: NotificationType, duration?: number) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
}

const notifications = ref<NotificationItem[]>([]);

export function useNotification(): UseNotificationReturn {
  const addNotification = (
    message: string,
    type: NotificationType = NOTIFICATION_TYPES.INFO,
    duration: number = APP_CONFIG.NOTIFICATION_DURATION
  ): string => {
    const id = generateId();
    const notification: NotificationItem = {
      id,
      message,
      type,
      duration,
    };

    notifications.value.push(notification);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearAll = (): void => {
    notifications.value = [];
  };

  const success = (message: string, duration?: number): string => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
  };

  const error = (message: string, duration?: number): string => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, duration);
  };

  const warning = (message: string, duration?: number): string => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, duration);
  };

  const info = (message: string, duration?: number): string => {
    return addNotification(message, NOTIFICATION_TYPES.INFO, duration);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}
