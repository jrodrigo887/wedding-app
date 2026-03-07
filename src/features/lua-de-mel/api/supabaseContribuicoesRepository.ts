import { supabase } from '@shared/lib/supabase';

export interface ContribuicaoInsert {
  item_id: number;
  item_title: string;
  item_price: number;
  metodo: 'pix' | 'cartao';
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
