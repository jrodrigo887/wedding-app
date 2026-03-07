<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  liked: boolean;
  count: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const buttonClass = computed(() => ({
  'like-button': true,
  'like-button--liked': props.liked,
  'like-button--disabled': props.disabled,
}));
</script>

<template>
  <button
    :class="buttonClass"
    :disabled="disabled"
    type="button"
    @click="emit('toggle')"
  >
    <span class="like-button__icon">
      {{ liked ? '❤️' : '🤍' }}
    </span>
    <span class="like-button__count">{{ count }}</span>
  </button>
</template>

<style scoped>
.like-button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.like-button:hover:not(.like-button--disabled) {
  background: rgba(239, 68, 68, 0.1);
}

.like-button--liked {
  background: rgba(239, 68, 68, 0.1);
}

.like-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.like-button__icon {
  font-size: 1.25rem;
  transition: transform 0.2s ease;
}

.like-button:active:not(.like-button--disabled) .like-button__icon {
  transform: scale(1.2);
}

.like-button__count {
  color: #6b7280;
  font-weight: 500;
}

.like-button--liked .like-button__count {
  color: #ef4444;
}
</style>
