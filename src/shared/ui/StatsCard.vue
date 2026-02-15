<template>
  <div
    class="stats-card"
    :class="variantClass"
  >
    <span class="stats-card__label">{{ label }}</span>
    <span class="stats-card__value">{{ formattedValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  value: number | string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  format?: 'number' | 'currency' | 'percent';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  format: 'number',
});

const variantClass = computed(() => `stats-card--${props.variant}`);

const formattedValue = computed(() => {
  const val = Number(props.value);

  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(val);
    case 'percent':
      return `${val}%`;
    default:
      return val.toLocaleString('pt-BR');
  }
});
</script>

<style scoped>
.stats-card {
  background: var(--stats-card-bg, #1a1a2e);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  border-left: 3px solid var(--stats-card-border, #64748b);
}

.stats-card--default {
  border-left-color: var(--stats-card-default-border, #64748b);
}

.stats-card--success {
  border-left-color: var(--stats-card-success-border, #10b981);
}

.stats-card--warning {
  border-left-color: var(--stats-card-warning-border, #f59e0b);
}

.stats-card--info {
  border-left-color: var(--stats-card-info-border, #3b82f6);
}

.stats-card--danger {
  border-left-color: var(--stats-card-danger-border, #ef4444);
}

.stats-card__label {
  display: block;
  font-size: 0.75rem;
  color: var(--stats-card-label-color, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stats-card__value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--stats-card-value-color, #fff);
}

@media (max-width: 640px) {
  .stats-card__value {
    font-size: 1.25rem;
  }
}
</style>
