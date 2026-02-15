// ========================================
// COMPOSABLE: useNotification
// ========================================

import { ref, type Ref } from 'vue';
import { generateId } from '@/utils/helpers';
import { APP_CONFIG, NOTIFICATION_TYPES, type NotificationType } from '@/utils/constants';

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

/**
 * Composable para sistema de notificacoes/toasts
 */
export function useNotification(): UseNotificationReturn {
  /**
   * Adiciona notificacao
   */
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

  /**
   * Remove notificacao
   */
  const removeNotification = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  /**
   * Remove todas as notificacoes
   */
  const clearAll = (): void => {
    notifications.value = [];
  };

  /**
   * Notificacao de sucesso
   */
  const success = (message: string, duration?: number): string => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
  };

  /**
   * Notificacao de erro
   */
  const error = (message: string, duration?: number): string => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, duration);
  };

  /**
   * Notificacao de aviso
   */
  const warning = (message: string, duration?: number): string => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, duration);
  };

  /**
   * Notificacao informativa
   */
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
