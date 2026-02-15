<template>
  <div class="guests-view">
    <header class="guests-view__header">
      <h1 class="guests-view__title">Convidados</h1>
    </header>

    <GuestsStats :stats="guestsStore.stats" />

    <div class="guests-view__tabs">
      <button
        class="guests-view__tab"
        :class="{ 'guests-view__tab--active': activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        Visão Geral
      </button>
      <button
        class="guests-view__tab"
        :class="{ 'guests-view__tab--active': activeTab === 'lista' }"
        @click="handleListaTab"
      >
        Lista ({{ guestsStore.stats.total }})
      </button>
      <button
        class="guests-view__tab"
        :class="{ 'guests-view__tab--active': activeTab === 'checkins' }"
        @click="activeTab = 'checkins'"
      >
        Check-ins ({{ guestsStore.stats.checkedIn }})
      </button>
    </div>

    <div class="guests-view__content">
      <!-- Overview Tab -->
      <div
        v-if="activeTab === 'overview'"
        class="guests-view__card"
      >
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

      <!-- Lista Tab -->
      <div
        v-if="activeTab === 'lista'"
        class="guests-view__card"
      >
        <GuestsTable
          :guests="guestsStore.guests"
          :loading="guestsStore.loading"
        />
      </div>

      <!-- Checkins Tab -->
      <div
        v-if="activeTab === 'checkins'"
        class="guests-view__card"
      >
        <CheckinsList
          :guests="guestsStore.checkedInGuests"
          :loading="guestsStore.loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGuestsStore, GuestsStats, CheckinsList, GuestsTable } from '@/features/guest-management';
import { ProgressBar } from '@shared/ui';

const guestsStore = useGuestsStore();
const activeTab = ref<'overview' | 'lista' | 'checkins'>('overview');

const handleListaTab = async () => {
  activeTab.value = 'lista';
  if (!guestsStore.hasData) {
    await guestsStore.fetchGuests();
  }
};

onMounted(async () => {
  await guestsStore.fetchAll();
});
</script>

<style scoped>
.guests-view__header {
  margin-bottom: 1.5rem;
}

.guests-view__title {
  color: #fff;
  font-size: 1.5rem;
  margin: 0;
}

.guests-view__tabs {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0 1rem;
}

.guests-view__tab {
  flex: 1;
  padding: 0.75rem;
  background: #1a1a2e;
  border: none;
  border-radius: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.guests-view__tab:hover {
  color: #fff;
}

.guests-view__tab--active {
  background: #3b82f6;
  color: #fff;
}

.guests-view__content {
  min-height: 200px;
}

.guests-view__card {
  background: #1a1a2e;
  border-radius: 0.75rem;
  padding: 1.25rem;
}
</style>
