<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="confirm-modal-overlay"
      @click.self="handleCancel"
    >
      <div class="confirm-modal">
        <!-- Header -->
        <div class="confirm-modal__header">
          <div class="confirm-modal__icon">
            {{ guest?.checkin ? '✅' : '👤' }}
          </div>
          <button
            class="confirm-modal__close"
            @click="handleCancel"
          >
            ×
          </button>
        </div>

        <!-- Conteúdo -->
        <div
          v-if="guest"
          class="confirm-modal__content"
        >
          <h2 class="confirm-modal__name">
            {{ guest.nome }}{{ guest.parceiro ? ` e ${guest.parceiro}` : '' }}
          </h2>

          <div class="confirm-modal__details">
            <div class="confirm-modal__detail">
              <span class="confirm-modal__label">Código:</span>
              <span class="confirm-modal__value">{{ guest.codigo }}</span>
            </div>
            <div class="confirm-modal__detail">
              <span class="confirm-modal__label">RSVP:</span>
              <span
                class="confirm-modal__value"
                :class="
                  guest.confirmado
                    ? 'confirm-modal__value--confirmed'
                    : 'confirm-modal__value--pending'
                "
              >
                {{ guest.confirmado ? 'Confirmado' : 'Não confirmado' }}
              </span>
            </div>
            <div class="confirm-modal__detail">
              <span class="confirm-modal__label">Check-in:</span>
              <span
                class="confirm-modal__value"
                :class="
                  guest.checkin
                    ? 'confirm-modal__value--confirmed'
                    : 'confirm-modal__value--pending'
                "
              >
                {{ guest.checkin ? 'Realizado' : 'Pendente' }}
              </span>
            </div>
          </div>

          <!-- Mensagem de check-in já realizado -->
          <div
            v-if="guest.checkin"
            class="confirm-modal__already"
          >
            <p class="confirm-modal__already-text">
              Check-in já realizado{{
                guest.horario_entrada ? ` às ${formatTime(guest.horario_entrada)}` : ''
              }}
            </p>
          </div>

          <!-- Mensagem de sucesso -->
          <div
            v-if="success"
            class="confirm-modal__success"
          >
            <div class="confirm-modal__success-icon">🎉</div>
            <p class="confirm-modal__success-text">Check-in realizado com sucesso!</p>
          </div>

          <!-- Mensagem de erro -->
          <div
            v-if="error"
            class="confirm-modal__error"
          >
            {{ error }}
          </div>
        </div>

        <!-- Ações -->
        <div
          v-if="!success"
          class="confirm-modal__actions"
        >
          <button
            v-if="!guest?.checkin"
            class="confirm-modal__button confirm-modal__button--primary"
            :disabled="loading"
            @click="handleConfirm"
          >
            <span v-if="loading">Registrando...</span>
            <span v-else>✓ Confirmar Check-in</span>
          </button>
          <button
            class="confirm-modal__button confirm-modal__button--secondary"
            :disabled="loading"
            @click="handleCancel"
          >
            {{ guest?.checkin ? 'Fechar' : 'Cancelar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Guest } from '@/entities/guest';

/**
 * Component: CheckinConfirmModal
 * Modal para confirmar check-in do convidado escaneado
 */
const props = defineProps<{
  show: boolean;
  guest: Guest | null;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleConfirm = (): void => {
  emit('confirm');
};

const handleCancel = (): void => {
  emit('cancel');
};
</script>

<style scoped>
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
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

.confirm-modal {
  background: #ffffff;
  border-radius: 1rem;
  max-width: 400px;
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

.confirm-modal__header {
  position: relative;
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

.confirm-modal__icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.confirm-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  font-size: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.confirm-modal__close:hover {
  background: #e2e8f0;
  color: #1a1a2e;
}

.confirm-modal__content {
  padding: 1.5rem;
}

.confirm-modal__name {
  font-size: 1.25rem;
  color: #1a1a2e;
  margin: 0 0 1.25rem;
  font-weight: 600;
  text-align: center;
}

.confirm-modal__details {
  margin-bottom: 1rem;
}

.confirm-modal__detail {
  display: flex;
  justify-content: space-between;
  padding: 0.625rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.confirm-modal__detail:last-child {
  border-bottom: none;
}

.confirm-modal__label {
  color: #64748b;
  font-size: 0.9rem;
}

.confirm-modal__value {
  color: #1a1a2e;
  font-weight: 600;
  font-size: 0.9rem;
}

.confirm-modal__value--confirmed {
  color: #10b981;
}

.confirm-modal__value--pending {
  color: #f59e0b;
}

.confirm-modal__already {
  background: #d1fae5;
  border-radius: 0.5rem;
  padding: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
}

.confirm-modal__already-text {
  margin: 0;
  color: #065f46;
  font-size: 0.875rem;
  font-weight: 500;
}

.confirm-modal__success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 0.5rem;
  padding: 1.25rem;
  text-align: center;
  margin-bottom: 1rem;
  animation: successPulse 0.5s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.confirm-modal__success-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.confirm-modal__success-text {
  margin: 0;
  color: #065f46;
  font-size: 1rem;
  font-weight: 600;
}

.confirm-modal__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.875rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
}

.confirm-modal__actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.confirm-modal__button {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-modal__button--primary {
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.confirm-modal__button--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.confirm-modal__button--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-modal__button--secondary {
  color: #64748b;
  background: #f1f5f9;
}

.confirm-modal__button--secondary:hover:not(:disabled) {
  background: #e2e8f0;
  color: #1a1a2e;
}

.confirm-modal__button--secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
