import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  type RsvpGuest,
  type ConfirmPresenceResponse,
  type CheckinResponse,
  type RsvpStats,
  createEmptyRsvpStats,
} from '@/entities/guest';
import { rsvpRepository } from '../api/supabaseRsvpRepository';

export const useRsvpStore = defineStore('rsvp', () => {
  // State
  const currentGuest = ref<RsvpGuest | null>(null);
  const checkedInGuests = ref<RsvpGuest[]>([]);
  const stats = ref<RsvpStats>(createEmptyRsvpStats());
  const checkinCount = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // RSVP flow state
  const confirmed = ref(false);
  const declined = ref(false);
  const confirmationMessage = ref('');

  // Check-in flow state
  const checkinSuccess = ref(false);
  const lastCheckedInGuest = ref('');

  // Cache timestamps
  const lastFetchStats = ref<number | null>(null);
  const lastFetchCheckins = ref<number | null>(null);

  // Cache duration: 5 minutos
  const CACHE_DURATION = 5 * 60 * 1000;

  // Computed
  const hasGuest = computed(() => currentGuest.value !== null);

  const totalPeople = computed(() => {
    if (!currentGuest.value) return 0;
    const hasParceiro = currentGuest.value.parceiro ? 1 : 0;
    return 1 + hasParceiro + (Number(currentGuest.value.acompanhantes) || 0);
  });

  const confirmationRate = computed(() => {
    if (stats.value.total === 0) return 0;
    return Math.round((stats.value.confirmed / stats.value.total) * 100);
  });

  const checkinRate = computed(() => {
    if (stats.value.confirmed === 0) return 0;
    return Math.round((stats.value.checkedIn / stats.value.confirmed) * 100);
  });

  // Actions
  const shouldRefetch = (lastFetchTime: number | null): boolean => {
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > CACHE_DURATION;
  };

  const checkGuestCode = async (code: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      currentGuest.value = await rsvpRepository.getByCode(code);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Erro ao verificar código. Tente novamente.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const confirmPresence = async (code: string): Promise<ConfirmPresenceResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await rsvpRepository.confirmPresence(code);
      confirmationMessage.value = result.message;
      confirmed.value = true;
      return result;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Erro ao confirmar presença. Tente novamente.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const cancelPresence = async (code: string): Promise<ConfirmPresenceResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await rsvpRepository.cancelPresence(code);
      if (currentGuest.value) {
        currentGuest.value.confirmado = false;
      }
      return result;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Erro ao cancelar presença. Tente novamente.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const declinePresence = async (code: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await rsvpRepository.declinePresence(code);
      if (currentGuest.value) {
        currentGuest.value.recusou = true;
        currentGuest.value.confirmado = false;
      }
      declined.value = true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Erro ao registrar ausência. Tente novamente.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const checkGuestByToken = async (token: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      currentGuest.value = await rsvpRepository.getByToken(token);
      if (currentGuest.value.confirmado) {
        confirmed.value = true;
      }
      if (currentGuest.value.recusou) {
        declined.value = true;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Link inválido. Verifique com os noivos.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const registerCheckin = async (code: string): Promise<CheckinResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await rsvpRepository.registerCheckin(code);

      if (currentGuest.value) {
        lastCheckedInGuest.value =
          currentGuest.value.nome +
          (currentGuest.value.parceiro ? ` e ${currentGuest.value.parceiro}` : '');
      }

      checkinSuccess.value = true;
      currentGuest.value = null;

      await fetchCheckinCount();

      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao registrar check-in';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCheckinCount = async (): Promise<void> => {
    try {
      checkinCount.value = await rsvpRepository.getCheckinCount();
    } catch (err) {
      console.error('[RsvpStore] Erro ao carregar contagem de check-ins:', err);
    }
  };

  const fetchStats = async (force = false): Promise<void> => {
    if (!force && !shouldRefetch(lastFetchStats.value) && stats.value.total > 0) return;

    try {
      stats.value = await rsvpRepository.getStats();
      lastFetchStats.value = Date.now();
    } catch (err) {
      console.error('[RsvpStore] Erro ao carregar stats:', err);
    }
  };

  const fetchCheckedIn = async (force = false): Promise<void> => {
    if (!force && !shouldRefetch(lastFetchCheckins.value) && checkedInGuests.value.length > 0)
      return;

    try {
      checkedInGuests.value = await rsvpRepository.getCheckedInGuests();
      lastFetchCheckins.value = Date.now();
    } catch (err) {
      console.error('[RsvpStore] Erro ao carregar check-ins:', err);
    }
  };

  const sendQRCodeEmail = async (params: {
    code: string;
    email: string;
    name: string;
  }): Promise<{ success: boolean; error?: string }> => {
    return rsvpRepository.sendQRCodeEmail(params);
  };

  const resetRsvpFlow = (): void => {
    currentGuest.value = null;
    confirmed.value = false;
    declined.value = false;
    confirmationMessage.value = '';
    error.value = null;
  };

  const resetCheckinFlow = (): void => {
    currentGuest.value = null;
    checkinSuccess.value = false;
    lastCheckedInGuest.value = '';
    error.value = null;
  };

  const reset = (): void => {
    currentGuest.value = null;
    checkedInGuests.value = [];
    stats.value = createEmptyRsvpStats();
    checkinCount.value = 0;
    confirmed.value = false;
    declined.value = false;
    confirmationMessage.value = '';
    checkinSuccess.value = false;
    lastCheckedInGuest.value = '';
    lastFetchStats.value = null;
    lastFetchCheckins.value = null;
    error.value = null;
  };

  return {
    // State
    currentGuest,
    checkedInGuests,
    stats,
    checkinCount,
    loading,
    error,
    confirmed,
    declined,
    confirmationMessage,
    checkinSuccess,
    lastCheckedInGuest,
    // Computed
    hasGuest,
    totalPeople,
    confirmationRate,
    checkinRate,
    // Actions
    checkGuestCode,
    checkGuestByToken,
    confirmPresence,
    cancelPresence,
    declinePresence,
    registerCheckin,
    fetchCheckinCount,
    fetchStats,
    fetchCheckedIn,
    sendQRCodeEmail,
    resetRsvpFlow,
    resetCheckinFlow,
    reset,
  };
});
