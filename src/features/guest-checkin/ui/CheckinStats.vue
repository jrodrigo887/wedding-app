<template>
  <div class="checkin-stats">
    <div class="checkin-stats__item">
      <span class="checkin-stats__number">{{ count }}</span>
      <span class="checkin-stats__label">Check-ins realizados</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Component: CheckinStats
 * Exibe estatísticas de check-in
 */
defineProps<{
  count: number;
}>();
</script>

<style scoped>
.checkin-stats {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.checkin-stats__item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem 2rem;
  text-align: center;
}

.checkin-stats__number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #10b981;
}

.checkin-stats__label {
  font-size: 0.85rem;
  color: #a0aec0;
}
</style>
