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
  }>(),
  {
    email: '',
  }
);

defineEmits<{
  download: [];
  sendEmail: [];
  'update:email': [value: string];
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
  justify-content: center;
  margin-bottom: 1rem;
}

.qrcode-display__download-btn {
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
