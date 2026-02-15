<template>
  <div class="contracts-view">
    <header class="contracts-view__header">
      <h1 class="contracts-view__title">Contratos</h1>
      <BaseButton
        variant="success"
        size="sm"
        @click="openModal()"
      >
        + Novo Contrato
      </BaseButton>
    </header>

    <ContractsStats :stats="contractsStore.stats" />

    <div class="contracts-view__table">
      <ContractsTable
        :contracts="contractsStore.contracts"
        :loading="contractsStore.loading"
        @edit="openModal"
        @delete="confirmDelete"
      />
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal
      :show="showModal"
      :title="editingContract ? 'Editar Contrato' : 'Novo Contrato'"
      @close="closeModal"
    >
      <ContractFormComponent
        :contract="editingContract"
        :loading="saving"
        :error="formError"
        @submit="handleSave"
        @cancel="closeModal"
      />
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      :show="showDeleteModal"
      title="Confirmar Exclusão"
      size="sm"
      @close="showDeleteModal = false"
    >
      <p class="contracts-view__delete-message">
        Deseja realmente excluir o contrato de
        <strong>{{
          deletingContract?.empresa || deletingContract?.responsavel || 'sem nome'
        }}</strong
        >?
      </p>
      <template #footer>
        <BaseButton
          variant="secondary"
          @click="showDeleteModal = false"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="danger"
          :loading="deleting"
          @click="handleDelete"
        >
          Excluir
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Contract, ContractForm as ContractFormType } from '@/entities/contract';
import { useContractsStore, ContractsStats, ContractsTable, ContractFormComponent } from '@/features/contract-management';
import { BaseModal, BaseButton } from '@shared/ui';

const contractsStore = useContractsStore();

// Modal state
const showModal = ref(false);
const editingContract = ref<Contract | null>(null);
const saving = ref(false);
const formError = ref('');

// Delete state
const showDeleteModal = ref(false);
const deletingContract = ref<Contract | null>(null);
const deleting = ref(false);

const openModal = (contract?: Contract) => {
  editingContract.value = contract || null;
  formError.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingContract.value = null;
  formError.value = '';
};

const handleSave = async (form: ContractFormType) => {
  saving.value = true;
  formError.value = '';

  try {
    if (editingContract.value?.id) {
      await contractsStore.updateContract(editingContract.value.id, form);
    } else {
      await contractsStore.createContract(form);
    }
    closeModal();
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Erro ao salvar contrato';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (contract: Contract) => {
  deletingContract.value = contract;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!deletingContract.value?.id) return;

  deleting.value = true;
  try {
    await contractsStore.deleteContract(deletingContract.value.id);
    showDeleteModal.value = false;
    deletingContract.value = null;
  } catch (err) {
    console.error('Erro ao excluir contrato:', err);
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  await contractsStore.fetchContracts();
});
</script>

<style scoped>
.contracts-view__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.contracts-view__title {
  color: #fff;
  font-size: 1.5rem;
  margin: 0;
}

.contracts-view__table {
  margin-top: 1.5rem;
}

.contracts-view__delete-message {
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
}

.contracts-view__delete-message strong {
  color: #fff;
}
</style>
