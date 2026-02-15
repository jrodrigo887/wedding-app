<template>
  <div class="feature-not-available">
    <div class="content">
      <div class="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <line
            x1="12"
            y1="8"
            x2="12"
            y2="12"
          />
          <line
            x1="12"
            y1="16"
            x2="12.01"
            y2="16"
          />
        </svg>
      </div>

      <h1>Recurso não disponível</h1>

      <p class="description">
        O recurso <strong>{{ featureLabel }}</strong> não está disponível no seu plano atual.
      </p>

      <p class="help-text">Entre em contato com o administrador para mais informações.</p>

      <div class="actions">
        <button
          class="btn-primary"
          @click="goHome"
        >
          Voltar ao início
        </button>
        <button
          class="btn-secondary"
          @click="goBack"
        >
          Voltar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const FEATURE_LABELS: Record<string, string> = {
  photos: 'Galeria de Fotos',
  rsvp: 'Confirmação de Presença',
  contracts: 'Gestão de Contratos',
  checkin: 'Check-in de Convidados',
  pix: 'Pagamento PIX',
};

const featureLabel = computed(() => {
  const feature = route.query.feature as string;
  return FEATURE_LABELS[feature] || feature || 'solicitado';
});

const goHome = () => {
  router.push({ name: 'home' });
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.feature-not-available {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background-color: var(--background-color);
}

.content {
  text-align: center;
  max-width: 480px;
}

.icon {
  color: var(--warning-color);
  margin-bottom: var(--spacing-lg);
}

h1 {
  font-family: var(--font-heading);
  font-size: var(--font-size-2xl);
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
}

.description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.description strong {
  color: var(--primary-color);
}

.help-text {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xl);
}

.actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast) ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--text-inverse);
  border: none;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--background-secondary);
}
</style>
