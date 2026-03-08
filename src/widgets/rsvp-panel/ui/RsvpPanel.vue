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

      <!-- Carregando via link exclusivo -->
      <RsvpCard v-if="viaLink && store.loading && !store.currentGuest">
        <div class="rsvp-link-loading">
          <div class="rsvp-link-loading__spinner" />
          <p>Carregando seus dados...</p>
        </div>
      </RsvpCard>

      <!-- Link inválido -->
      <RsvpCard
        v-if="
          viaLink &&
          store.error &&
          !store.currentGuest &&
          !store.confirmed &&
          !store.declined
        "
      >
        <div class="rsvp-link-error">
          <div class="rsvp-link-error__icon">❌</div>
          <h2 class="rsvp-link-error__title">Link inválido</h2>
          <p class="rsvp-link-error__message">{{ store.error }}</p>
          <router-link
            to="/"
            class="rsvp-declined__link"
            >Ver Lista de Presentes →</router-link
          >
        </div>
      </RsvpCard>

      <!-- Sem token: solicitar link exclusivo -->
      <RsvpCard
        v-if="
          !viaLink && !store.currentGuest && !store.confirmed && !store.declined
        "
      >
        <div class="rsvp-no-token">
          <div class="rsvp-no-token__icon">🔗</div>
          <h2 class="rsvp-no-token__title">Link exclusivo necessário</h2>
          <p class="rsvp-no-token__message">
            Para confirmar sua presença, utilize o link exclusivo enviado pelos
            noivos.
          </p>
          <p class="rsvp-no-token__contact">
            Não recebeu o link? Entre em contato pelo e-mail
            <a
              :href="`mailto:${APP_CONFIG.CONTACT_EMAIL}`"
              class="rsvp-no-token__email"
              >{{ APP_CONFIG.CONTACT_EMAIL }}</a
            >
          </p>
        </div>
      </RsvpCard>

      <!-- Dados do convidado encontrado -->
      <RsvpCard
        v-if="store.currentGuest && !store.confirmed && !store.declined"
      >
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
            <p class="rsvp-actions__text">
              Deseja confirmar sua presença no casamento?
            </p>
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
          {{
            store.confirmationMessage ||
            `Presença confirmada com sucesso, ${store.currentGuest?.nome}!`
          }}
        </p>

        <QRCodeDisplay
          v-model:email="guestEmail"
          :code="getFullCode()"
          :data-url="qrCodeDataUrl"
          :loading="qrCodeLoading"
          show-email-form
          :confirmation-url="confirmationUrl"
          :email-sending="emailSending"
          :email-sent="emailSent"
          :email-error="emailError"
          @download="downloadQRCode"
          @send-email="sendQRCodeByEmail"
          @share-whatsapp="handleShareWhatsApp"
        />

        <!-- Cancelar quando acessado via link e já estava confirmado -->
        <div
          v-if="viaLink"
          class="rsvp-success__cancel-area"
        >
          <button
            class="rsvp-already-confirmed__cancel-link"
            @click="showCancelModal = true"
          >
            Cancelar minha confirmação
          </button>
        </div>

        <p class="rsvp-success__see-you">Nos vemos no grande dia!</p>
        <p class="rsvp-success__date">{{ formattedWeddingDate }}</p>

        <div class="rsvp-success__actions">
          <router-link
            to="/lua-de-mel"
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
        <template #message>
          Tem certeza que deseja cancelar sua presença no casamento?
        </template>
        <template #warning>
          Esta ação irá remover sua confirmação e você precisará confirmar
          novamente caso mude de ideia.
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
          Ao confirmar, registraremos que você não poderá comparecer. Caso mude
          de ideia, você pode confirmar sua presença a qualquer momento.
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
        <div class="rsvp-declined__icon">😢</div>

        <!-- Via link: mensagem personalizada com e-mail de contato -->
        <template v-if="viaLink">
          <h2 class="rsvp-declined__title">
            Olá, {{ store.currentGuest?.nome }}!
          </h2>
          <p class="rsvp-declined__message">
            Já registramos que você não poderá comparecer ao nosso casamento.
          </p>
          <p class="rsvp-declined__note">
            Se mudou de ideia, entre em contato pelo e-mail
            <a
              :href="`mailto:${APP_CONFIG.CONTACT_EMAIL}`"
              class="rsvp-declined__email"
              >{{ APP_CONFIG.CONTACT_EMAIL }}</a
            >
            e receberá um novo link de confirmação.
          </p>
        </template>

        <!-- Fluxo normal: mensagem genérica -->
        <template v-else>
          <h2 class="rsvp-declined__title">Ausência Registrada</h2>
          <p class="rsvp-declined__message">
            Registramos que você não poderá comparecer ao casamento.
          </p>
          <p class="rsvp-declined__note">
            Sentiremos sua falta! Caso mude de ideia, você pode confirmar sua
            presença a qualquer momento.
          </p>
        </template>

        <div class="rsvp-declined__actions">
          <button
            v-if="!viaLink"
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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { APP_CONFIG } from '@shared/config/constants';
import { useNotification } from '@shared/utils/useNotification';
import { useWhatsApp } from '@shared/utils/useWhatsApp';
import {
  useRsvpStore,
  qrcodeService,
  GuestDetails,
  QRCodeDisplay,
  RsvpModal,
  RsvpCard,
} from '@/features/rsvp-confirmation';

/**
 * Widget: RsvpPanel
 * Orquestra o fluxo completo de confirmação de presença (RSVP)
 */

// Store + router
const store = useRsvpStore();
const route = useRoute();
const { openWhatsApp } = useWhatsApp();

// Token do link exclusivo (query param ?guest=UUID)
const guestToken = route.query.guest as string | undefined;
const viaLink = computed(() => !!guestToken);

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
  const date = new Date(`${APP_CONFIG.WEDDING_DATE}T12:00:00`);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

const confirmationUrl = computed(() => {
  const guest = store.currentGuest;
  // Prefere link curto (/convite/<short_code>) se disponível
  if (guest?.short_code) {
    return `${window.location.origin}/convite/${guest.short_code}`;
  }
  // Fallback: link longo com UUID (para convidados sem short_code ainda)
  const token = guest?.invite_token ?? guestToken;
  if (!token) return undefined;
  return `${window.location.origin}/confirmar-presenca?guest=${token}`;
});

// Methods
const getFullCode = (): string => {
  return `RE${code.value.trim()}`;
};

const confirmPresence = async (): Promise<void> => {
  if (!store.currentGuest || !guestToken) return;

  confirming.value = true;

  try {
    await store.confirmPresenceByToken(guestToken);
    await generateQRCode();
  } catch {
    // Error is handled by store
  } finally {
    confirming.value = false;
  }
};

const cancelPresence = async (): Promise<void> => {
  if (!store.currentGuest || !guestToken) return;

  cancelling.value = true;

  try {
    await store.cancelPresenceByToken(guestToken);
    showCancelModal.value = false;
  } catch {
    showCancelModal.value = false;
  } finally {
    cancelling.value = false;
  }
};

const declinePresence = async (): Promise<void> => {
  if (!store.currentGuest || !guestToken) return;

  cancelling.value = true;

  try {
    await store.declinePresenceByToken(guestToken);
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
    qrCodeDataUrl.value =
      await qrcodeService.generateWeddingQRCode(getFullCode());
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err);
  } finally {
    qrCodeLoading.value = false;
  }
};

const downloadQRCode = (): void => {
  if (qrCodeDataUrl.value) {
    const guestName = store.currentGuest?.nome || 'convidado';
    qrcodeService.downloadQRCode(
      qrCodeDataUrl.value,
      `qrcode-${guestName}.png`
    );
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
    emailError.value =
      err instanceof Error ? err.message : 'Erro ao enviar email';
    notification.error('Erro ao enviar e-mail.', 3000);
  } finally {
    emailSending.value = false;
  }
};

const handleShareWhatsApp = async (): Promise<void> => {
  // Tenta Web Share API com imagem (mobile — iOS/Android)
  if (qrCodeDataUrl.value) {
    try {
      const res = await fetch(qrCodeDataUrl.value);
      const blob = await res.blob();
      const guestName = store.currentGuest?.nome ?? 'convidado';
      const file = new File([blob], `qrcode-${guestName}.png`, {
        type: 'image/png',
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Presença confirmada — ${APP_CONFIG.BRIDE_NAME} & ${APP_CONFIG.GROOM_NAME}`,
          text: [
            `Minha presença no casamento de *${APP_CONFIG.BRIDE_NAME} & ${APP_CONFIG.GROOM_NAME}* foi confirmada!`,
            `*Código:* ${getFullCode()}`,
            `*Data:* ${formattedWeddingDate.value}`,
          ].join('\n'),
        });
        return;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return; // usuário cancelou
    }
  }

  // Fallback: link via WhatsApp (desktop ou navegador sem suporte a share de arquivo)
  const url = confirmationUrl.value ?? window.location.href;
  const message = [
    `Minha presença no casamento de *${APP_CONFIG.BRIDE_NAME} & ${APP_CONFIG.GROOM_NAME}* foi confirmada!`,
    `*Código:* ${getFullCode()}`,
    `*Data:* ${formattedWeddingDate.value}`,
    `QR Code para check-in:`,
    url,
  ].join('\n');
  openWhatsApp(message);
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

onMounted(async () => {
  if (guestToken) {
    try {
      await store.checkGuestByToken(guestToken);
      code.value = store.currentGuest?.codigo?.replace(/^RE/i, '') ?? '';
      if (store.currentGuest?.confirmado) {
        await generateQRCode();
      }
    } catch {
      // Error handled by store
    }
  }
});
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

/* Link loading */
.rsvp-link-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 0;
  color: #8b7355;
}

.rsvp-link-loading__spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e8dcc8;
  border-top-color: #8b7355;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Link error */
.rsvp-link-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
}

.rsvp-link-error__icon {
  font-size: 3rem;
}

.rsvp-link-error__title {
  font-size: 1.25rem;
  color: #991b1b;
  margin: 0;
}

.rsvp-link-error__message {
  color: #5a4a3a;
  margin: 0;
  text-align: center;
}

/* No token — tela informativa */
.rsvp-no-token {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  text-align: center;
}

.rsvp-no-token__icon {
  font-size: 3rem;
}

.rsvp-no-token__title {
  font-size: 1.25rem;
  color: #3d2b1f;
  margin: 0;
}

.rsvp-no-token__message {
  color: #5a4a3a;
  margin: 0;
  line-height: 1.5;
}

.rsvp-no-token__contact {
  color: #8b7355;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
  line-height: 1.6;
}

.rsvp-no-token__email {
  color: #8b3a3a;
  font-weight: 600;
  word-break: break-all;
}

.rsvp-no-token__email:hover {
  color: #3d2b1f;
}

/* Success cancel area */
.rsvp-success__cancel-area {
  margin-bottom: 1.5rem;
}

/* Declined email link */
.rsvp-declined__email {
  color: #8b3a3a;
  font-weight: 600;
  word-break: break-all;
}

.rsvp-declined__email:hover {
  color: #3d2b1f;
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
