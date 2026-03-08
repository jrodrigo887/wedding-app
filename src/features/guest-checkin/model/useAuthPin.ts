import { ref } from 'vue';

/**
 * Estado global de autenticação por PIN
 * Mantido fora do composable para persistir entre instâncias
 */
const authenticated = ref(false);
const pin = ref('');
const authError = ref('');

/**
 * Restaura a sessão via cookie HttpOnly gerenciado pelo servidor.
 * O cookie não é acessível pelo JavaScript — a validação ocorre server-side.
 */
const restoreSession = async (): Promise<void> => {
  try {
    const res = await fetch('/api/checkin-auth', {
      method: 'GET',
      credentials: 'same-origin',
    });
    const data = await res.json();
    authenticated.value = data.authenticated === true;
  } catch {
    authenticated.value = false;
  }
};

/**
 * Valida o PIN informado via chamada ao servidor.
 * O PIN nunca é comparado no cliente — elimina exposição via DevTools.
 */
const validatePin = async (): Promise<void> => {
  authError.value = '';
  try {
    const res = await fetch('/api/checkin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ pin: pin.value }),
    });

    if (res.ok) {
      authenticated.value = true;
      pin.value = '';
    } else if (res.status === 429) {
      authError.value = 'Muitas tentativas. Aguarde 15 minutos.';
    } else {
      authError.value = 'PIN incorreto. Tente novamente.';
    }
  } catch {
    authError.value = 'Erro de conexão. Tente novamente.';
  }
};

/**
 * Realiza logout encerrando a sessão no servidor.
 */
const logout = async (): Promise<void> => {
  try {
    await fetch('/api/checkin-auth', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
  } catch {
    // Ignora erros de rede — limpa estado local de qualquer forma
  }
  authenticated.value = false;
  pin.value = '';
  authError.value = '';
};

// Restaura a sessão ao carregar o módulo
restoreSession();

/**
 * Composable: useAuthPin
 * Gerencia autenticação por PIN para área de check-in.
 * A validação ocorre server-side — nenhum segredo é exposto no bundle.
 */
export const useAuthPin = () => {
  return {
    authenticated,
    pin,
    authError,
    validatePin,
    logout,
    restoreSession,
  };
};
