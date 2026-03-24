<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="admin-validation-overlay"
      @click.self="handleCancel"
    >
      <div class="admin-validation-modal">
        <!-- Header -->
        <div class="admin-validation__header">
          <div class="admin-validation__icon">⚠️</div>
          <button
            class="admin-validation__close"
            @click="handleCancel"
          >
            ×
          </button>
        </div>

        <!-- Conteúdo -->
        <div class="admin-validation__content">
          <h2 class="admin-validation__title">Validação Necessária</h2>

          <div
            v-if="guest"
            class="admin-validation__guest-info"
          >
            <p class="admin-validation__warning">
              Este convidado <strong>NÃO confirmou presença</strong> antecipadamente.
            </p>

            <div class="admin-validation__guest-card">
              <div class="admin-validation__detail">
                <span class="admin-validation__label">Nome:</span>
                <span class="admin-validation__value">
                  {{ guest.nome }}{{ guest.parceiro ? ` e ${guest.parceiro}` : '' }}
                </span>
              </div>
              <div class="admin-validation__detail">
                <span class="admin-validation__label">Código:</span>
                <span class="admin-validation__value">{{ guest.codigo }}</span>
              </div>
              <div class="admin-validation__detail">
                <span class="admin-validation__label">Status RSVP:</span>
                <span class="admin-validation__value admin-validation__value--warning">
                  Não confirmado
                </span>
              </div>
            </div>

            <div class="admin-validation__question">
              <p class="admin-validation__question-text">
                Deseja autorizar o check-in deste convidado?
              </p>
              <p class="admin-validation__question-subtext">
                Consulte o administrador (noivo) antes de prosseguir.
              </p>
            </div>
          </div>

          <!-- Mensagem de erro -->
          <div
            v-if="error"
            class="admin-validation__error"
          >
            {{ error }}
          </div>
        </div>

        <!-- Ações -->
        <div class="admin-validation__actions">
          <button
            class="admin-validation__button admin-validation__button--approve"
            :disabled="loading"
            @click="handleApprove"
          >
            <span v-if="loading">Autorizando...</span>
            <span v-else>✓ Autorizar Check-in</span>
          </button>
          <button
            class="admin-validation__button admin-validation__button--cancel"
            :disabled="loading"
            @click="handleCancel"
          >
            ✕ Recusar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Guest } from '@/entities/guest';

/**
 * Component: AdminValidationModal
 * Modal para validação do administrador quando convidado não confirmou presença
 */
const props = defineProps<{
  show: boolean;
  guest: Guest | null;
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: 'approve'): void;
  (e: 'cancel'): void;
}>();

const handleApprove = (): void => {
  emit('approve');
};

const handleCancel = (): void => {
  emit('cancel');
};
</script>

<style scoped>
.admin-validation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.admin-validation-modal {
  background: #ffffff;
  border-radius: 1rem;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.admin-validation__header {
  position: relative;
  padding: 1.5rem;
  text-align: center;
  border-bottom: 2px solid #fef3c7;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.admin-validation__icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.admin-validation__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  color: #78350f;
  font-size: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.admin-validation__close:hover {
  background: rgba(255, 255, 255, 0.8);
  color: #1a1a2e;
}

.admin-validation__content {
  padding: 1.5rem;
}

.admin-validation__title {
  font-size: 1.375rem;
  color: #1a1a2e;
  margin: 0 0 1.25rem;
  font-weight: 700;
  text-align: center;
}

.admin-validation__guest-info {
  margin-bottom: 1rem;
}

.admin-validation__warning {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 0.375rem;
  padding: 1rem;
  margin: 0 0 1.25rem;
  color: #78350f;
  font-size: 0.9rem;
  font-weight: 500;
}

.admin-validation__guest-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.admin-validation__detail {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.admin-validation__detail:last-child {
  border-bottom: none;
}

.admin-validation__label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.admin-validation__value {
  color: #1a1a2e;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: right;
}

.admin-validation__value--warning {
  color: #f59e0b;
}

.admin-validation__question {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 0.5rem;
  padding: 1.125rem;
  text-align: center;
}

.admin-validation__question-text {
  margin: 0 0 0.5rem;
  color: #1a1a2e;
  font-size: 1rem;
  font-weight: 600;
}

.admin-validation__question-subtext {
  margin: 0;
  color: #78350f;
  font-size: 0.8125rem;
  font-style: italic;
}

.admin-validation__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.875rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 1rem;
  text-align: center;
}

.admin-validation__actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.admin-validation__button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-validation__button--approve {
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.admin-validation__button--approve:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.admin-validation__button--approve:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-validation__button--cancel {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.admin-validation__button--cancel:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
}

.admin-validation__button--cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
