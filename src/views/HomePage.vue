<template>
  <div class="page-container">
    <!-- Elegant Card -->
    <div class="card">
      <!-- Header -->
      <div class="card-header">
        <h1 class="names">{{ APP_CONFIG.BRIDE_NAME }} & {{ APP_CONFIG.GROOM_NAME }}</h1>
        <p class="subtitle">{{ APP_CONFIG.APP_NAME }}</p>
        <div class="date-badge">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {{ formattedDate }}
        </div>
      </div>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- Action Buttons -->
      <div class="buttons-container">
        <!-- <router-link to="/confirmar-presenca" class="btn btn-gold">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          Confirmar Presença
        </router-link> -->
        <router-link
          to="/cha-de-casa-nova"
          class="btn btn-gold"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Chá de casa nova
        </router-link>

        <button
          @click="showPixModal = true"
          class="btn btn-emerald"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Presentear via PIX
        </button>

        <button
          v-if="linkNaBioUrl"
          @click="openLinkNaBio"
          class="btn btn-purple"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          Presentear via Cartão
        </button>

        <a
          href="https://lista.havan.com.br/Convidado/ItensListaPresente/901773"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-rose"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
          Lista de Presentes na Havan
        </a>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <p>Feito com amor para celebrar nosso casamento</p>
      </div>
    </div>

    <!-- PIX Modal -->
    <PixModal
      :is-open="showPixModal"
      @close="showPixModal = false"
    />

    <!-- Notification Container -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { APP_CONFIG } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import PixModal from '@/components/pix/PixModal.vue';
import { NotificationContainer } from '@shared/ui';

const showPixModal = ref(false);
const linkNaBioUrl = import.meta.env.VITE_INFINITYPAY_LINK_NA_BIO || '';

const formattedDate = computed(() => formatDate(APP_CONFIG.WEDDING_DATE));

const openLinkNaBio = (): void => {
  const width = 450;
  const height = 700;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  window.open(
    linkNaBioUrl,
    'LinkNaBio',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );
};
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
  overflow: hidden;
}

.card-header {
  padding: 2.5rem 2rem 2rem;
  text-align: center;
  background: linear-gradient(180deg, #fffbf5 0%, #ffffff 100%);
}

.names {
  font-family: 'Great Vibes', cursive;
  font-size: 2.5rem;
  font-weight: 400;
  color: #8b3a3a;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.subtitle {
  font-family: 'Playfair Display', serif;
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 1.25rem;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #d4b76a 0%, #c9a24a 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 50px;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #d4b76a 50%, transparent 100%);
}

.buttons-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  font-family: 'Lato', sans-serif;
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.btn-gold {
  background: linear-gradient(135deg, #d4b76a 0%, #b8893d 100%);
}

.btn-gold:hover {
  background: linear-gradient(135deg, #e0c57a 0%, #c9a24a 100%);
}

.btn-emerald {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-emerald:hover {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.btn-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
}

.btn-purple:hover {
  background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
}

.btn-rose {
  background: linear-gradient(135deg, #8b3a3a 0%, #6a2a2a 100%);
}

.btn-rose:hover {
  background: linear-gradient(135deg, #a04545 0%, #8b3a3a 100%);
}

.card-footer {
  padding: 1rem 1.5rem;
  background: #faf9f7;
  text-align: center;
}

.card-footer p {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 480px) {
  .card {
    border-radius: 20px;
  }

  .names {
    font-size: 2rem;
  }

  .card-header {
    padding: 2rem 1.5rem 1.5rem;
  }

  .buttons-container {
    padding: 1.25rem;
  }

  .btn {
    padding: 0.875rem 1.25rem;
    font-size: 0.875rem;
  }
}
</style>
