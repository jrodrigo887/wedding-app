import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './providers';
import './assets/styles/global.css';

// Tenant
import { initializeTenant } from './providers';
import { useTheme } from '@shared/utils';

// Função de inicialização assíncrona
async function bootstrap() {
  // 1. Criar app Vue
  const app = createApp(App);
  const pinia = createPinia();

  // 2. Registrar plugins
  app.use(pinia);
  app.use(router);

  // 3. Inicializar tenant
  try {
    const tenant = await initializeTenant({
      strategies: ['subdomain', 'path', 'domain'],
      defaultTenantSlug: 'default',
    });

    console.log(`[App] Tenant inicializado: ${tenant.name}`);

    // 4. Aplicar tema do tenant
    const { applyTenantTheme, initTheme } = useTheme();
    initTheme();
    applyTenantTheme(tenant);
  } catch (error) {
    console.error('[App] Erro ao inicializar tenant:', error);
    // Continua com configuração padrão
  }

  // 5. Montar aplicação
  app.mount('#app');
}

// Iniciar
bootstrap();
