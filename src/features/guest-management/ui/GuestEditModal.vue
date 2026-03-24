<template>
  <div
    v-if="isOpen"
    class="modal-overlay"
    @click.self="handleClose"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Editar Convidado</h2>
        <button
          class="modal-close"
          @click="handleClose"
        >
          ×
        </button>
      </div>

      <form
        class="modal-form"
        @submit.prevent="handleSubmit"
      >
        <div class="form-group">
          <label
            for="codigo"
            class="form-label"
          >Código</label>
          <input
            id="codigo"
            v-model="formData.codigo"
            type="text"
            class="form-input"
            required
          >
        </div>

        <div class="form-group">
          <label
            for="nome"
            class="form-label"
          >Nome</label>
          <input
            id="nome"
            v-model="formData.nome"
            type="text"
            class="form-input"
            required
          >
        </div>

        <div class="form-group">
          <label
            for="parceiro"
            class="form-label"
          >Parceiro (opcional)</label>
          <input
            id="parceiro"
            v-model="formData.parceiro"
            type="text"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label
            for="email"
            class="form-label"
          >Email (opcional)</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label
            for="telefone"
            class="form-label"
          >Telefone (opcional)</label>
          <input
            id="telefone"
            v-model="formData.telefone"
            type="tel"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label
            for="acompanhantes"
            class="form-label"
          >Acompanhantes</label>
          <input
            id="acompanhantes"
            v-model.number="formData.acompanhantes"
            type="number"
            min="0"
            class="form-input"
            required
          >
        </div>

        <div class="form-group">
          <label
            for="observacoes"
            class="form-label"
          >Observações (opcional)</label>
          <textarea
            id="observacoes"
            v-model="formData.observacoes"
            class="form-textarea"
            rows="3"
          />
        </div>

        <div class="form-group-checkbox">
          <label class="checkbox-label">
            <input
              v-model="formData.confirmado"
              type="checkbox"
              class="form-checkbox"
            >
            <span>Confirmado</span>
          </label>
        </div>

        <div class="form-group-checkbox">
          <label class="checkbox-label">
            <input
              v-model="formData.recusou"
              type="checkbox"
              class="form-checkbox"
            >
            <span>Recusou</span>
          </label>
        </div>

        <div class="form-group-checkbox">
          <label class="checkbox-label">
            <input
              v-model="formData.checkin"
              type="checkbox"
              class="form-checkbox"
            >
            <span>Check-in realizado</span>
          </label>
        </div>

        <div
          v-if="error"
          class="form-error"
        >
          {{ error }}
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="handleClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="saving"
          >
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Guest } from '@/entities/guest';

/**
 * Component: GuestEditModal
 * Modal para editar informações do convidado
 */
const props = defineProps<{
  isOpen: boolean;
  guest: Guest | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', id: number, data: Partial<Guest>): void;
}>();

const formData = ref({
  codigo: '',
  nome: '',
  parceiro: '',
  email: '',
  telefone: '',
  acompanhantes: 0,
  observacoes: '',
  confirmado: false,
  recusou: false,
  checkin: false,
});

const saving = ref(false);
const error = ref<string | null>(null);

// Preenche o formulário quando o modal abre com um convidado
watch(
  () => props.guest,
  (guest) => {
    if (guest) {
      formData.value = {
        codigo: guest.codigo,
        nome: guest.nome,
        parceiro: guest.parceiro || '',
        email: guest.email || '',
        telefone: guest.telefone || '',
        acompanhantes: guest.acompanhantes,
        observacoes: guest.observacoes || '',
        confirmado: guest.confirmado,
        recusou: guest.recusou || false,
        checkin: guest.checkin || false,
      };
    }
  },
  { immediate: true }
);

const handleClose = (): void => {
  if (!saving.value) {
    error.value = null;
    emit('close');
  }
};

const handleSubmit = async (): Promise<void> => {
  if (!props.guest?.id) return;

  saving.value = true;
  error.value = null;

  try {
    emit('save', props.guest.id, {
      codigo: formData.value.codigo,
      nome: formData.value.nome,
      parceiro: formData.value.parceiro || undefined,
      email: formData.value.email || undefined,
      telefone: formData.value.telefone || undefined,
      acompanhantes: formData.value.acompanhantes,
      observacoes: formData.value.observacoes || undefined,
      confirmado: formData.value.confirmado,
      recusou: formData.value.recusou,
      checkin: formData.value.checkin,
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao salvar';
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #1e1e36;
  border-radius: 0.5rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #2d2d44;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.15s;
}

.modal-close:hover {
  background: #2d2d44;
  color: #e2e8f0;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  background: #16162a;
  border: 1px solid #2d2d44;
  border-radius: 0.375rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #1a1a2e;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-group-checkbox {
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  color: #e2e8f0;
  font-size: 0.875rem;
  cursor: pointer;
}

.form-checkbox {
  width: 1.125rem;
  height: 1.125rem;
  margin-right: 0.5rem;
  cursor: pointer;
  accent-color: #3b82f6;
}

.form-error {
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.375rem;
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #2d2d44;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}

.btn-secondary {
  background: #2d2d44;
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: #3d3d54;
}

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
