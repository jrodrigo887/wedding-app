<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="[`notification--${notification.type}`]"
          @click="removeNotification(notification.id)"
        >
          <div class="notification__icon">{{ getIcon(notification.type) }}</div>
          <p class="notification__message">{{ notification.message }}</p>
          <button
            class="notification__close"
            @click.stop="removeNotification(notification.id)"
          >
            &times;
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
import { NOTIFICATION_TYPES, type NotificationType } from '@/utils/constants';

const { notifications, removeNotification } = useNotification();

const getIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    [NOTIFICATION_TYPES.SUCCESS]: '✓',
    [NOTIFICATION_TYPES.ERROR]: '✕',
    [NOTIFICATION_TYPES.WARNING]: '⚠',
    [NOTIFICATION_TYPES.INFO]: 'ℹ',
  };
  return icons[type] || 'ℹ';
};
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid;
}

.notification:hover {
  transform: translateX(-4px);
  box-shadow: 0 12px 50px rgba(0, 0, 0, 0.2);
}

/* Types */
.notification--success {
  border-left-color: #28a745;
}

.notification--error {
  border-left-color: #dc3545;
}

.notification--warning {
  border-left-color: #ffc107;
}

.notification--info {
  border-left-color: #17a2b8;
}

.notification__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  font-weight: bold;
  flex-shrink: 0;
}

.notification--success .notification__icon {
  background: #d4edda;
  color: #28a745;
}

.notification--error .notification__icon {
  background: #f8d7da;
  color: #dc3545;
}

.notification--warning .notification__icon {
  background: #fff3cd;
  color: #ffc107;
}

.notification--info .notification__icon {
  background: #d1ecf1;
  color: #17a2b8;
}

.notification__message {
  flex: 1;
  margin: 0;
  font-size: 0.875rem;
  color: #2c3e50;
  line-height: 1.5;
}

.notification__close {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0;
  flex-shrink: 0;
}

.notification__close:hover {
  color: #2c3e50;
}

/* Animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

/* Mobile */
@media (max-width: 640px) {
  .notification-container {
    top: auto;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    max-width: none;
  }

  .notification {
    width: 100%;
  }

  .notification-enter-from {
    transform: translateY(100%);
  }

  .notification-leave-to {
    transform: translateY(100%) scale(0.8);
  }
}
</style>
