<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="btn__loader"
    ></span>
    <slot v-else></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type ButtonType = 'button' | 'submit' | 'reset';
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  type?: ButtonType;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  {
    'btn--block': props.fullWidth,
    'btn--disabled': props.disabled,
    'btn--loading': props.loading,
  },
]);

const handleClick = (event: MouseEvent): void => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:focus {
  outline: none;
}

.btn:focus-visible {
  outline: 2px solid var(--primary-color, #3b82f6);
  outline-offset: 2px;
}

.btn--block {
  width: 100%;
}

/* Sizes */
.btn--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn--md {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
}

.btn--lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

/* Variants - usando CSS variables para theming */
.btn--primary {
  background: var(--btn-primary-bg, #3b82f6);
  color: var(--btn-primary-text, #fff);
}

.btn--primary:hover:not(:disabled) {
  background: var(--btn-primary-hover, #2563eb);
}

.btn--secondary {
  background: var(--btn-secondary-bg, #2d2d44);
  color: var(--btn-secondary-text, #94a3b8);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--btn-secondary-hover, #3d3d5c);
  color: #fff;
}

.btn--success {
  background: var(--btn-success-bg, #10b981);
  color: var(--btn-success-text, #fff);
}

.btn--success:hover:not(:disabled) {
  background: var(--btn-success-hover, #059669);
}

.btn--danger {
  background: var(--btn-danger-bg, #ef4444);
  color: var(--btn-danger-text, #fff);
}

.btn--danger:hover:not(:disabled) {
  background: var(--btn-danger-hover, #dc2626);
}

.btn--outline {
  background: transparent;
  border: 2px solid var(--btn-outline-border, #3b82f6);
  color: var(--btn-outline-text, #3b82f6);
}

.btn--outline:hover:not(:disabled) {
  background: var(--btn-outline-hover-bg, rgba(59, 130, 246, 0.1));
}

.btn--ghost {
  background: transparent;
  border: 1px solid var(--btn-ghost-border, #475569);
  color: var(--btn-ghost-text, #94a3b8);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--btn-ghost-hover-bg, rgba(255, 255, 255, 0.05));
  color: #fff;
}

.btn--disabled,
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--loading {
  cursor: wait;
}

/* Loader */
.btn__loader {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
