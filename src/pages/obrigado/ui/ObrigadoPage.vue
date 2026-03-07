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

      <div class="item-emoji">🌙</div>
      <h1 class="title">Muito obrigado!</h1>
      <p class="message">
        Sua contribuição foi recebida com sucesso.<br />
        Ela faz parte de uma memória que vamos guardar para sempre. 💛
      </p>

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
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Página puramente visual — sem lógica de negócio.
// O registro da contribuição é feito pelo webhook /api/webhook-infinitepay
// após confirmação de pagamento pela InfinityPay.

const router = useRouter();

onMounted(() => {
  if (window.location.search) {
    router.replace({ path: '/obrigado', query: {} });
  }
});
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

.message {
  font-family: 'Lato', sans-serif;
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0.25rem 0;
}

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
