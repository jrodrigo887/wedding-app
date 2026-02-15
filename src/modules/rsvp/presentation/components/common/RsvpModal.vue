<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="rsvp-modal-overlay"
      @click.self="$emit('close')"
    >
      <div class="rsvp-modal">
        <div
          v-if="icon"
          class="rsvp-modal__icon"
        >
          {{ icon }}
        </div>
        <h3 class="rsvp-modal__title">{{ title }}</h3>
        <p class="rsvp-modal__message">
          <slot name="message"></slot>
        </p>
        <div
          v-if="$slots.warning"
          class="rsvp-modal__warning"
        >
          <slot name="warning"></slot>
        </div>
        <div
          v-if="$slots.info"
          class="rsvp-modal__info"
        >
          <slot name="info"></slot>
        </div>
        <div class="rsvp-modal__actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * Component: RsvpModal
 * Modal reutilizável para confirmações e avisos
 */
defineProps<{
  show: boolean;
  title: string;
  icon?: string;
}>();

defineEmits<{
  close: [];
}>();
</script>

<style scoped>
.rsvp-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.rsvp-modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.2s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rsvp-modal__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.rsvp-modal__title {
  font-size: 1.3rem;
  color: #3d2b1f;
  margin: 0 0 1rem;
}

.rsvp-modal__message {
  color: #5a4a3a;
  margin: 0 0 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
}

.rsvp-modal__warning {
  color: #991b1b;
  background: #fee2e2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.rsvp-modal__info {
  color: #5a4a3a;
  background: #fff9f0;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.rsvp-modal__actions {
  display: flex;
  gap: 1rem;
}

.rsvp-modal__actions :deep(button) {
  flex: 1;
  padding: 0.875rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-modal__actions :deep(.btn-secondary) {
  background: #fff9f0;
  color: #8b7355;
  border: 2px solid #e8dcc8;
}

.rsvp-modal__actions :deep(.btn-secondary:hover:not(:disabled)) {
  background: #e8dcc8;
}

.rsvp-modal__actions :deep(.btn-danger) {
  background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%);
  color: white;
}

.rsvp-modal__actions :deep(.btn-danger:hover:not(:disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(153, 27, 27, 0.3);
}

.rsvp-modal__actions :deep(button:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
