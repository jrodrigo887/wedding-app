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
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Header -->
          <div class="px-6 py-5 text-center bg-linear-to-r from-amber-500 to-amber-600 text-white">
            <h2 class="text-xl font-serif font-semibold mb-1">Contribua via PIX</h2>
            <p class="text-amber-100 text-sm">
              {{ suggestedAmount ? formattedAmount + ' · escaneie o QR abaixo' : 'Qualquer valor é bem-vindo!' }}
            </p>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <!-- QR Code (dinâmico com valor ou estático) -->
            <div class="flex justify-center">
              <div class="relative">
                <img
                  v-if="!qrLoading"
                  :src="activeQrSrc"
                  alt="QR Code PIX"
                  class="w-44 h-44 rounded-xl border-2 border-amber-200"
                />
                <!-- Skeleton enquanto gera -->
                <div
                  v-else
                  class="w-44 h-44 rounded-xl border-2 border-amber-200 bg-amber-50 flex items-center justify-center"
                >
                  <svg class="animate-spin w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
                <!-- Badge de valor sobre o QR -->
                <div
                  v-if="suggestedAmount && !qrLoading"
                  class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow whitespace-nowrap"
                >
                  {{ formattedAmount }}
                </div>
              </div>
            </div>

            <!-- Spacer para o badge -->
            <div v-if="suggestedAmount && !qrLoading" class="h-2" />

            <!-- PIX Copia e Cola / Chave PIX -->
            <div class="space-y-2">
              <label class="block font-semibold text-gray-700 text-sm">
                {{ suggestedAmount ? 'PIX Copia e Cola (com o valor)' : 'Chave PIX' }}
              </label>
              <div class="flex gap-2">
                <input
                  :value="copyableValue"
                  readonly
                  class="flex-1 px-3 py-3 text-xs font-mono font-semibold text-gray-700 bg-amber-50 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400 truncate"
                  @focus="($event.target as HTMLInputElement)?.select()"
                />
                <BaseButton variant="primary" size="sm" @click="handleCopy">
                  {{ copied ? 'Copiado!' : 'Copiar' }}
                </BaseButton>
              </div>
              <p v-if="suggestedAmount" class="text-xs text-gray-400">
                Cole esse código no seu app bancário — o valor de {{ formattedAmount }} já virá preenchido.
              </p>
            </div>

            <!-- Beneficiário -->
            <div class="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 rounded-xl text-sm">
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
import { ref, computed, watch } from 'vue';
import QRCode from 'qrcode';
import { BaseButton } from '@shared/ui';
import { useNotification, copyToClipboard } from '@shared/utils';
import { APP_CONFIG, MESSAGES } from '@shared/config/constants';
import { generatePixPayload } from '@shared/utils/pixPayload';
import qrcodePixStatic from '@assets/qrcode-pix.png';

interface Props {
  isOpen?: boolean;
  suggestedAmount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  suggestedAmount: undefined,
});

const emit = defineEmits<{ close: [] }>();

const { success } = useNotification();

const copied = ref(false);
const qrLoading = ref(false);
const dynamicQrUrl = ref<string>('');
const pixCopiaECola = ref<string>('');

const beneficiaryName = computed(() => APP_CONFIG.BENEFICIARY_NAME);

const formattedAmount = computed(() =>
  props.suggestedAmount
    ? props.suggestedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '',
);

const activeQrSrc = computed(() =>
  props.suggestedAmount && dynamicQrUrl.value ? dynamicQrUrl.value : qrcodePixStatic,
);

const copyableValue = computed(() =>
  props.suggestedAmount && pixCopiaECola.value ? pixCopiaECola.value : APP_CONFIG.PIX_KEY,
);

// Gera QR e payload PIX com valor quando o modal abre com suggestedAmount
watch(
  [() => props.isOpen, () => props.suggestedAmount],
  async ([isOpen, amount]) => {
    if (isOpen && amount) {
      qrLoading.value = true;
      try {
        const payload = generatePixPayload({
          pixKey: APP_CONFIG.PIX_KEY,
          merchantName: APP_CONFIG.BENEFICIARY_NAME,
          merchantCity: 'Joao Pessoa',
          amount,
        });
        pixCopiaECola.value = payload;
        dynamicQrUrl.value = await QRCode.toDataURL(payload, {
          width: 176,
          margin: 1,
          color: { dark: '#1c1917', light: '#ffffff' },
        });
      } catch (err) {
        console.error('[PixModal] Erro ao gerar QR code dinâmico:', err);
        dynamicQrUrl.value = '';
        pixCopiaECola.value = '';
      } finally {
        qrLoading.value = false;
      }
    } else {
      dynamicQrUrl.value = '';
      pixCopiaECola.value = '';
    }
  },
  { immediate: true },
);

const close = (): void => emit('close');

const handleCopy = async (): Promise<void> => {
  try {
    const result = await copyToClipboard(copyableValue.value);
    if (result) {
      copied.value = true;
      success(MESSAGES.SUCCESS.COPY);
      setTimeout(() => { copied.value = false; }, 2000);
    }
  } catch (error) {
    console.error('Erro ao copiar PIX:', error);
  }
};
</script>

<style scoped>
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
