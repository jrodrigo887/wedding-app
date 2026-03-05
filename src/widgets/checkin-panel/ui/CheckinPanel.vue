<template>
  <div class="checkin-page">
    <div class="checkin-container">
      <!-- Header -->
      <header class="checkin-header">
        <div class="checkin-header__icon">🎟️</div>
        <h1 class="checkin-header__title">Check-in do Evento</h1>
        <p class="checkin-header__subtitle">
          {{ APP_CONFIG.BRIDE_NAME }} & {{ APP_CONFIG.GROOM_NAME }}
        </p>
      </header>

      <!-- Tela de PIN -->
      <PinAuth
        v-if="!authenticated"
        v-model="pin"
        :error="authError"
        @submit="handleValidatePin"
      />

      <!-- Área de Check-in -->
      <div
        v-else
        class="checkin-main"
      >
        <!-- Estatísticas -->
        <CheckinStats :count="store.checkinCount" />

        <!-- Form de busca -->
        <div class="checkin-form">
          <p class="checkin-form__instruction">
            Digite ou escaneie o código do convidado
          </p>

          <div class="checkin-form__input-group">
            <div class="checkin-form__input-wrapper">
              <span class="checkin-form__prefix">RE:</span>
              <input
                ref="codeInput"
                v-model="code"
                type="text"
                class="checkin-form__input"
                placeholder="00"
                :disabled="store.loading"
                @input="onCodeInput"
                @keyup.enter="checkGuest"
              />
            </div>
            <button
              class="checkin-form__button"
              :disabled="store.loading || !code.trim()"
              @click="checkGuest"
            >
              <span v-if="store.loading">Buscando...</span>
              <span v-else>Buscar</span>
            </button>
          </div>

          <!-- Botão de Scanner -->
          <button
            class="checkin-form__scan-button"
            :disabled="store.loading || scanning"
            @click="openScanner"
          >
            📷 Escanear Código
          </button>

          <p
            v-if="store.error"
            class="checkin-form__error"
          >
            {{ store.error }}
          </p>
        </div>

        <!-- Dados do convidado -->
        <div
          v-if="store.currentGuest"
          class="checkin-guest"
        >
          <div class="checkin-guest__card">
            <div class="checkin-guest__header">
              <span class="checkin-guest__icon">👤</span>
              <h3 class="checkin-guest__name">
                {{ store.currentGuest.nome
                }}{{
                  store.currentGuest.parceiro
                    ? ` e ${store.currentGuest.parceiro}`
                    : ''
                }}
              </h3>
            </div>

            <div class="checkin-guest__details">
              <div class="checkin-guest__detail">
                <span class="checkin-guest__label">Código:</span>
                <span class="checkin-guest__value">{{
                  store.currentGuest.codigo
                }}</span>
              </div>
              <div class="checkin-guest__detail">
                <span class="checkin-guest__label">Total de pessoas:</span>
                <span class="checkin-guest__value">{{
                  store.totalPeople
                }}</span>
              </div>
              <div class="checkin-guest__detail">
                <span class="checkin-guest__label">RSVP:</span>
                <span
                  class="checkin-guest__value"
                  :class="
                    store.currentGuest.confirmado
                      ? 'checkin-guest__value--confirmed'
                      : 'checkin-guest__value--pending'
                  "
                >
                  {{
                    store.currentGuest.confirmado
                      ? 'Confirmado'
                      : 'Não confirmado'
                  }}
                </span>
              </div>
              <div class="checkin-guest__detail">
                <span class="checkin-guest__label">Check-in:</span>
                <span
                  class="checkin-guest__value"
                  :class="
                    store.currentGuest.checkin
                      ? 'checkin-guest__value--confirmed'
                      : 'checkin-guest__value--pending'
                  "
                >
                  {{ store.currentGuest.checkin ? 'Realizado' : 'Pendente' }}
                </span>
              </div>
            </div>

            <div
              v-if="store.currentGuest.checkin"
              class="checkin-guest__already"
            >
              <span class="checkin-guest__already-icon">✅</span>
              <p>
                Check-in já realizado{{
                  store.currentGuest.horario_entrada
                    ? ` às ${formatTime(store.currentGuest.horario_entrada)}`
                    : ''
                }}
              </p>
            </div>

            <div
              v-else
              class="checkin-guest__actions"
            >
              <button
                class="checkin-guest__checkin-button"
                :disabled="checkingIn"
                @click="performCheckin"
              >
                <span v-if="checkingIn">Registrando...</span>
                <span v-else>Registrar Entrada</span>
              </button>
            </div>

            <button
              class="checkin-guest__new"
              @click="resetGuest"
            >
              Novo Check-in
            </button>
          </div>
        </div>

        <!-- Sucesso do check-in -->
        <div
          v-if="store.checkinSuccess"
          class="checkin-success"
        >
          <div class="checkin-success__card">
            <div class="checkin-success__icon">🎉</div>
            <h3 class="checkin-success__title">Check-in Realizado!</h3>
            <p class="checkin-success__message">
              {{ store.lastCheckedInGuest }} entrou no evento
            </p>
            <button
              class="checkin-success__button"
              @click="resetAll"
            >
              Próximo Check-in
            </button>
          </div>
        </div>

        <!-- Botão de sair -->
        <button
          class="checkin-logout"
          @click="handleLogout"
        >
          🚪 Sair da área restrita
        </button>
      </div>

      <!-- Modal do Scanner QR Code -->
      <QRScanner
        :show="showScanner"
        :status="scannerStatus"
        :scanned-code="scannedCode"
        @close="closeScanner"
        @use-code="useScannedCode"
        @retry="retryScanner"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount, watch } from 'vue';
import { APP_CONFIG } from '@shared/config/constants';
import { Html5Qrcode } from 'html5-qrcode';
import { useRsvpStore } from '@/features/rsvp-confirmation';
import {
  useAuthPin,
  PinAuth,
  QRScanner,
  CheckinStats,
} from '@/features/guest-checkin';

/**
 * Widget: CheckinPanel
 * Orquestra o fluxo completo de check-in do evento
 */

// Store
const store = useRsvpStore();

// Auth composable
const { authenticated, pin, authError, validatePin, logout } = useAuthPin();

// Local state
const code = ref('');
const checkingIn = ref(false);
const codeInput = ref<HTMLInputElement | null>(null);

// Scanner state
const showScanner = ref(false);
const scanning = ref(false);
const scannerStatus = ref('');
const scannedCode = ref('');
let html5QrCode: Html5Qrcode | null = null;

// Carrega contagem quando autenticado
watch(
  authenticated,
  async isAuthenticated => {
    if (isAuthenticated) {
      await store.fetchCheckinCount();
    }
  },
  { immediate: true }
);

// Methods
const handleValidatePin = async (): Promise<void> => {
  await validatePin();
  if (authenticated.value) {
    nextTick(() => {
      codeInput.value?.focus();
    });
  }
};

const onCodeInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  code.value = target.value.replace(/\D/g, '');
};

const getFullCode = (): string => {
  return 'RE' + code.value.trim();
};

const checkGuest = async (): Promise<void> => {
  if (!code.value.trim()) return;

  store.resetCheckinFlow();

  try {
    await store.checkGuestCode(getFullCode());
  } catch {
    // Error handled by store
  }
};

const performCheckin = async (): Promise<void> => {
  if (!store.currentGuest) return;

  checkingIn.value = true;

  try {
    await store.registerCheckin(getFullCode());
  } catch {
    // Error handled by store
  } finally {
    checkingIn.value = false;
  }
};

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const resetGuest = (): void => {
  code.value = '';
  store.resetCheckinFlow();
  nextTick(() => {
    codeInput.value?.focus();
  });
};

const resetAll = (): void => {
  resetGuest();
};

const handleLogout = (): void => {
  logout();
  resetGuest();
  store.reset();
};

// Scanner Methods
const openScanner = async (): Promise<void> => {
  showScanner.value = true;
  scannedCode.value = '';
  scannerStatus.value = 'Iniciando câmera...';

  await nextTick();

  try {
    html5QrCode = new Html5Qrcode('qr-reader');

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    await html5QrCode.start(
      { facingMode: 'environment' },
      config,
      onQrCodeSuccess,
      onQrCodeError
    );

    scannerStatus.value = 'Aponte para o QR Code';
    scanning.value = true;
  } catch (err) {
    console.error('Erro ao iniciar scanner:', err);
    store.error = 'Não foi possível acessar a câmera. Verifique as permissões.';
    showScanner.value = false;
    scannerStatus.value = '';
  }
};

const onQrCodeSuccess = (decodedText: string): void => {
  scanning.value = false;
  scannerStatus.value = '';

  const extractedCode = extractCodeFromQR(decodedText);

  if (extractedCode) {
    scannedCode.value = extractedCode;
  } else {
    store.error =
      'QR Code inválido. Certifique-se de usar o QR Code do convite.';
    setTimeout(() => {
      store.error = null;
      scanning.value = true;
    }, 2000);
  }
};

const onQrCodeError = (): void => {
  // Silently ignore read errors
};

const extractCodeFromQR = (text: string): string | null => {
  const cleanText = text.trim().toUpperCase();

  const match = cleanText.match(/RE\s*[-:]?\s*([0-9A-Z]{1,10})/i);
  if (match) {
    return match[0];
  }

  if (cleanText.startsWith('RE')) {
    return cleanText;
  }

  if (/^\d{1,4}$/.test(cleanText)) {
    return 'RE' + cleanText;
  }

  return null;
};

const closeScanner = async (): Promise<void> => {
  await stopScanner();
  showScanner.value = false;
  scannedCode.value = '';
  scannerStatus.value = '';
};

const stopScanner = async (): Promise<void> => {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch (err) {
      console.error('Erro ao parar scanner:', err);
    }
    html5QrCode = null;
  }
  scanning.value = false;
};

const useScannedCode = async (): Promise<void> => {
  if (scannedCode.value) {
    const numericPart = scannedCode.value.replace(/^RE/i, '');
    code.value = numericPart;
    await closeScanner();
    nextTick(() => {
      checkGuest();
    });
  }
};

const retryScanner = (): void => {
  scannedCode.value = '';
  store.error = null;

  if (!scanning.value && html5QrCode) {
    scanning.value = true;
    scannerStatus.value = 'Aponte para o QR Code';
  }
};

onBeforeUnmount(() => {
  stopScanner();
});
</script>

<style scoped>
.checkin-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 2rem 1rem;
}

.checkin-container {
  width: 100%;
  max-width: 500px;
}

/* Header */
.checkin-header {
  text-align: center;
  margin-bottom: 2rem;
}

.checkin-header__icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.checkin-header__title {
  font-size: 1.5rem;
  color: #ffffff;
  margin: 0 0 0.5rem;
  font-weight: 700;
}

.checkin-header__subtitle {
  font-size: 1rem;
  color: #a0aec0;
  margin: 0;
  font-style: italic;
}

/* Form */
.checkin-form {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

.checkin-form__instruction {
  text-align: center;
  color: #64748b;
  margin: 0 0 1rem;
  font-size: 0.9rem;
}

.checkin-form__input-group {
  display: flex;
  gap: 0.75rem;
}

.checkin-form__input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
  overflow: hidden;
}

.checkin-form__input-wrapper:focus-within {
  border-color: #3b82f6;
}

.checkin-form__prefix {
  padding: 0.75rem 0.5rem 0.75rem 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  background: #e2e8f0;
}

.checkin-form__input {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: none;
  background: transparent;
  color: #1a1a2e;
}

.checkin-form__input:focus {
  outline: none;
}

.checkin-form__button {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.checkin-form__button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.checkin-form__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkin-form__error {
  margin: 1rem 0 0;
  padding: 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.checkin-form__scan-button {
  width: 100%;
  padding: 0.875rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.75rem;
}

.checkin-form__scan-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.checkin-form__scan-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Guest Card */
.checkin-guest__card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

.checkin-guest__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.checkin-guest__icon {
  font-size: 2rem;
}

.checkin-guest__name {
  font-size: 1.1rem;
  color: #1a1a2e;
  margin: 0;
  font-weight: 600;
}

.checkin-guest__details {
  margin-bottom: 1rem;
}

.checkin-guest__detail {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.checkin-guest__detail:last-child {
  border-bottom: none;
}

.checkin-guest__label {
  color: #64748b;
  font-size: 0.9rem;
}

.checkin-guest__value {
  color: #1a1a2e;
  font-weight: 600;
  font-size: 0.9rem;
}

.checkin-guest__value--confirmed {
  color: #10b981;
}

.checkin-guest__value--pending {
  color: #f59e0b;
}

.checkin-guest__already {
  background: #d1fae5;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
}

.checkin-guest__already-icon {
  font-size: 1.5rem;
}

.checkin-guest__already p {
  margin: 0.5rem 0 0;
  color: #065f46;
  font-size: 0.9rem;
}

.checkin-guest__checkin-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

.checkin-guest__checkin-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.checkin-guest__checkin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkin-guest__new {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #64748b;
  background: #f1f5f9;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.checkin-guest__new:hover {
  background: #e2e8f0;
  color: #1a1a2e;
}

/* Success */
.checkin-success__card {
  background: #d1fae5;
  border-radius: 1rem;
  padding: 2rem;
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
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.checkin-success__icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.checkin-success__title {
  font-size: 1.3rem;
  color: #065f46;
  margin: 0 0 0.5rem;
}

.checkin-success__message {
  color: #047857;
  margin: 0 0 1.5rem;
  font-size: 1rem;
}

.checkin-success__button {
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.checkin-success__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Logout */
.checkin-logout {
  display: block;
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #94a3b8;
  background: transparent;
  border: 1px solid #475569;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.checkin-logout:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border-color: #64748b;
}

/* Responsive */
@media (max-width: 480px) {
  .checkin-page {
    padding: 1rem;
  }

  .checkin-form__input-group {
    flex-direction: column;
  }

  .checkin-form__button {
    width: 100%;
  }
}
</style>
