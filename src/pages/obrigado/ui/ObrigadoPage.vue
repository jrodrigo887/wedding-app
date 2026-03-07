<template>
  <div class="page-container">
    <div class="card">
      <!-- Ícone de sucesso animado -->
      <div class="success-icon">
        <svg viewBox="0 0 52 52" class="checkmark">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
          <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>

      <!-- Item pago (se identificado) -->
      <template v-if="item">
        <div class="item-emoji">{{ item.emoji }}</div>
        <h1 class="title">Que presente incrível!</h1>
        <p class="item-name">{{ item.title }}</p>
        <p class="item-price">{{ formatPrice(item.price) }}</p>
        <p class="message">
          Você contribuiu com o nosso fundo de lua de mel. Isso significa muito pra gente! 🌙
        </p>
      </template>

      <!-- Fallback genérico (sem order_nsu ou item não encontrado) -->
      <template v-else>
        <div class="item-emoji">🎉</div>
        <h1 class="title">Pagamento recebido!</h1>
        <p class="message">
          Obrigado pela sua contribuição ao nosso fundo de lua de mel. Você faz parte dessa história! 🌙
        </p>
      </template>

      <!-- Método de pagamento -->
      <div v-if="captureMethod" class="payment-badge">
        <span v-if="captureMethod === 'pix'">🏦 Pago via PIX</span>
        <span v-else-if="captureMethod === 'credit_card'">💳 Pago com Cartão de Crédito</span>
        <span v-else>✅ Pagamento confirmado</span>
      </div>

      <!-- Recibo -->
      <a
        v-if="receiptUrl"
        :href="receiptUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="receipt-link"
      >
        Ver comprovante
      </a>

      <!-- Ações -->
      <div class="actions">
        <router-link to="/lua-de-mel" class="btn btn-primary">
          Ver mais presentes
        </router-link>
        <router-link to="/" class="btn btn-secondary">
          Página principal
        </router-link>
      </div>

      <p class="footer-message">
        Com amor, Rodrigo &amp; Elisa 💕
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { GIFT_ITEMS } from '@features/lua-de-mel/model/giftItems';
import { useContribuicoesStore } from '@features/lua-de-mel/model/useContribuicoesStore';

const route = useRoute();
const store = useContribuicoesStore();

const orderNsu = computed(() => (route.query.order_nsu as string) ?? '');
const captureMethod = computed(() => (route.query.capture_method as string) ?? '');
const receiptUrl = computed(() => (route.query.receipt_url as string) ?? '');

// Extrai o item_id do order_nsu no formato "luamel-{id}-{timestamp}"
const item = computed(() => {
  if (!orderNsu.value.startsWith('luamel-')) return null;
  const parts = orderNsu.value.split('-');
  const itemId = parseInt(parts[1]);
  return isNaN(itemId) ? null : (GIFT_ITEMS.find(i => i.id === itemId) ?? null);
});

// Mapeia o capture_method da InfinityPay para o metodo interno
function mapCaptureMethod(capture: string): 'pix' | 'cartao' {
  return capture === 'pix' ? 'pix' : 'cartao';
}

// Registra a contribuição somente após o redirect da InfinityPay (pagamento confirmado).
// Valida o NSU contra a sessão do browser para impedir registros com NSUs fabricados.
// O store também verifica idempotência via DB (guard duplo contra refresh da página).
onMounted(async () => {
  const nsu = orderNsu.value;
  const capture = captureMethod.value;
  const foundItem = item.value;

  // Precisa de order_nsu + captureMethod + item reconhecido
  if (!nsu.startsWith('luamel-') || !capture || !foundItem) return;

  // Valida que o NSU foi gerado por este browser (sessão de pagamento iniciada aqui)
  const pendingNsu = localStorage.getItem('pending_checkout_nsu');
  if (pendingNsu !== nsu) {
    console.warn('[ObrigadoPage] NSU não corresponde à sessão de pagamento. Registro ignorado.');
    return;
  }

  // Remove da sessão antes de registrar — se a página for recarregada,
  // o guard do store (existsByOrderNsu) garante que não haverá duplicata no DB.
  localStorage.removeItem('pending_checkout_nsu');

  await store.registrarContribuicao(foundItem, mapCaptureMethod(capture), nsu);
});

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fefdfb 0%, #faf4e8 50%, #f5ebd7 100%);
}

.card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  padding: 2.5rem 2rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

/* Checkmark animado */
.success-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 0.25rem;
}

.checkmark {
  width: 56px;
  height: 56px;
}

.checkmark-circle {
  stroke: #10b981;
  stroke-width: 2;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  stroke: #10b981;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards;
}

@keyframes stroke {
  100% { stroke-dashoffset: 0; }
}

.item-emoji {
  font-size: 3.5rem;
  line-height: 1;
}

.title {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #8b3a3a;
  margin: 0;
}

.item-name {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  color: #374151;
  margin: 0;
}

.item-price {
  font-family: 'Lato', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #8b3a3a;
  margin: 0;
}

.message {
  font-family: 'Lato', sans-serif;
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0.25rem 0;
}

.payment-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 50px;
  font-family: 'Lato', sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #15803d;
}

.receipt-link {
  font-family: 'Lato', sans-serif;
  font-size: 0.8125rem;
  color: #8b5cf6;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.2s;
}

.receipt-link:hover { opacity: 0.7; }

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  width: 100%;
  margin-top: 0.5rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.875rem 1.5rem;
  font-family: 'Lato', sans-serif;
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
  text-decoration: none;
  border-radius: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); }

.btn-primary { background: linear-gradient(135deg, #d4b76a 0%, #c9a24a 100%); }
.btn-primary:hover { background: linear-gradient(135deg, #e0c57a 0%, #d4b76a 100%); }

.btn-secondary { background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%); }
.btn-secondary:hover { background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%); }

.footer-message {
  font-family: 'Great Vibes', cursive;
  font-size: 1.5rem;
  color: #8b3a3a;
  margin-top: 0.25rem;
}
</style>
