import { supabase } from '@shared/lib/supabase';
import type { Guest, GuestStats } from '@/entities/guest';

/**
 * Repository: GuestRepositorySupabase
 * Implementação do repositório de convidados para Supabase.
 */
export class GuestRepositorySupabase {
  private readonly TABLE = 'convidados';

  constructor() {}

  async getAll(): Promise<Guest[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error(
        '[GuestRepositorySupabase] Erro ao buscar convidados:',
        error
      );
      throw new Error(error.message);
    }

    return this.mapToGuests(data || []);
  }

  async getById(id: number): Promise<Guest | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)

      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return this.mapToGuest(data);
  }

  async getByCode(code: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .ilike('codigo', code)

      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return this.mapToGuest(data);
  }

  async getStats(): Promise<GuestStats> {
    const [totalResult, confirmedResult, checkedInResult] = await Promise.all([
      supabase.from(this.TABLE).select('*', { count: 'exact', head: true }),
      supabase
        .from(this.TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('confirmado', true),
      supabase
        .from(this.TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('checkin', true),
    ]);

    const total = totalResult.count || 0;
    const confirmed = confirmedResult.count || 0;
    const checkedIn = checkedInResult.count || 0;

    return {
      total,
      confirmed,
      pending: total - confirmed,
      checkedIn,
    };
  }

  async getCheckedIn(): Promise<Guest[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')

      .eq('checkin', true)
      .order('horario_entrada', { ascending: false });

    if (error) {
      console.error(
        '[GuestRepositorySupabase] Erro ao buscar check-ins:',
        error
      );
      return [];
    }

    return this.mapToGuests(data || []);
  }

  async registerCheckin(code: string): Promise<void> {
    const guest = await this.getByCode(code);
    if (!guest) {
      throw new Error('Convidado não encontrado');
    }

    const { error } = await supabase
      .from(this.TABLE)
      .update({
        checkin: true,
        horario_entrada: new Date().toISOString(),
      })
      .eq('id', guest.id);
    if (error) {
      throw new Error(error.message);
    }
  }

  private mapToGuest(data: Record<string, unknown>): Guest {
    return {
      id: data.id as number,
      codigo: data.codigo as string,
      nome: data.nome as string,
      parceiro: (data.parceiro as string) || '',
      email: data.email as string,
      telefone: data.telefone as string,
      acompanhantes: (data.acompanhantes as number) || 0,
      confirmado: (data.confirmado as boolean) || false,
      data_confirmacao: data.data_confirmacao as string,
      checkin: (data.checkin as boolean) || false,
      horario_entrada: (data.horario_entrada as string) || '',
      observacoes: data.observacoes as string,
      invitation_delivery: (data.invitation_delivery as boolean) || false,
      invite_token: data.invite_token as string | undefined,
      short_code: data.short_code as string | undefined,
      recusou: (data.recusou as boolean) || false,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
    };
  }

  private mapToGuests(data: Record<string, unknown>[]): Guest[] {
    return data.map(item => this.mapToGuest(item));
  }

  async regenerateInviteToken(guestId: number): Promise<string> {
    const { data, error } = await supabase.rpc('rsvp_regenerate_invite_token', {
      p_guest_id: guestId,
    });
    if (error) throw new Error(error.message);
    return data as string;
  }
}
