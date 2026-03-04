<template>
  <div class="rsvp-page">
    <div class="rsvp-container">
      <!-- Header -->
      <header class="rsvp-header">
        <div class="rsvp-header__icon">💒</div>
        <h1 class="rsvp-header__title">Confirmação de Presença</h1>
        <p class="rsvp-header__subtitle">
          {{ APP_CONFIG.BRIDE_NAME }} & {{ APP_CONFIG.GROOM_NAME }}
        </p>
      </header>

      <!-- Form de busca por código -->
      <RsvpCard v-if="!store.currentGuest && !store.confirmed && !store.declined">
        <CodeInput
          v-model="code"
          :loading="store.loading"
          :error="store.error ?? undefined"
          @submit="checkCode"
        />
      </RsvpCard>

      <!-- Dados do convidado encontrado -->
      <RsvpCard v-if="store.currentGuest && !store.confirmed && !store.declined">
        <GuestDetails :guest="store.currentGuest">
          <!-- Já confirmado -->
          <div
            v-if="store.currentGuest.confirmado"
            class="rsvp-already-confirmed"
          >
            <span class="rsvp-already-confirmed__check">✅</span>
            <p>Sua presença já foi confirmada anteriormente!</p>
            <button
              class="rsvp-already-confirmed__cancel-link"
              @click="showCancelModal = true"
            >
              Cancelar presença
            </button>
          </div>

          <!-- Não confirmado -->
          <div
            v-else
            class="rsvp-actions"
          >
            <p class="rsvp-actions__text">Deseja confirmar sua presença no casamento?</p>
            <div class="rsvp-actions__buttons">
              <button
                class="rsvp-actions__confirm-button"
                :disabled="confirming"
                @click="confirmPresence"
              >
                <span v-if="confirming">Confirmando...</span>
                <span v-else>Confirmar Presença</span>
              </button>
              <button
                class="rsvp-actions__decline-button"
                :disabled="confirming"
                @click="showDeclineModal = true"
              >
                Não poderei ir
              </button>
            </div>
          </div>

          <button
            class="rsvp-back-button"
            @click="reset"
          >
            ← Voltar
          </button>
        </GuestDetails>
      </RsvpCard>

      <!-- Confirmação bem-sucedida -->
      <RsvpCard
        v-if="store.confirmed"
        class="rsvp-success"
      >
        <div class="rsvp-success__icon">🎉</div>
        <h2 class="rsvp-success__title">Presença Confirmada!</h2>
        <p class="rsvp-success__message">
          {{ store.confirmationMessage }}
        </p>

        <QRCodeDisplay
          :code="getFullCode()"
          :data-url="qrCodeDataUrl"
          :loading="qrCodeLoading"
          :show-email-form="true"
          v-model:email="guestEmail"
          :email-sending="emailSending"
          :email-sent="emailSent"
          :email-error="emailError"
          @download="downloadQRCode"
          @send-email="sendQRCodeByEmail"
        />

        <p class="rsvp-success__see-you">Nos vemos no grande dia!</p>
        <p class="rsvp-success__date">{{ formattedWeddingDate }}</p>

        <div class="rsvp-success__actions">
          <button
            class="rsvp-success__button"
            @click="reset"
          >
            Nova Confirmação
          </button>
          <router-link
            to="/"
            class="rsvp-success__link"
          >
            Ver Lista de Presentes →
          </router-link>
        </div>
      </RsvpCard>

      <!-- Modal de Cancelamento -->
      <RsvpModal
        :show="showCancelModal"
        title="Cancelar Presença"
        icon="⚠️"
        @close="showCancelModal = false"
      >
        <template #message> Tem certeza que deseja cancelar sua presença no casamento? </template>
        <template #warning>
          Esta ação irá remover sua confirmação e você precisará confirmar novamente caso mude de
          ideia.
        </template>
        <template #actions>
          <button
            class="btn-secondary"
            :disabled="cancelling"
            @click="showCancelModal = false"
          >
            Voltar
          </button>
          <button
            class="btn-danger"
            :disabled="cancelling"
            @click="cancelPresence"
          >
            <span v-if="cancelling">Cancelando...</span>
            <span v-else>Confirmar Cancelamento</span>
          </button>
        </template>
      </RsvpModal>

      <!-- Modal de Não Comparecimento -->
      <RsvpModal
        :show="showDeclineModal"
        title="Não poderei comparecer"
        icon="😢"
        @close="showDeclineModal = false"
      >
        <template #message>
          Que pena que você não poderá estar presente no nosso casamento!
        </template>
        <template #info>
          Ao confirmar, registraremos que você não poderá comparecer. Caso mude de ideia, você pode
          confirmar sua presença a qualquer momento.
        </template>
        <template #actions>
          <button
            class="btn-secondary"
            :disabled="cancelling"
            @click="showDeclineModal = false"
          >
            Voltar
          </button>
          <button
            class="btn-danger"
            :disabled="cancelling"
            @click="declinePresence"
          >
            <span v-if="cancelling">Registrando...</span>
            <span v-else>Confirmar Ausência</span>
          </button>
        </template>
      </RsvpModal>

      <!-- Tela de Ausência Registrada -->
      <RsvpCard
        v-if="store.declined"
        class="rsvp-declined"
      >
        <div class="rsvp-declined__icon">📝</div>
        <h2 class="rsvp-declined__title">Ausência Registrada</h2>
        <p class="rsvp-declined__message">
          Registramos que você não poderá comparecer ao casamento.
        </p>
        <p class="rsvp-declined__note">
          Sentiremos sua falta! Caso mude de ideia, você pode confirmar sua presença a qualquer
          momento.
        </p>

        <div class="rsvp-declined__actions">
          <button
            class="rsvp-declined__button"
            @click="reset"
          >
            Voltar ao início
          </button>
          <router-link
            to="/"
            class="rsvp-declined__link"
          >
            Ver Lista de Presentes →
          </router-link>
        </div>
      </RsvpCard>

      <!-- Link para lista de presentes -->
      <footer class="rsvp-footer">
        <router-link
          to="/"
          class="rsvp-footer__link"
        >
          🎁 Ver Lista de Presentes
        </router-link>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { APP_CONFIG } from '@shared/config/constants';
import { useNotification } from '@shared/utils/useNotification';
import {
  useRsvpStore,
  qrcodeService,
  CodeInput,
  GuestDetails,
  QRCodeDisplay,
  RsvpModal,
  RsvpCard,
} from '@/features/rsvp-confirmation';

/**
 * Widget: RsvpPanel
 * Orquestra o fluxo completo de confirmação de presença (RSVP)
 */

// Store
const store = useRsvpStore();

// Local state
const code = ref('');
const confirming = ref(false);
const cancelling = ref(false);
const showCancelModal = ref(false);
const showDeclineModal = ref(false);

// QR Code state
const qrCodeDataUrl = ref('');
const qrCodeLoading = ref(false);
const guestEmail = ref('');
const emailSending = ref(false);
const emailSent = ref(false);
const emailError = ref('');

const notification = useNotification();

// Computed
const formattedWeddingDate = computed(() => {
  const date = new Date(APP_CONFIG.WEDDING_DATE + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

// Methods
const getFullCode = (): string => {
  return 'RE' + code.value.trim();
};

const checkCode = async (): Promise<void> => {
  if (!code.value.trim()) return;

  try {
    await store.checkGuestCode(getFullCode());
  } catch {
    // Error is handled by store
  }
};

const confirmPresence = async (): Promise<void> => {
  if (!store.currentGuest) return;

  confirming.value = true;

  try {
    await store.confirmPresence(getFullCode());
    await generateQRCode();
  } catch {
    // Error is handled by store
  } finally {
    confirming.value = false;
  }
};

const cancelPresence = async (): Promise<void> => {
  if (!store.currentGuest) return;

  cancelling.value = true;

  try {
    await store.cancelPresence(getFullCode());
    showCancelModal.value = false;
  } catch {
    showCancelModal.value = false;
  } finally {
    cancelling.value = false;
  }
};

const declinePresence = async (): Promise<void> => {
  if (!store.currentGuest) return;

  cancelling.value = true;

  try {
    await store.declinePresence(getFullCode());
    showDeclineModal.value = false;
  } catch {
    showDeclineModal.value = false;
  } finally {
    cancelling.value = false;
  }
};

// QR Code Methods
const generateQRCode = async (): Promise<void> => {
  qrCodeLoading.value = true;
  try {
    qrCodeDataUrl.value = await qrcodeService.generateWeddingQRCode(getFullCode());
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err);
  } finally {
    qrCodeLoading.value = false;
  }
};

const downloadQRCode = (): void => {
  if (qrCodeDataUrl.value) {
    const guestName = store.currentGuest?.nome || 'convidado';
    qrcodeService.downloadQRCode(qrCodeDataUrl.value, `qrcode-${guestName}.png`);
  }
};

const sendQRCodeByEmail = async (): Promise<void> => {
  if (!guestEmail.value.trim()) {
    emailError.value = 'Digite um email válido';
    return;
  }

  emailSending.value = true;
  emailError.value = '';

  try {
    await store.sendQRCodeEmail({
      code: getFullCode(),
      email: guestEmail.value,
      name: store.currentGuest?.nome || 'Convidado',
    });
    emailSent.value = true;
    notification.success('E-mail enviado com sucesso.', 3000);
  } catch (err) {
    emailError.value = err instanceof Error ? err.message : 'Erro ao enviar email';
    notification.error('Erro ao enviar e-mail.', 3000);
  } finally {
    emailSending.value = false;
  }
};

const reset = (): void => {
  code.value = '';
  qrCodeDataUrl.value = '';
  guestEmail.value = '';
  emailSent.value = false;
  emailError.value = '';
  showCancelModal.value = false;
  showDeclineModal.value = false;
  store.resetRsvpFlow();
};
</script>

<style scoped>
.rsvp-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff9f0 0%, #f5e6d3 100%);
  padding: 2rem 1rem;
}

.rsvp-container {
  width: 100%;
  max-width: 480px;
}

/* Header */
.rsvp-header {
  text-align: center;
  margin-bottom: 2rem;
}

.rsvp-header__icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.rsvp-header__title {
  font-size: 1.5rem;
  color: #3d2b1f;
  margin: 0 0 0.5rem;
  font-weight: 700;
}

.rsvp-header__subtitle {
  font-size: 1.1rem;
  color: #8b7355;
  margin: 0;
  font-style: italic;
}

/* Already Confirmed */
.rsvp-already-confirmed {
  background: #d1fae5;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.rsvp-already-confirmed__check {
  font-size: 2rem;
}

.rsvp-already-confirmed p {
  margin: 0.5rem 0 0;
  color: #065f46;
}

.rsvp-already-confirmed__cancel-link {
  background: none;
  border: none;
  color: #991b1b;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 0.75rem;
  padding: 0.25rem;
  text-decoration: underline;
  transition: color 0.2s;
}

.rsvp-already-confirmed__cancel-link:hover {
  color: #7f1d1d;
}

/* Actions */
.rsvp-actions__text {
  color: #5a4a3a;
  margin: 0 0 1rem;
}

.rsvp-actions__buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rsvp-actions__confirm-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #2a9d8f 0%, #40e0d0 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-actions__confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
}

.rsvp-actions__confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rsvp-actions__decline-button {
  width: 100%;
  padding: 0.875rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #8b7355;
  background: #fff9f0;
  border: 2px solid #e8dcc8;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-actions__decline-button:hover:not(:disabled) {
  background: #e8dcc8;
  color: #5a4a3a;
}

.rsvp-actions__decline-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Back Button */
.rsvp-back-button {
  background: none;
  border: none;
  color: #8b7355;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
  margin-top: 1rem;
}

.rsvp-back-button:hover {
  color: #3d2b1f;
}

/* Success */
.rsvp-success__icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.rsvp-success__title {
  font-size: 1.5rem;
  color: #2a9d8f;
  margin: 0 0 1rem;
}

.rsvp-success__message {
  color: #5a4a3a;
  margin: 0 0 1.5rem;
  font-size: 1.1rem;
}

.rsvp-success__see-you {
  color: #8b7355;
  margin: 0 0 0.5rem;
  font-style: italic;
}

.rsvp-success__date {
  color: #3d2b1f;
  font-weight: 600;
  margin: 0 0 2rem;
  font-size: 1.1rem;
}

.rsvp-success__actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rsvp-success__button {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  color: #8b7355;
  background: #fff9f0;
  border: 2px solid #e8dcc8;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-success__button:hover {
  background: #e8dcc8;
}

.rsvp-success__link {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #8b3a3a 0%, #c45c5c 100%);
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s;
}

.rsvp-success__link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 58, 58, 0.3);
}

/* Declined */
.rsvp-declined__icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.rsvp-declined__title {
  font-size: 1.5rem;
  color: #8b7355;
  margin: 0 0 1rem;
}

.rsvp-declined__message {
  color: #5a4a3a;
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.rsvp-declined__note {
  color: #8b7355;
  margin: 0 0 2rem;
  font-size: 0.95rem;
  font-style: italic;
}

.rsvp-declined__actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rsvp-declined__button {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  color: #8b7355;
  background: #fff9f0;
  border: 2px solid #e8dcc8;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.rsvp-declined__button:hover {
  background: #e8dcc8;
}

.rsvp-declined__link {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #8b3a3a 0%, #c45c5c 100%);
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s;
}

.rsvp-declined__link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 58, 58, 0.3);
}

/* Footer */
.rsvp-footer {
  text-align: center;
  margin-top: 2rem;
}

.rsvp-footer__link {
  color: #8b7355;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.rsvp-footer__link:hover {
  color: #3d2b1f;
}

/* Responsive */
@media (max-width: 480px) {
  .rsvp-page {
    padding: 1rem;
  }

  .rsvp-header__title {
    font-size: 1.3rem;
  }
}
</style>
