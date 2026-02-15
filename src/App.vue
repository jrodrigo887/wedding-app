<template>
  <div
    id="app"
    :data-theme="isDarkMode ? 'dark' : 'light'"
  >
    <router-view v-if="isReady" />
    <div
      v-else
      class="loading-screen"
    >
      <LoadingSpinner size="lg" />
      <p>Carregando...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTenant } from '@shared/config/tenant';
import { provideTenant, useTheme } from '@shared/utils';
import { LoadingSpinner } from '@shared/ui';

// Estado de carregamento
const isReady = ref(true);

// Configurar contexto do tenant
const tenantConfig = useTenant();
const tenantContext = provideTenant(tenantConfig);

// Tema
const { isDarkMode } = useTheme();

// Expor para componentes filhos via template
defineExpose({
  tenantContext,
});
</script>

<style scoped>
#app {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  transition:
    background-color var(--transition-normal) ease,
    color var(--transition-normal) ease;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--spacing-md);
}

.loading-screen p {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
</style>
