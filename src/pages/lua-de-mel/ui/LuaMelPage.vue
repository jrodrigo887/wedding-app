<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <router-link to="/" class="back-link">← Voltar</router-link>
      <h1 class="page-title">Fundo de Lua de Mel</h1>
      <p class="page-subtitle">Ajuda a gente a viver nossa melhor vida por uns dias. 🌙</p>
    </div>

    <!-- Grid de cards -->
    <div class="gifts-grid">
      <div
        v-for="item in GIFT_ITEMS"
        :key="item.id"
        class="gift-card"
        @click="openPaymentModal(item)"
      >
        <!-- Ilustração única por item -->
        <GiftCardIllustration :item="item" />

        <!-- Conteúdo do card -->
        <div class="card-body">
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-description">{{ item.description }}</p>
          <div class="card-price">{{ formatPrice(item.price) }}</div>
          <div class="card-counter">
            <span>💛</span>
            {{ store.getContagem(item.id) }}
            {{ store.getContagem(item.id) === 1 ? 'pessoa contribuiu' : 'pessoas contribuíram' }}
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
          <div class="modal-box" @click.stop>
            <button class="modal-close" @click="closePaymentModal">✕</button>

            <div class="modal-emoji">{{ selectedItem.emoji }}</div>
            <h2 class="modal-title">{{ selectedItem.title }}</h2>
            <p class="modal-description">{{ selectedItem.description }}</p>
            <div class="modal-price">{{ formatPrice(selectedItem.price) }}</div>

            <p class="modal-instruction">Escolha como deseja contribuir:</p>

            <div class="modal-buttons">
              <button class="modal-btn modal-btn-pix" @click="pagarPix">
                <span>🏦</span> Pagar via PIX
              </button>
              <button class="modal-btn modal-btn-card" @click="pagarCartao">
                <span>💳</span> Pagar via Cartão
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- PIX Modal com QR code dinâmico -->
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
import { GIFT_ITEMS, type GiftItem } from '@features/lua-de-mel/model/giftItems';
import { useContribuicoesStore } from '@features/lua-de-mel/model/useContribuicoesStore';
import GiftCardIllustration from './GiftCardIllustration.vue';

const store = useContribuicoesStore();

const selectedItem = ref<GiftItem | null>(null);
const showPixModal = ref(false);

onMounted(() => {
  store.loadContagens();
});

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function openPaymentModal(item: GiftItem): void {
  selectedItem.value = item;
}

function closePaymentModal(): void {
  selectedItem.value = null;
  showPixModal.value = false;
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

function pagarCartao(): void {
  const item = selectedItem.value;
  if (!item) return;

  store.registrarContribuicao(item, 'cartao');

  const baseUrl = import.meta.env.VITE_INFINITYPAY_LINK_NA_BIO || '';
  const separator = baseUrl.includes('?') ? '&' : '?';
  const url = `${baseUrl}${separator}amount=${item.price.toFixed(2)}`;

  const width = 450;
  const height = 700;
  const left = Math.round((window.screen.width - width) / 2);
  const top = Math.round((window.screen.height - height) / 2);

  window.open(url, 'InfinityPay', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);
  closePaymentModal();
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

.back-link:hover { opacity: 0.7; }

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

/* Grid */
.gifts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 960px;
  margin-inline: auto;
}

@media (min-width: 640px) {
  .gifts-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
}

@media (min-width: 960px) {
  .gifts-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Card */
.gift-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
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

/* Modal overlay */
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

.modal-close:hover { background: #e5e7eb; }

.modal-emoji { font-size: 3.5rem; margin-bottom: 0.75rem; }

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

.modal-buttons { display: flex; gap: 0.75rem; }

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

.modal-btn:hover { transform: translateY(-1px); }

.modal-btn-pix { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.modal-btn-pix:hover { background: linear-gradient(135deg, #34d399 0%, #10b981 100%); }
.modal-btn-card { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); }
.modal-btn-card:hover { background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%); }

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-active .modal-box, .modal-leave-active .modal-box { transition: transform 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.9); }

@media (max-width: 400px) {
  .page-title { font-size: 2.25rem; }
  .gifts-grid { grid-template-columns: 1fr; }
  .modal-buttons { flex-direction: column; }
}
</style>
