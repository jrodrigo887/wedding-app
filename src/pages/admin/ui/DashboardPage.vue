<template>
  <div class="dashboard">
    <section class="dashboard__section">
      <h2 class="dashboard__section-title">Convidados</h2>
      <GuestsStats :stats="guestsStore.stats" />

      <div class="dashboard__progress">
        <ProgressBar
          label="Taxa de Confirmação"
          :value="guestsStore.confirmationRate"
          variant="success"
        />
        <ProgressBar
          label="Taxa de Check-in"
          :value="guestsStore.checkinRate"
          variant="info"
        />
      </div>
    </section>

    <section class="dashboard__section">
      <h2 class="dashboard__section-title">Contratos</h2>
      <ContractsStats :stats="contractsStore.stats" />
    </section>

    <section class="dashboard__section">
      <div class="dashboard__section-header">
        <h2 class="dashboard__section-title">Últimos Check-ins</h2>
        <router-link
          to="/admin/convidados"
          class="dashboard__link"
        >
          Ver todos
        </router-link>
      </div>
      <div class="dashboard__card">
        <CheckinsList
          :guests="recentCheckins"
          :loading="guestsStore.loading"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGuestsStore, GuestsStats, CheckinsList } from '@/features/guest-management';
import { useContractsStore, ContractsStats } from '@/features/contract-management';
import { ProgressBar } from '@shared/ui';

const guestsStore = useGuestsStore();
const contractsStore = useContractsStore();

const recentCheckins = computed(() => {
  return guestsStore.checkedInGuests.slice(0, 5);
});

onMounted(async () => {
  await Promise.all([guestsStore.fetchAll(), contractsStore.fetchContracts()]);
});
</script>

<style scoped>
.dashboard__section {
  margin-bottom: 2rem;
}

.dashboard__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dashboard__section-title {
  color: #fff;
  font-size: 1.125rem;
  margin: 0 0 1rem;
  font-weight: 600;
}

.dashboard__section-header .dashboard__section-title {
  margin-bottom: 0;
}

.dashboard__link {
  color: #3b82f6;
  font-size: 0.875rem;
  text-decoration: none;
}

.dashboard__link:hover {
  text-decoration: underline;
}

.dashboard__progress {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #1a1a2e;
  border-radius: 0.75rem;
}

.dashboard__card {
  background: #1a1a2e;
  border-radius: 0.75rem;
  padding: 1rem;
}
</style>
