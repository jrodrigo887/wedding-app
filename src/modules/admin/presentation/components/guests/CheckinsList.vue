<template>
  <FeatureCheckinsList
    :guests="guests"
    :loading="loading"
  />
</template>

<script setup lang="ts">
import type { Guest } from '@/entities/guest';
import FeatureCheckinsList from '@/features/guest-management/ui/CheckinsList.vue';

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
