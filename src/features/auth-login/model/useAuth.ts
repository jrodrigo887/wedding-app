import { ref, computed } from 'vue';
import { supabase } from '@shared/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Estado global compartilhado
const user = ref<User | null>(null);
const loading = ref(false);
const error = ref('');
const initialized = ref(false);

const isAuthenticated = computed(() => !!user.value);

/**
 * Inicializa o estado de autenticação
 * Deve ser chamado uma vez na inicialização do app
 */
const initialize = async (): Promise<void> => {
  if (initialized.value) return;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    user.value = session?.user ?? null;

    // Escuta mudanças no estado de autenticação
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null;
    });

    initialized.value = true;
  } catch (err) {
    console.error('[Auth] Erro ao inicializar:', err);
  }
};

/**
 * Realiza login com email e senha
 */
const login = async (email: string, password: string): Promise<boolean> => {
  loading.value = true;
  error.value = '';

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      error.value = 'Email ou senha incorretos';
      return false;
    }

    user.value = data.user;
    return true;
  } catch (err) {
    error.value = 'Erro ao fazer login. Tente novamente.';
    return false;
  } finally {
    loading.value = false;
  }
};

/**
 * Realiza logout
 */
const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    user.value = null;
  } catch (err) {
    console.error('[Auth] Erro ao fazer logout:', err);
  }
};

/**
 * Limpa o erro
 */
const clearError = (): void => {
  error.value = '';
};

// Inicializa automaticamente
initialize();

export const useAuth = () => {
  return {
    // State
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    // Methods
    initialize,
    login,
    logout,
    clearError,
  };
};

export default useAuth;
