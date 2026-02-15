// Theme Composable - Gerenciamento de temas por tenant
import { ref, computed } from 'vue';
import { useTenant } from '@shared/config/tenant';
import type { TenantConfig } from '@shared/config/tenant';
import { AVAILABLE_THEMES, type ThemeName } from '@/themes';

const currentTheme = ref<ThemeName>('default');
const isDarkMode = ref(false);

/**
 * Composable para gerenciamento de temas
 * Aplica variaveis CSS baseadas na configuracao do tenant
 */
export function useTheme() {
  /**
   * Aplica o tema do tenant
   */
  const applyTenantTheme = (tenant?: TenantConfig) => {
    const config = tenant || useTenant();
    const root = document.documentElement;

    // Aplica cores do tenant
    if (config.theme.primaryColor) {
      root.style.setProperty('--tenant-primary', config.theme.primaryColor);
      root.style.setProperty('--tenant-primary-hover', adjustColor(config.theme.primaryColor, -20));
      root.style.setProperty('--tenant-primary-light', adjustColor(config.theme.primaryColor, 20));
    }

    if (config.theme.secondaryColor) {
      root.style.setProperty('--tenant-secondary', config.theme.secondaryColor);
      root.style.setProperty(
        '--tenant-secondary-hover',
        adjustColor(config.theme.secondaryColor, -20)
      );
      root.style.setProperty(
        '--tenant-secondary-light',
        adjustColor(config.theme.secondaryColor, 20)
      );
    }

    // Aplica favicon se configurado
    if (config.theme.faviconUrl) {
      updateFavicon(config.theme.faviconUrl);
    }

    // Aplica titulo da pagina
    if (config.name) {
      document.title = config.name;
    }
  };

  /**
   * Carrega um tema predefinido
   */
  const loadTheme = async (themeName: ThemeName) => {
    if (!AVAILABLE_THEMES.includes(themeName)) {
      console.warn(`[useTheme] Tema desconhecido: ${themeName}`);
      return;
    }

    try {
      // Carrega dinamicamente o CSS do tema
      await import(`@/themes/${themeName}/theme.css`);
      currentTheme.value = themeName;
      console.log(`[useTheme] Tema carregado: ${themeName}`);
    } catch (error) {
      console.error(`[useTheme] Erro ao carregar tema ${themeName}:`, error);
    }
  };

  /**
   * Alterna entre modo claro e escuro
   */
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');

    // Persiste preferencia
    localStorage.setItem('theme-dark-mode', isDarkMode.value.toString());
  };

  /**
   * Inicializa o tema baseado nas preferencias salvas
   */
  const initTheme = () => {
    // Verifica preferencia salva ou do sistema
    const savedDarkMode = localStorage.getItem('theme-dark-mode');
    if (savedDarkMode !== null) {
      isDarkMode.value = savedDarkMode === 'true';
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
  };

  /**
   * Define variaveis CSS customizadas
   */
  const setCSSVariable = (name: string, value: string) => {
    document.documentElement.style.setProperty(name, value);
  };

  /**
   * Obtem valor de uma variavel CSS
   */
  const getCSSVariable = (name: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };

  return {
    currentTheme: computed(() => currentTheme.value),
    isDarkMode: computed(() => isDarkMode.value),
    applyTenantTheme,
    loadTheme,
    toggleDarkMode,
    initTheme,
    setCSSVariable,
    getCSSVariable,
  };
}

// === Funcoes Auxiliares ===

/**
 * Ajusta a luminosidade de uma cor hex
 */
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = (num >> 16) + amt;
  const g = ((num >> 8) & 0x00ff) + amt;
  const b = (num & 0x0000ff) + amt;

  return (
    '#' +
    (
      0x1000000 +
      (r < 255 ? (r < 0 ? 0 : r) : 255) * 0x10000 +
      (g < 255 ? (g < 0 ? 0 : g) : 255) * 0x100 +
      (b < 255 ? (b < 0 ? 0 : b) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

/**
 * Atualiza o favicon da pagina
 */
function updateFavicon(url: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}
