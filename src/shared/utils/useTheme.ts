// Theme Composable - Gerenciamento de temas
import { ref, computed } from 'vue';
import { AVAILABLE_THEMES, type ThemeName } from '@/themes';

const currentTheme = ref<ThemeName>('default');
const isDarkMode = ref(false);

/**
 * Composable para gerenciamento de temas
 * Aplica variaveis CSS baseadas na configuracao do tenant
 */
export function useTheme() {
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
    loadTheme,
    toggleDarkMode,
    initTheme,
    setCSSVariable,
    getCSSVariable,
  };
}
