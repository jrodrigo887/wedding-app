import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { createGuestRepository } from '@/app/providers';
import {
  type Guest,
  type GuestStats,
  createEmptyGuestStats,
} from '@/entities/guest';

const guestRepository = createGuestRepository();

/**
 * Store: useGuestsStore
 * Gerencia o estado dos convidados com cache
 * Princípio: Single Source of Truth
 */
export const useGuestsStore = defineStore('guests', () => {
  // State
  const guests = ref<Guest[]>([]);
  const checkedInGuests = ref<Guest[]>([]);
  const stats = ref<GuestStats>(createEmptyGuestStats());
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Cache timestamps separados para cada tipo de dado
  const lastFetchGuests = ref<number | null>(null);
  const lastFetchStats = ref<number | null>(null);
  const lastFetchCheckins = ref<number | null>(null);

  // Cache duration: 5 minutos
  const CACHE_DURATION = 5 * 60 * 1000;

  // Computed
  const hasData = computed(() => guests.value.length > 0);

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

  const fetchGuests = async (force = false): Promise<void> => {
    if (!force && !shouldRefetch(lastFetchGuests.value) && hasData.value)
      return;

    loading.value = true;
    error.value = null;

    try {
      guests.value = await guestRepository.getAll();
      lastFetchGuests.value = Date.now();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Erro ao carregar convidados';
      console.error('[GuestsStore] Erro:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchStats = async (force = false): Promise<void> => {
    if (!force && !shouldRefetch(lastFetchStats.value) && stats.value.total > 0)
      return;

    try {
      stats.value = await guestRepository.getStats();
      lastFetchStats.value = Date.now();
    } catch (err) {
      console.error('[GuestsStore] Erro ao carregar stats:', err);
    }
  };

  const fetchCheckedIn = async (force = false): Promise<void> => {
    if (
      !force &&
      !shouldRefetch(lastFetchCheckins.value) &&
      checkedInGuests.value.length > 0
    )
      return;

    try {
      checkedInGuests.value = await guestRepository.getCheckedIn();
      lastFetchCheckins.value = Date.now();
    } catch (err) {
      console.error('[GuestsStore] Erro ao carregar check-ins:', err);
    }
  };

  const fetchAll = async (force = false): Promise<void> => {
    await Promise.all([fetchStats(force), fetchCheckedIn(force)]);
  };

  const refresh = async (): Promise<void> => {
    await fetchAll(true);
  };

  const registerCheckin = async (code: string): Promise<void> => {
    await guestRepository.registerCheckin(code);
    await refresh();
  };

  const reset = (): void => {
    guests.value = [];
    checkedInGuests.value = [];
    stats.value = createEmptyGuestStats();
    lastFetchGuests.value = null;
    lastFetchStats.value = null;
    lastFetchCheckins.value = null;
    error.value = null;
  };

  return {
    // State
    guests,
    checkedInGuests,
    stats,
    loading,
    error,
    // Computed
    hasData,
    confirmationRate,
    checkinRate,
    // Actions
    fetchGuests,
    fetchStats,
    fetchCheckedIn,
    fetchAll,
    refresh,
    registerCheckin,
    reset,
  };
});
