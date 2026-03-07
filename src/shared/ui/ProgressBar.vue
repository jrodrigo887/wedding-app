<template>
  <div class="progress">
    <div class="progress__header">
      <span class="progress__label">{{ label }}</span>
      <span class="progress__value">{{ value }}%</span>
    </div>
    <div
      class="progress__bar"
      :class="variantClass"
    >
      <div
        class="progress__fill"
        :style="{ width: `${Math.min(value, 100)}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  value: number;
  variant?: 'success' | 'info' | 'warning' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'success',
});

const variantClass = computed(() => `progress__bar--${props.variant}`);
</script>

<style scoped>
.progress {
  margin-bottom: 1.5rem;
}

.progress:last-child {
  margin-bottom: 0;
}

.progress__header {
  display: flex;
  justify-content: space-between;
  color: var(--progress-header-color, #fff);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.progress__label {
  color: var(--progress-label-color, #94a3b8);
}

.progress__value {
  font-weight: 600;
}

.progress__bar {
  height: 8px;
  background: var(--progress-track-color, #2d2d44);
  border-radius: 4px;
  overflow: hidden;
}

.progress__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress__bar--success .progress__fill {
  background: var(--progress-success-color, #10b981);
}

.progress__bar--info .progress__fill {
  background: var(--progress-info-color, #3b82f6);
}

.progress__bar--warning .progress__fill {
  background: var(--progress-warning-color, #f59e0b);
}

.progress__bar--danger .progress__fill {
  background: var(--progress-danger-color, #ef4444);
}
</style>
