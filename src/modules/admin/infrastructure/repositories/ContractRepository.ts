import { supabase } from '@shared/lib/supabase';
import type { IContractRepository } from '../../domain/interfaces';
import type { Contract, ContractForm } from '@/entities/contract';

/**
 * Repository: ContractRepository
 * Implementação concreta do repositório de contratos
 * Princípio: Single Responsibility (SOLID)
 */
export class ContractRepository implements IContractRepository {
  private readonly TABLE = 'contratos';

  async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ContractRepository] Erro ao buscar contratos:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async getById(id: number): Promise<Contract | null> {
    const { data, error } = await supabase.from(this.TABLE).select('*').eq('id', id).single();

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
      })
      .select()
      .single();

    if (error) {
      console.error('[ContractRepository] Erro ao criar contrato:', error);
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
      console.error('[ContractRepository] Erro ao atualizar contrato:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);

    if (error) {
      console.error('[ContractRepository] Erro ao excluir contrato:', error);
      throw new Error(error.message);
    }
  }
}

// Singleton instance
export const contractRepository = new ContractRepository();
