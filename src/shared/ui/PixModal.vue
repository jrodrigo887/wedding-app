<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click="close"
      >
        <div
          class="relative w-full max-w-md bg-white border-2 border-amber-300 rounded-2xl shadow-2xl overflow-hidden"
          @click.stop
        >
          <!-- Close button -->
          <button
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-amber-50 hover:bg-amber-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors z-10"
            @click="close"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Header -->
          <div class="px-6 py-5 text-center bg-linear-to-r from-amber-500 to-amber-600 text-white">
            <h2 class="text-xl font-serif font-semibold mb-1">Contribua via PIX</h2>
            <p class="text-amber-100 text-sm">Qualquer valor é bem-vindo!</p>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-5">
            <!-- QR Code -->
            <div class="flex justify-center">
              <img
                :src="qrcodePix"
                alt="QR Code PIX"
                class="w-44 h-44 rounded-xl border-2 border-amber-200"
              />
            </div>

            <!-- Chave PIX -->
            <div class="space-y-2">
              <label class="block font-semibold text-gray-700 text-sm">Chave PIX</label>
              <div class="flex gap-2">
                <input
                  :value="pixKey"
                  readonly
                  class="flex-1 px-4 py-3 text-sm font-mono font-semibold text-gray-700 bg-amber-50 border-2 border-amber-200 rounded-xl text-center focus:outline-none focus:border-amber-400"
                  @focus="($event.target as HTMLInputElement)?.select()"
                />
                <BaseButton
                  variant="primary"
                  size="sm"
                  @click="handleCopyPix"
                >
                  {{ copied ? 'Copiado!' : 'Copiar' }}
                </BaseButton>
              </div>
            </div>

            <!-- Beneficiário -->
            <div
              class="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 rounded-xl text-sm"
            >
              <span class="text-gray-500">Beneficiário:</span>
              <span class="font-semibold text-gray-700">{{ beneficiaryName }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BaseButton } from '@shared/ui';
import { useNotification, copyToClipboard } from '@shared/utils';
import { APP_CONFIG, MESSAGES } from '@shared/config/constants';
import qrcodePix from '@assets/qrcode-pix.png';

interface Props {
  isOpen?: boolean;
}

withDefaults(defineProps<Props>(), {
  isOpen: false,
});

const emit = defineEmits<{
  close: [];
}>();

const { success } = useNotification();

const copied = ref(false);

const pixKey = computed(() => APP_CONFIG.PIX_KEY);
const beneficiaryName = computed(() => APP_CONFIG.BENEFICIARY_NAME);

const close = (): void => {
  emit('close');
};

const handleCopyPix = async (): Promise<void> => {
  try {
    const result = await copyToClipboard(pixKey.value);
    if (result) {
      copied.value = true;
      success(MESSAGES.SUCCESS.COPY);
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    }
  } catch (error) {
    console.error('Erro ao copiar PIX:', error);
  }
};
</script>

<style scoped>
/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
