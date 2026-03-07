<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="scanner-modal"
    >
      <div class="scanner-modal__content">
        <div class="scanner-modal__header">
          <h3 class="scanner-modal__title">Escanear QR Code</h3>
          <button
            class="scanner-modal__close"
            @click="$emit('close')"
          >
            &times;
          </button>
        </div>

        <div class="scanner-modal__body">
          <div
            id="qr-reader"
            class="qr-reader"
          ></div>

          <div
            v-if="status && !scannedCode"
            class="scanner-status"
          >
            <div class="scanner-status__spinner"></div>
            <span>{{ status }}</span>
          </div>

          <div
            v-if="scannedCode"
            class="scanner-result"
          >
            <p class="scanner-result__label">QR Code detectado:</p>
            <p class="scanner-result__code">{{ scannedCode }}</p>
          </div>

          <div class="scanner-actions">
            <button
              v-if="scannedCode"
              class="scanner-actions__use"
              @click="$emit('useCode')"
            >
              Fazer Check-in
            </button>

            <button
              v-if="scannedCode"
              class="scanner-actions__retry"
              @click="$emit('retry')"
            >
              Escanear outro
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  status?: string;
  scannedCode?: string;
}>();

defineEmits<{
  close: [];
  useCode: [];
  retry: [];
}>();
</script>

<style scoped>
.scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.scanner-modal__content {
  background: #1a1a2e;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scanner-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #2d2d44;
}

.scanner-modal__title {
  color: #ffffff;
  margin: 0;
  font-size: 1.1rem;
}

.scanner-modal__close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.scanner-modal__close:hover {
  color: #ffffff;
}

.scanner-modal__body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qr-reader {
  width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
}

.qr-reader :deep(video) {
  border-radius: 0.5rem;
}

:deep(#qr-reader__scan_region) {
  background: #000 !important;
}

:deep(#qr-reader__dashboard) {
  padding: 0 !important;
}

:deep(#qr-reader__dashboard_section_swaplink) {
  display: none !important;
}

.scanner-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #2d2d44;
  border-radius: 0.5rem;
  color: #a0aec0;
}

.scanner-status__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.scanner-result {
  padding: 1rem;
  background: #d1fae5;
  border-radius: 0.5rem;
  text-align: center;
}

.scanner-result__label {
  color: #065f46;
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}

.scanner-result__code {
  color: #047857;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: monospace;
}

.scanner-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.scanner-actions__use {
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
}

.scanner-actions__use:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.scanner-actions__retry {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #94a3b8;
  background: #2d2d44;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.scanner-actions__retry:hover {
  background: #3d3d5c;
  color: #ffffff;
}

@media (max-width: 480px) {
  .scanner-modal__content {
    max-height: 95vh;
  }
}
</style>
