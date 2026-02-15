<template>
  <FeatureGuestsTable
    :guests="guests"
    :loading="loading"
  />
</template>

<script setup lang="ts">
import type { Guest } from '@/entities/guest';
import FeatureGuestsTable from '@/features/guest-management/ui/GuestsTable.vue';

withDefaults(
  defineProps<{
    guests: Guest[];
    loading?: boolean;
  }>(),
  {
    loading: false,
  }
);
</script>
