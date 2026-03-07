<template>
  <form
    class="contract-form"
    @submit.prevent="handleSubmit"
  >
    <div class="contract-form__group">
      <label class="contract-form__label">Responsável</label>
      <input
        v-model="form.responsavel"
        type="text"
        class="contract-form__input"
        placeholder="Nome do responsável"
      />
    </div>

    <div class="contract-form__group">
      <label class="contract-form__label">Empresa</label>
      <input
        v-model="form.empresa"
        type="text"
        class="contract-form__input"
        placeholder="Nome da empresa"
      />
    </div>

    <div class="contract-form__group">
      <label class="contract-form__label">Contato</label>
      <input
        v-model="form.contato"
        type="text"
        class="contract-form__input"
        placeholder="Telefone ou email"
      />
    </div>

    <div class="contract-form__row">
      <div class="contract-form__group">
        <label class="contract-form__label">Valor (R$)</label>
        <input
          v-model="form.valor"
          type="number"
          step="0.01"
          min="0"
          class="contract-form__input"
          placeholder="0,00"
        />
      </div>

      <div class="contract-form__group">
        <label class="contract-form__label">Pago (R$)</label>
        <input
          v-model="form.pago"
          type="number"
          step="0.01"
          min="0"
          class="contract-form__input"
          placeholder="0,00"
        />
      </div>
    </div>

    <div class="contract-form__actions">
      <BaseButton
        variant="secondary"
        @click="$emit('cancel')"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        type="submit"
        :loading="loading"
      >
        {{ isEditing ? 'Salvar' : 'Criar' }}
      </BaseButton>
    </div>

    <p
      v-if="error"
      class="contract-form__error"
    >
      {{ error }}
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Contract, ContractForm as ContractFormType } from '@/entities/contract';
import { createEmptyContract } from '@/entities/contract';
import { BaseButton } from '@shared/ui';

interface Props {
  contract?: Contract | null;
  loading?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  contract: null,
  loading: false,
  error: '',
});

const emit = defineEmits<{
  submit: [form: ContractFormType];
  cancel: [];
}>();

const form = ref<ContractFormType>(createEmptyContract());
const isEditing = ref(false);

watch(
  () => props.contract,
  contract => {
    if (contract) {
      isEditing.value = true;
      form.value = {
        responsavel: contract.responsavel || '',
        empresa: contract.empresa || '',
        contato: contract.contato?.toString() ?? '',
        valor: contract.valor ?? '',
        pago: contract.pago ?? '',
      };
    } else {
      isEditing.value = false;
      form.value = createEmptyContract();
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  emit('submit', { ...form.value });
};
</script>

<style scoped>
.contract-form__group {
  margin-bottom: 1rem;
}

.contract-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.contract-form__label {
  display: block;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.contract-form__input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #0f0f1a;
  border: 1px solid #2d2d44;
  border-radius: 0.5rem;
  color: #fff;
  font-size: 0.9375rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.contract-form__input:focus {
  outline: none;
  border-color: #3b82f6;
}

.contract-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.contract-form__error {
  color: #ef4444;
  text-align: center;
  margin: 1rem 0 0;
  font-size: 0.875rem;
}

@media (max-width: 480px) {
  .contract-form__row {
    grid-template-columns: 1fr;
  }
}
</style>
