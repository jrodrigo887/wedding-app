<template>
  <FeatureContractsStats :stats="stats" />
</template>

<script setup lang="ts">
import type { ContractStats } from '@/entities/contract';
import FeatureContractsStats from '@/features/contract-management/ui/ContractsStats.vue';

defineProps<{
  stats: ContractStats;
}>();
</script>
