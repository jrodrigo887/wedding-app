<template>
  <FeatureContractForm
    :contract="contract"
    :loading="loading"
    :error="error"
    @submit="emit('submit', $event)"
    @cancel="emit('cancel')"
  />
</template>

<script setup lang="ts">
import type { Contract, ContractForm as ContractFormType } from '@/entities/contract';
import FeatureContractForm from '@/features/contract-management/ui/ContractForm.vue';

withDefaults(
  defineProps<{
    contract?: Contract | null;
    loading?: boolean;
    error?: string;
  }>(),
  {
    contract: null,
    loading: false,
    error: '',
  }
);

const emit = defineEmits<{
  submit: [form: ContractFormType];
  cancel: [];
}>();
</script>
