<template>
  <FeatureGuestsStats :stats="stats" />
</template>

<script setup lang="ts">
import type { GuestStats } from '@/entities/guest';
import FeatureGuestsStats from '@/features/guest-management/ui/GuestsStats.vue';

defineProps<{
  stats: GuestStats;
}>();
</script>
