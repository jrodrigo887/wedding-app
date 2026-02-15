<template>
  <div class="checkins-list">
    <div
      v-if="loading"
      class="checkins-list__loading"
    >
      Carregando...
    </div>
    <div
      v-else-if="guests.length === 0"
      class="checkins-list__empty"
    >
      Nenhum check-in realizado ainda.
    </div>
    <div
      v-else
      class="checkins-list__items"
    >
      <div
        v-for="guest in guests"
        :key="guest.codigo"
        class="checkins-list__item"
      >
        <div class="checkins-list__info">
          <span class="checkins-list__name">
            {{ guest.nome }}{{ guest.parceiro ? ` e ${guest.parceiro}` : '' }}
          </span>
          <span class="checkins-list__code">{{ guest.codigo }}</span>
        </div>
        <span class="checkins-list__time">
          {{ formatTime(guest.horario_entrada) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Guest } from '@/entities/guest';

interface Props {
  guests: Guest[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

const formatTime = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.checkins-list__loading,
.checkins-list__empty {
  color: #64748b;
  text-align: center;
  padding: 3rem;
}

.checkins-list__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkins-list__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background: #0f0f1a;
  border-radius: 0.5rem;
}

.checkins-list__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.checkins-list__name {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
}

.checkins-list__code {
  color: #64748b;
  font-size: 0.75rem;
  font-family: monospace;
}

.checkins-list__time {
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
