import { supabase } from '@shared/lib/supabase';
import type { Contract, ContractForm } from '@/entities/contract';

/**
 * Repository: ContractRepositorySupabase
 * Implementação do repositório de contratos para Supabase.
 *
 * Nota de schema:
 *   - contratos.id      → uuid (string, não number)
 *   - contratos.contato → bigint (number)
 */
export class ContractRepositorySupabase {
  private readonly TABLE = 'contratos';

  constructor() {}

  async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ContractRepositorySupabase] Erro ao buscar contratos:', error);
      throw new Error(error.message);
    }

    return (data || []).map(row => this.mapToContract(row));
  }

  async getById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return this.mapToContract(data);
  }

  async create(form: ContractForm): Promise<Contract> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .insert({
        responsavel: form.responsavel || null,
        empresa: form.empresa || null,
        contato: form.contato ? Number(form.contato) : null,
        valor: form.valor ? Number(form.valor) : null,
        pago: form.pago ? Number(form.pago) : null,
      })
      .select()
      .single();

    if (error) {
      console.error('[ContractRepositorySupabase] Erro ao criar contrato:', error);
      throw new Error(error.message);
    }

    return this.mapToContract(data);
  }

  async update(id: string, form: ContractForm): Promise<Contract> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .update({
        responsavel: form.responsavel || null,
        empresa: form.empresa || null,
        contato: form.contato ? Number(form.contato) : null,
        valor: form.valor ? Number(form.valor) : null,
        pago: form.pago ? Number(form.pago) : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[ContractRepositorySupabase] Erro ao atualizar contrato:', error);
      throw new Error(error.message);
    }

    return this.mapToContract(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);

    if (error) {
      console.error('[ContractRepositorySupabase] Erro ao excluir contrato:', error);
      throw new Error(error.message);
    }
  }

  private mapToContract(data: Record<string, unknown>): Contract {
    return {
      id: data.id as string,
      responsavel: (data.responsavel as string) ?? null,
      empresa: (data.empresa as string) ?? null,
      contato: data.contato != null ? Number(data.contato) : null,
      valor: data.valor != null ? Number(data.valor) : null,
      pago: data.pago != null ? Number(data.pago) : null,
      created_at: data.created_at as string | undefined,
      updated_at: data.updated_at as string | undefined,
    };
  }
}
