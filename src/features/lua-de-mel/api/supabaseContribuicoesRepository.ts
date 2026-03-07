import { supabase } from '@shared/lib/supabase';

export interface ContribuicaoInsert {
  item_id: number;
  item_title: string;
  item_price: number;
  metodo: 'pix' | 'cartao';
  order_nsu?: string;
}

export interface ContagemPorItem {
  item_id: number;
  total: number;
}

export class ContribuicoesRepository {
  private readonly TABLE = 'contribuicoes_lua_de_mel';

  async insert(data: ContribuicaoInsert): Promise<void> {
    const { error } = await supabase.from(this.TABLE).insert(data);
    if (error) {
      console.error('[ContribuicoesRepository] Erro ao inserir contribuição:', error);
      throw new Error(error.message);
    }
  }

  /** Verifica se já existe uma contribuição com o order_nsu informado (idempotência). */
  async existsByOrderNsu(order_nsu: string): Promise<boolean> {
    const { count, error } = await supabase
      .from(this.TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('order_nsu', order_nsu);

    if (error) {
      console.error('[ContribuicoesRepository] Erro ao verificar order_nsu:', error);
      return false; // Em caso de falha, permite o insert (melhor duplicar que perder)
    }

    return (count ?? 0) > 0;
  }

  async getContagensPorItem(): Promise<ContagemPorItem[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('item_id');

    if (error) {
      console.error('[ContribuicoesRepository] Erro ao buscar contagens:', error);
      throw new Error(error.message);
    }

    const rows = data || [];
    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(row.item_id, (map.get(row.item_id) ?? 0) + 1);
    }

    return Array.from(map.entries()).map(([item_id, total]) => ({ item_id, total }));
  }
}
