import { ref, type Ref } from 'vue';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

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

const DEFAULT_DURATION = 5000;
const notifications = ref<NotificationItem[]>([]);

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export function useNotification(): UseNotificationReturn {
  const addNotification = (
    message: string,
    type: NotificationType = 'info',
    duration: number = DEFAULT_DURATION
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
    return addNotification(message, 'success', duration);
  };

  const error = (message: string, duration?: number): string => {
    return addNotification(message, 'error', duration);
  };

  const warning = (message: string, duration?: number): string => {
    return addNotification(message, 'warning', duration);
  };

  const info = (message: string, duration?: number): string => {
    return addNotification(message, 'info', duration);
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
