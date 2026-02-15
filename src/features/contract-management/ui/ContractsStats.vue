<template>
  <div class="contracts-stats">
    <StatsCard
      label="Total Valor"
      :value="stats.totalValor"
      format="currency"
    />
    <StatsCard
      label="Total Pago"
      :value="stats.totalPago"
      format="currency"
      variant="success"
    />
    <StatsCard
      label="Restante"
      :value="stats.totalRestante"
      format="currency"
      variant="warning"
    />
  </div>
</template>

<script setup lang="ts">
import type { ContractStats } from '@/entities/contract';
import { StatsCard } from '@shared/ui';

interface Props {
  stats: ContractStats;
}

defineProps<Props>();
</script>

<style scoped>
.contracts-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .contracts-stats {
    grid-template-columns: 1fr;
  }
}
</style>
