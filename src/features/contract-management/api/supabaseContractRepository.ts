import { supabase } from '@shared/lib/supabase';
import type { Contract, ContractForm } from '@/entities/contract';

/**
 * Repository: ContractRepositorySupabase
 * Implementação do repositório de contratos para Supabase.
 */
export class ContractRepositorySupabase {
  private readonly TABLE = 'contratos';
  readonly tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        '[ContractRepositorySupabase] Erro ao buscar contratos:',
        error
      );
      throw new Error(error.message);
    }

    return data || [];
  }

  async getById(id: number): Promise<Contract | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return data;
  }

  async create(form: ContractForm): Promise<Contract> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .insert({
        responsavel: form.responsavel || null,
        empresa: form.empresa || null,
        contato: form.contato || null,
        valor: form.valor ? Number(form.valor) : null,
        pago: form.pago ? Number(form.pago) : null,
        tenant_id: this.tenantId,
      })
      .select()
      .single();

    if (error) {
      console.error(
        '[ContractRepositorySupabase] Erro ao criar contrato:',
        error
      );
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: number, form: ContractForm): Promise<Contract> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .update({
        responsavel: form.responsavel || null,
        empresa: form.empresa || null,
        contato: form.contato || null,
        valor: form.valor ? Number(form.valor) : null,
        pago: form.pago ? Number(form.pago) : null,
      })
      .eq('id', id)

      .select()
      .single();

    if (error) {
      console.error(
        '[ContractRepositorySupabase] Erro ao atualizar contrato:',
        error
      );
      throw new Error(error.message);
    }

    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
    if (error) {
      console.error(
        '[ContractRepositorySupabase] Erro ao excluir contrato:',
        error
      );
      throw new Error(error.message);
    }
  }
}
