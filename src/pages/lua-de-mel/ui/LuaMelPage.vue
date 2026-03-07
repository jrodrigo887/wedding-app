<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <router-link
        to="/"
        class="back-link"
        >← Voltar</router-link
      >
      <h1 class="page-title">Fundo de Lua de Mel</h1>
      <p class="page-subtitle">
        Ajuda a gente a viver nossa melhor vida por uns dias. 🌙
      </p>
    </div>

    <!-- Grid de cards -->
    <div class="gifts-grid">
      <div
        v-for="item in GIFT_ITEMS"
        :key="item.id"
        class="gift-card"
        @click="openPaymentModal(item)"
      >
        <GiftCardIllustration :item="item" />

        <div class="card-body">
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-description">{{ item.description }}</p>
          <div class="card-price">{{ formatPrice(item.price) }}</div>
          <div class="card-counter">
            <span>💛</span>
            {{ store.getContagem(item.id) }}
            {{
              store.getContagem(item.id) === 1
                ? 'pessoa contribuiu'
                : 'pessoas contribuíram'
            }}
          </div>
          <button class="card-btn">
            Contribuir com {{ formatPrice(item.price) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Pagamento -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="selectedItem"
          class="modal-overlay"
          @click="closePaymentModal"
        >
          <div
            class="modal-box"
            @click.stop
          >
            <button
              class="modal-close"
              @click="closePaymentModal"
            >
              ✕
            </button>

            <div class="modal-emoji">{{ selectedItem.emoji }}</div>
            <h2 class="modal-title">{{ selectedItem.title }}</h2>
            <p class="modal-description">{{ selectedItem.description }}</p>
            <div class="modal-price">{{ formatPrice(selectedItem.price) }}</div>

            <p class="modal-instruction">Escolha como deseja contribuir:</p>

            <div class="modal-buttons">
              <button
                class="modal-btn modal-btn-pix"
                :disabled="checkoutLoading"
                @click="pagarPix"
              >
                <span>🏦</span> Pagar via PIX
              </button>

              <!-- Estado: URL ainda não gerada → botão para buscar -->
              <button
                v-if="!checkoutUrl"
                class="modal-btn modal-btn-card"
                :disabled="checkoutLoading"
                @click="pagarCartao"
              >
                <span v-if="checkoutLoading">⏳</span>
                <span v-else>💳</span>
                {{ checkoutLoading ? 'Gerando link...' : 'Pagar via Cartão' }}
              </button>

              <!-- Estado: URL pronta → link direto para o checkout (clique do usuário = sem bloqueio) -->
              <a
                v-else
                :href="checkoutUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="modal-btn modal-btn-card modal-btn-ready"
                @click="closePaymentModal"
              >
                💳 Ir para o pagamento →
              </a>
            </div>

            <!-- Mensagem de erro no checkout -->
            <p
              v-if="checkoutError"
              class="checkout-error"
            >
              {{ checkoutError }}
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- PIX Modal com QR code dinâmico e valor pré-definido -->
    <PixModal
      :is-open="showPixModal"
      :suggested-amount="selectedItem?.price"
      @close="handlePixClose"
    />

    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PixModal, NotificationContainer } from '@shared/ui';
import {
  GIFT_ITEMS,
  type GiftItem,
} from '@features/lua-de-mel/model/giftItems';
import { useContribuicoesStore } from '@features/lua-de-mel/model/useContribuicoesStore';
import GiftCardIllustration from './GiftCardIllustration.vue';

const store = useContribuicoesStore();

const selectedItem = ref<GiftItem | null>(null);
const showPixModal = ref(false);
const checkoutLoading = ref(false);
const checkoutError = ref<string | null>(null);
const checkoutUrl = ref<string | null>(null);

onMounted(() => {
  store.loadContagens();
});

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function openPaymentModal(item: GiftItem): void {
  selectedItem.value = item;
  checkoutError.value = null;
}

function closePaymentModal(): void {
  if (checkoutLoading.value) return;
  selectedItem.value = null;
  showPixModal.value = false;
  checkoutError.value = null;
  checkoutUrl.value = null;
}

function pagarPix(): void {
  showPixModal.value = true;
  if (selectedItem.value) {
    store.registrarContribuicao(selectedItem.value, 'pix');
  }
}

function handlePixClose(): void {
  showPixModal.value = false;
  closePaymentModal();
}

async function pagarCartao(): Promise<void> {
  const item = selectedItem.value;
  if (!item || checkoutLoading.value) return;

  checkoutLoading.value = true;
  checkoutError.value = null;
  checkoutUrl.value = null;

  try {
    const res = await fetch(
      'https://rodrigoelisa-git-developer-jrodrigo887s-projects.vercel.app/api/checkout-infinitepay',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id,
          item_title: `${item.emoji} ${item.title}`,
          item_price_brl: item.price,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro ${res.status}`);
    }

    const { checkout_url, order_nsu } = await res.json();

    // Persiste o NSU na sessão do browser (localStorage compartilhado entre abas).
    // A página /obrigado vai validar que o order_nsu da URL bate com este valor
    // antes de registrar no banco — impede registros com NSUs fabricados manualmente.
    localStorage.setItem('pending_checkout_nsu', order_nsu);

    // Exibe o botão de link no modal — o clique do usuário nesse <a> abre o checkout
    // sem nenhum bloqueio de popup, pois é um evento direto de interação.
    checkoutUrl.value = checkout_url;
  } catch (err) {
    console.error('[LuaMelPage] Erro ao criar checkout InfinityPay:', err);
    checkoutError.value =
      'Não foi possível abrir o checkout. Tente via PIX ou tente novamente.';
  } finally {
    checkoutLoading.value = false;
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 2rem 1rem 4rem;
  background: linear-gradient(135deg, #fefdfb 0%, #faf4e8 50%, #f5ebd7 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-inline: auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #8b3a3a;
  font-family: 'Lato', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 0.7;
}

.page-title {
  font-family: 'Great Vibes', cursive;
  font-size: 3rem;
  font-weight: 400;
  color: #8b3a3a;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.page-subtitle {
  font-family: 'Lato', sans-serif;
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.gifts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 960px;
  margin-inline: auto;
}

@media (min-width: 640px) {
  .gifts-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 960px) {
  .gifts-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.gift-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.gift-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 14px 32px rgba(139, 58, 58, 0.18);
}

.card-body {
  padding: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
  line-height: 1.3;
  margin: 0;
}

.card-description {
  font-family: 'Lato', sans-serif;
  font-size: 0.7rem;
  color: #9ca3af;
  line-height: 1.4;
  margin: 0;
}

.card-price {
  font-family: 'Lato', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #8b3a3a;
}

.card-counter {
  font-family: 'Lato', sans-serif;
  font-size: 0.68rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card-btn {
  margin-top: 0.375rem;
  width: 100%;
  padding: 0.5rem 0.5rem;
  background: linear-gradient(135deg, #d4b76a 0%, #c9a24a 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'Lato', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-btn:hover {
  background: linear-gradient(135deg, #e0c57a 0%, #d4b76a 100%);
  transform: translateY(-1px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-box {
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 2rem 1.5rem 1.5rem;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
}

.modal-emoji {
  font-size: 3.5rem;
  margin-bottom: 0.75rem;
}

.modal-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.modal-description {
  font-family: 'Lato', sans-serif;
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.modal-price {
  font-family: 'Lato', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #8b3a3a;
  margin-bottom: 1rem;
}

.modal-instruction {
  font-family: 'Lato', sans-serif;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.modal-buttons {
  display: flex;
  gap: 0.75rem;
}

.modal-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.875rem 0.5rem;
  border: none;
  border-radius: 14px;
  font-family: 'Lato', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.modal-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.modal-btn-pix {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
.modal-btn-pix:not(:disabled):hover {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}
.modal-btn-card {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  text-decoration: none;
}
.modal-btn-card:not(:disabled):hover {
  background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
}
.modal-btn-ready {
  background: linear-gradient(135deg, #d4b76a 0%, #c9a24a 100%);
  animation: pulse-gold 1.5s ease-in-out infinite;
}
.modal-btn-ready:hover {
  background: linear-gradient(135deg, #e0c57a 0%, #d4b76a 100%);
  animation: none;
}
@keyframes pulse-gold {
  0%, 100% { box-shadow: 0 4px 14px rgba(196, 160, 60, 0.4); }
  50%       { box-shadow: 0 4px 22px rgba(196, 160, 60, 0.7); }
}

.checkout-error {
  margin-top: 0.75rem;
  font-family: 'Lato', sans-serif;
  font-size: 0.75rem;
  color: #ef4444;
  background: #fef2f2;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.9);
}

@media (max-width: 400px) {
  .page-title {
    font-size: 2.25rem;
  }
  .gifts-grid {
    grid-template-columns: 1fr;
  }
  .modal-buttons {
    flex-direction: column;
  }
}
</style>
