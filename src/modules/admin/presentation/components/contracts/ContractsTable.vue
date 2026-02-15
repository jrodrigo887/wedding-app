<template>
  <FeatureContractsTable
    :contracts="contracts"
    :loading="loading"
    @edit="emit('edit', $event)"
    @delete="emit('delete', $event)"
  />
</template>

<script setup lang="ts">
import type { Contract } from '@/entities/contract';
import FeatureContractsTable from '@/features/contract-management/ui/ContractsTable.vue';

withDefaults(
  defineProps<{
    contracts: Contract[];
    loading?: boolean;
  }>(),
  {
    loading: false,
  }
);

const emit = defineEmits<{
  edit: [contract: Contract];
  delete: [contract: Contract];
}>();
</script>
