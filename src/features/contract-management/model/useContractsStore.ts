import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { createContractRepository } from '@/app/providers';
import type { Contract, ContractForm, ContractStats } from '@/entities/contract';

const contractRepository = createContractRepository();

export const useContractsStore = defineStore('contracts', () => {
  // State
  const contracts = ref<Contract[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastFetch = ref<number | null>(null);

  // Cache duration: 60 seconds
  const SECONDS = 60;
  const MINUTOS = 5;
  const CACHE_DURATION = MINUTOS * SECONDS * 1000;

  // Computed
  const hasData = computed(() => contracts.value.length > 0);

  const stats = computed<ContractStats>(() => {
    const totalValor = contracts.value.reduce((sum, c) => sum + (c.valor || 0), 0);
    const totalPago = contracts.value.reduce((sum, c) => sum + (c.pago || 0), 0);

    return {
      totalValor,
      totalPago,
      totalRestante: totalValor - totalPago,
    };
  });

  // Actions
  const shouldRefetch = (): boolean => {
    if (!lastFetch.value) return true;
    return Date.now() - lastFetch.value > CACHE_DURATION;
  };

  const fetchContracts = async (force = false): Promise<void> => {
    if (!force && !shouldRefetch() && hasData.value) return;

    loading.value = true;
    error.value = null;

    try {
      contracts.value = await contractRepository.getAll();
      lastFetch.value = Date.now();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar contratos';
      console.error('[ContractsStore] Erro:', err);
    } finally {
      loading.value = false;
    }
  };

  const createContract = async (form: ContractForm): Promise<Contract> => {
    const contract = await contractRepository.create(form);
    await fetchContracts(true);
    return contract;
  };

  const updateContract = async (id: number, form: ContractForm): Promise<Contract> => {
    const contract = await contractRepository.update(id, form);
    await fetchContracts(true);
    return contract;
  };

  const deleteContract = async (id: number): Promise<void> => {
    await contractRepository.delete(id);
    await fetchContracts(true);
  };

  const refresh = async (): Promise<void> => {
    await fetchContracts(true);
  };

  const getById = (id: number): Contract | undefined => {
    return contracts.value.find(c => c.id === id);
  };

  const getRestante = (contract: Contract): number => {
    return (contract.valor || 0) - (contract.pago || 0);
  };

  const reset = (): void => {
    contracts.value = [];
    lastFetch.value = null;
    error.value = null;
  };

  return {
    // State
    contracts,
    loading,
    error,
    // Computed
    hasData,
    stats,
    // Actions
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    refresh,
    getById,
    getRestante,
    reset,
  };
});
