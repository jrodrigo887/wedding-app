<template>
  <div class="guests-stats">
    <StatsCard
      label="Total de Convidados"
      :value="stats.total"
    />
    <StatsCard
      label="Confirmados"
      :value="stats.confirmed"
      variant="success"
    />
    <StatsCard
      label="Pendentes"
      :value="stats.pending"
      variant="warning"
    />
    <StatsCard
      label="Check-ins"
      :value="stats.checkedIn"
      variant="info"
    />
  </div>
</template>

<script setup lang="ts">
import type { GuestStats } from '@/entities/guest';
import { StatsCard } from '@shared/ui';

interface Props {
  stats: GuestStats;
}

defineProps<Props>();
</script>

<style scoped>
.guests-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .guests-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .guests-stats {
    grid-template-columns: 1fr;
  }
}
</style>
