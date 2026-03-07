import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ContribuicoesRepository } from '../api/supabaseContribuicoesRepository';
import type { GiftItem } from './giftItems';

const repository = new ContribuicoesRepository();

export const useContribuicoesStore = defineStore('contribuicoes-lua-de-mel', () => {
  // item_id → quantidade de contribuições
  const contagens = ref<Map<number, number>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function loadContagens(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const data = await repository.getContagensPorItem();
      const map = new Map<number, number>();
      for (const row of data) {
        map.set(row.item_id, row.total);
      }
      contagens.value = map;
    } catch (err) {
      error.value = 'Não foi possível carregar os dados.';
      console.error('[useContribuicoesStore] Erro ao carregar contagens:', err);
    } finally {
      loading.value = false;
    }
  }

  async function registrarContribuicao(item: GiftItem, metodo: 'pix' | 'cartao'): Promise<void> {
    // Incremento otimista imediato
    contagens.value.set(item.id, (contagens.value.get(item.id) ?? 0) + 1);

    try {
      await repository.insert({
        item_id: item.id,
        item_title: item.title,
        item_price: item.price,
        metodo,
      });
    } catch (err) {
      // Reverter incremento se falhar
      const atual = contagens.value.get(item.id) ?? 1;
      contagens.value.set(item.id, Math.max(0, atual - 1));
      console.error('[useContribuicoesStore] Erro ao registrar contribuição:', err);
    }
  }

  function getContagem(itemId: number): number {
    return contagens.value.get(itemId) ?? 0;
  }

  return { contagens, loading, error, loadContagens, registrarContribuicao, getContagem };
});
