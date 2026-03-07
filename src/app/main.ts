import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './providers';
import './assets/styles/global.css';
import { useTheme } from '@shared/utils';

function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(router);

  const { initTheme } = useTheme();
  initTheme();

  app.mount('#app');
}

bootstrap();
