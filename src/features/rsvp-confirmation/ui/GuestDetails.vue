<template>
  <div class="guest-details">
    <div class="guest-details__icon">{{ icon }}</div>
    <h2 class="guest-details__greeting">
      Olá, {{ guest.nome }}{{ guest.parceiro ? ` e ${guest.parceiro}` : '' }}!
    </h2>

    <div class="guest-details__info">
      <div class="guest-details__item">
        <span class="guest-details__label">Código:</span>
        <span class="guest-details__value">{{ guest.codigo }}</span>
      </div>

      <div
        v-if="guest.acompanhantes > 0"
        class="guest-details__item"
      >
        <span class="guest-details__label">Acompanhantes:</span>
        <span class="guest-details__value">{{ guest.acompanhantes }}</span>
      </div>

      <div class="guest-details__item">
        <span class="guest-details__label">Total de pessoas:</span>
        <span class="guest-details__value">{{ totalPeople }}</span>
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RsvpGuest } from '@/entities/guest';

const props = withDefaults(
  defineProps<{
    guest: RsvpGuest;
    icon?: string;
  }>(),
  {
    icon: '👋',
  }
);

const totalPeople = computed(() => {
  const hasParceiro = props.guest.parceiro ? 1 : 0;
  return 1 + hasParceiro + (Number(props.guest.acompanhantes) || 0);
});
</script>

<style scoped>
.guest-details__icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.guest-details__greeting {
  font-size: 1.3rem;
  color: #3d2b1f;
  margin: 0 0 1.5rem;
}

.guest-details__info {
  background: #fff9f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.guest-details__item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e8dcc8;
}

.guest-details__item:last-child {
  border-bottom: none;
}

.guest-details__label {
  color: #8b7355;
  font-size: 0.9rem;
}

.guest-details__value {
  color: #3d2b1f;
  font-weight: 600;
}
</style>
