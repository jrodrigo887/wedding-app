<template>
  <div class="qrcode-display">
    <h3 class="qrcode-display__title">Seu QR Code para Check-in</h3>
    <p class="qrcode-display__subtitle">Apresente este código na entrada do evento</p>

    <div
      v-if="loading"
      class="qrcode-display__loading"
    >
      Gerando QR Code...
    </div>

    <div
      v-else-if="dataUrl"
      class="qrcode-display__image-container"
    >
      <img
        :src="dataUrl"
        alt="QR Code para check-in"
        class="qrcode-display__image"
      />
      <p class="qrcode-display__code">{{ code }}</p>
    </div>

    <div class="qrcode-display__actions">
      <button
        class="qrcode-display__download-btn"
        :disabled="!dataUrl"
        @click="$emit('download')"
      >
        Salvar QR Code
      </button>

      <button
        v-if="confirmationUrl"
        class="qrcode-display__whatsapp-btn"
        @click="$emit('share-whatsapp')"
      >
        <span class="qrcode-display__whatsapp-icon">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </span>
        Compartilhar QR Code
      </button>
    </div>

    <!-- Email Section -->
    <div
      v-if="showEmailForm && !emailSent"
      class="qrcode-display__email"
    >
      <p class="qrcode-display__email-label">Receber QR Code por email:</p>
      <div class="qrcode-display__email-form">
        <input
          :value="email"
          type="email"
          class="qrcode-display__email-input"
          placeholder="seu@email.com"
          :disabled="emailSending"
          @input="$emit('update:email', ($event.target as HTMLInputElement).value)"
        />
        <button
          class="qrcode-display__email-btn"
          :disabled="emailSending || !email.trim()"
          @click="$emit('sendEmail')"
        >
          <span v-if="emailSending">Enviando...</span>
          <span v-else>Enviar</span>
        </button>
      </div>
      <p
        v-if="emailError"
        class="qrcode-display__email-error"
      >
        {{ emailError }}
      </p>
    </div>

    <div
      v-if="emailSent"
      class="qrcode-display__email-success"
    >
      QR Code enviado para {{ props.email }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    code: string;
    dataUrl?: string;
    loading?: boolean;
    showEmailForm?: boolean;
    email?: string;
    emailSending?: boolean;
    emailSent?: boolean;
    emailError?: string;
    confirmationUrl?: string;
  }>(),
  {
    email: '',
  }
);

defineEmits<{
  download: [];
  sendEmail: [];
  'update:email': [value: string];
  'share-whatsapp': [];
}>();
</script>

<style scoped>
.qrcode-display {
  background: #fff9f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 2px dashed #e8dcc8;
}

.qrcode-display__title {
  font-size: 1.1rem;
  color: #3d2b1f;
  margin: 0 0 0.25rem;
  text-align: center;
}

.qrcode-display__subtitle {
  font-size: 0.85rem;
  color: #8b7355;
  margin: 0 0 1rem;
  text-align: center;
}

.qrcode-display__loading {
  text-align: center;
  padding: 2rem;
  color: #8b7355;
}

.qrcode-display__image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.qrcode-display__image {
  width: 200px;
  height: 200px;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qrcode-display__code {
  margin: 0.75rem 0 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #3d2b1f;
  font-family: monospace;
  letter-spacing: 0.1em;
}

.qrcode-display__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.qrcode-display__download-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #2a9d8f 0%, #40e0d0 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.qrcode-display__download-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
}

.qrcode-display__download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qrcode-display__whatsapp-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: #25d366;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.qrcode-display__whatsapp-btn:hover {
  background: #1ebe57;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.35);
}

.qrcode-display__whatsapp-icon {
  display: flex;
  align-items: center;
}

.qrcode-display__email {
  border-top: 1px solid #e8dcc8;
  padding-top: 1rem;
}

.qrcode-display__email-label {
  font-size: 0.9rem;
  color: #5a4a3a;
  margin: 0 0 0.5rem;
  text-align: center;
}

.qrcode-display__email-form {
  display: flex;
  gap: 0.5rem;
}

.qrcode-display__email-input {
  flex: 1;
  padding: 0.75rem;
  font-size: 0.95rem;
  border: 2px solid #e8dcc8;
  border-radius: 0.5rem;
  background: white;
  color: #3d2b1f;
}

.qrcode-display__email-input:focus {
  outline: none;
  border-color: #d4a574;
}

.qrcode-display__email-btn {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #8b3a3a 0%, #c45c5c 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.qrcode-display__email-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.qrcode-display__email-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qrcode-display__email-error {
  margin: 0.5rem 0 0;
  padding: 0.5rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  text-align: center;
}

.qrcode-display__email-success {
  text-align: center;
  padding: 0.75rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  border-top: 1px solid #e8dcc8;
  margin-top: 1rem;
}
</style>
