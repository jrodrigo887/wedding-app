import { supabase } from '@shared/lib/supabase';
import type { IRsvpRepository } from '@/entities/rsvp';
import type {
  RsvpGuest,
  ConfirmPresenceResponse,
  CheckinResponse,
  RsvpStats,
  SendQRCodeEmailParams,
} from '@/entities/guest';

const syncToGoogleScript = async (
  action: string,
  data: Record<string, string>
): Promise<void> => {
  const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!googleScriptUrl) {
    console.log('[Google Script] URL não configurada, sincronização ignorada');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('action', action);
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    await fetch(googleScriptUrl, {
      method: 'POST',
      body: formData,
    });
    console.log(`[Google Script] Dados sincronizados: ${action}`);
  } catch (error) {
    console.warn(
      '[Google Script] Erro ao sincronizar:',
      error instanceof Error ? error.message : error
    );
  }
};

export class RsvpRepository implements IRsvpRepository {
  private readonly TABLE = 'convidados';

  async getByCode(code: string): Promise<RsvpGuest> {
    if (!code) {
      throw new Error('Código não informado');
    }

    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .ilike('codigo', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(
          'Código não encontrado na lista de convidados. Por favor, verifique com os noivos.'
        );
      }
      console.error('[RsvpRepository] Erro ao verificar convidado:', error);
      throw new Error(error.message);
    }

    return this.mapToRsvpGuest(data);
  }

  async confirmPresence(code: string): Promise<ConfirmPresenceResponse> {
    if (!code) {
      throw new Error('Código não informado');
    }

    const { data: guest, error: fetchError } = await supabase
      .from(this.TABLE)
      .select('*')
      .ilike('codigo', code)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error(
          'Código não encontrado na lista de convidados. Por favor, verifique com os noivos.'
        );
      }
      throw new Error(fetchError.message);
    }

    const { error: updateError } = await supabase
      .from(this.TABLE)
      .update({
        confirmado: true,
        data_confirmacao: new Date().toISOString(),
      })
      .eq('id', guest.id);

    if (updateError) {
      console.error(
        '[RsvpRepository] Erro ao confirmar presença:',
        updateError
      );
      throw new Error(updateError.message);
    }

    let message = `Presença confirmada com sucesso, ${guest.nome}!`;
    if (guest.parceiro) {
      message = `Presença confirmada com sucesso, ${guest.nome} e ${guest.parceiro}!`;
    }

    syncToGoogleScript('confirmPresence', { code: guest.codigo });

    return {
      success: true,
      message,
      guest: {
        codigo: guest.codigo,
        nome: guest.nome,
        parceiro: guest.parceiro,
        acompanhantes: guest.acompanhantes || 0,
        confirmado: true,
      },
    };
  }

  async cancelPresence(code: string): Promise<ConfirmPresenceResponse> {
    if (!code) {
      throw new Error('Código não informado');
    }

    const { data: guest, error: fetchError } = await supabase
      .from(this.TABLE)
      .select('*')
      .ilike('codigo', code)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error(
          'Código não encontrado na lista de convidados. Por favor, verifique com os noivos.'
        );
      }
      throw new Error(fetchError.message);
    }

    const { error: updateError } = await supabase
      .from(this.TABLE)
      .update({
        confirmado: false,
        data_confirmacao: new Date().toISOString(),
      })
      .eq('id', guest.id);

    if (updateError) {
      console.error('[RsvpRepository] Erro ao cancelar presença:', updateError);
      throw new Error(updateError.message);
    }

    let message = `Presença cancelada com sucesso, ${guest.nome}!`;
    if (guest.parceiro) {
      message = `Presença cancelada com sucesso, ${guest.nome} e ${guest.parceiro}!`;
    }

    syncToGoogleScript('cancelPresence', { code: guest.codigo });

    return {
      success: true,
      message,
      guest: {
        codigo: guest.codigo,
        nome: guest.nome,
        parceiro: guest.parceiro,
        acompanhantes: guest.acompanhantes || 0,
        confirmado: false,
      },
    };
  }

  async registerCheckin(code: string): Promise<CheckinResponse> {
    if (!code) {
      throw new Error('Código não informado');
    }

    const { data: guest, error: fetchError } = await supabase
      .from(this.TABLE)
      .select('*')
      .ilike('codigo', code)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('Código não encontrado na lista de convidados');
      }
      throw new Error(fetchError.message);
    }

    if (guest.checkin) {
      const horarioAnterior = guest.horario_entrada
        ? new Date(guest.horario_entrada).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
      throw new Error(
        `Check-in já realizado${horarioAnterior ? ` às ${horarioAnterior}` : ''}`
      );
    }

    const now = new Date();
    const hora = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const { error: updateError } = await supabase
      .from(this.TABLE)
      .update({
        checkin: true,
        horario_entrada: now.toISOString(),
      })
      .eq('id', guest.id);

    if (updateError) {
      console.error(
        '[RsvpRepository] Erro ao registrar check-in:',
        updateError
      );
      throw new Error(updateError.message);
    }

    let message = `Check-in realizado para ${guest.nome}!`;
    if (guest.parceiro) {
      message = `Check-in realizado para ${guest.nome} e ${guest.parceiro}!`;
    }

    syncToGoogleScript('registerCheckin', { code: guest.codigo });

    return {
      success: true,
      message,
      horario: hora,
    };
  }

  async getCheckinCount(): Promise<number> {
    const { count, error } = await supabase
      .from(this.TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('checkin', true);

    if (error) {
      console.error(
        '[RsvpRepository] Erro ao buscar contagem de check-ins:',
        error
      );
      return 0;
    }

    return count || 0;
  }

  async getStats(): Promise<RsvpStats> {
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

  async getCheckedInGuests(): Promise<RsvpGuest[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('checkin', true)
      .order('horario_entrada', { ascending: false });

    if (error) {
      console.error('[RsvpRepository] Erro ao buscar check-ins:', error);
      return [];
    }

    return (data || []).map(item => this.mapToRsvpGuest(item));
  }

  async sendQRCodeEmail(
    params: SendQRCodeEmailParams
  ): Promise<{ success: boolean; error?: string }> {
    const { code, email, name } = params;
    const emailApiUrl = import.meta.env.VITE_EMAIL_API_URL;

    if (!emailApiUrl) {
      console.error('[RsvpRepository] URL da API de email não configurada');
      throw new Error('Serviço de email não configurado');
    }

    try {
      const response = await fetch(emailApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, email, name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao enviar email');
      }

      return data;
    } catch (error) {
      console.error('[RsvpRepository] Erro ao enviar email:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao enviar email'
      );
    }
  }

  async getByToken(token: string): Promise<RsvpGuest> {
    if (!token) throw new Error('Token não informado');

    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('invite_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(
          'Link inválido ou não encontrado. Verifique com os noivos.'
        );
      }
      throw new Error(error.message);
    }

    return this.mapToRsvpGuest(data);
  }

  async declinePresence(code: string): Promise<ConfirmPresenceResponse> {
    if (!code) throw new Error('Código não informado');

    const { data: guest, error: fetchError } = await supabase
      .from(this.TABLE)
      .select('*')
      .ilike('codigo', code)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error(
          'Código não encontrado na lista de convidados. Por favor, verifique com os noivos.'
        );
      }
      throw new Error(fetchError.message);
    }

    const { error: updateError } = await supabase
      .from(this.TABLE)
      .update({
        confirmado: false,
        recusou: true,
        data_confirmacao: new Date().toISOString(),
      })
      .eq('id', guest.id);

    if (updateError) throw new Error(updateError.message);

    const message = guest.parceiro
      ? `Ausência registrada para ${guest.nome} e ${guest.parceiro}.`
      : `Ausência registrada para ${guest.nome}.`;

    syncToGoogleScript('declinePresence', { code: guest.codigo });

    return {
      success: true,
      message,
      guest: {
        codigo: guest.codigo,
        nome: guest.nome,
        parceiro: guest.parceiro,
        acompanhantes: guest.acompanhantes || 0,
        confirmado: false,
      },
    };
  }

  async regenerateInviteToken(guestId: number): Promise<string> {
    const newToken = crypto.randomUUID();
    const { error } = await supabase
      .from(this.TABLE)
      .update({ invite_token: newToken })
      .eq('id', guestId);
    if (error) throw new Error(error.message);
    return newToken;
  }

  private mapToRsvpGuest(data: Record<string, unknown>): RsvpGuest {
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
      invite_token: data.invite_token as string | undefined,
      recusou: (data.recusou as boolean) || false,
    };
  }
}

export const rsvpRepository = new RsvpRepository();

/**
 * RsvpRepositorySupabase - Implementação com suporte a multi-tenancy
 * Usada pelo repositoryFactory (app/providers)
 */
export class RsvpRepositorySupabase
  extends RsvpRepository
  implements IRsvpRepository
{
  constructor() {
    super();
  }

  override async getByCode(code: string): Promise<RsvpGuest> {
    if (!code) throw new Error('Código não informado');
    const { data, error } = await supabase
      .from('convidados')
      .select('*')
      .ilike('codigo', code)

      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(
          'Código não encontrado na lista de convidados. Por favor, verifique com os noivos.'
        );
      }
      throw new Error(error.message);
    }
    return this.mapToRsvpGuestPublic(data);
  }

  override async confirmPresence(
    code: string
  ): Promise<ConfirmPresenceResponse> {
    const guest = await this.getByCode(code);
    const { error } = await supabase
      .from('convidados')
      .update({ confirmado: true, data_confirmacao: new Date().toISOString() })
      .eq('id', guest.id);
    if (error) throw new Error(error.message);
    syncToGoogleScript('confirmPresence', { code: guest.codigo });
    return {
      success: true,
      message: guest.parceiro
        ? `Presença confirmada com sucesso, ${guest.nome} e ${guest.parceiro}!`
        : `Presença confirmada com sucesso, ${guest.nome}!`,
      guest: { ...guest, confirmado: true },
    };
  }

  override async cancelPresence(
    code: string
  ): Promise<ConfirmPresenceResponse> {
    const guest = await this.getByCode(code);
    const { error } = await supabase
      .from('convidados')
      .update({ confirmado: false, data_confirmacao: new Date().toISOString() })
      .eq('id', guest.id);
    if (error) throw new Error(error.message);
    syncToGoogleScript('cancelPresence', { code: guest.codigo });
    return {
      success: true,
      message: guest.parceiro
        ? `Presença cancelada com sucesso, ${guest.nome} e ${guest.parceiro}!`
        : `Presença cancelada com sucesso, ${guest.nome}!`,
      guest: { ...guest, confirmado: false },
    };
  }

  override async registerCheckin(code: string): Promise<CheckinResponse> {
    const guest = await this.getByCode(code);
    if (guest.checkin) {
      const h = guest.horario_entrada
        ? new Date(guest.horario_entrada).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
      throw new Error(`Check-in já realizado${h ? ` às ${h}` : ''}`);
    }
    const now = new Date();
    const { error } = await supabase
      .from('convidados')
      .update({ checkin: true, horario_entrada: now.toISOString() })
      .eq('id', guest.id);
    if (error) throw new Error(error.message);
    syncToGoogleScript('registerCheckin', { code: guest.codigo });
    return {
      success: true,
      message: guest.parceiro
        ? `Check-in realizado para ${guest.nome} e ${guest.parceiro}!`
        : `Check-in realizado para ${guest.nome}!`,
      horario: now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }

  override async getCheckinCount(): Promise<number> {
    const { count, error } = await supabase
      .from('convidados')
      .select('*', { count: 'exact', head: true })

      .eq('checkin', true);
    if (error) return 0;
    return count || 0;
  }

  override async getStats(): Promise<RsvpStats> {
    const [t, c, ch] = await Promise.all([
      supabase.from('convidados').select('*', { count: 'exact', head: true }),
      supabase
        .from('convidados')
        .select('*', { count: 'exact', head: true })
        .eq('confirmado', true),
      supabase
        .from('convidados')
        .select('*', { count: 'exact', head: true })
        .eq('checkin', true),
    ]);
    const total = t.count || 0;
    const confirmed = c.count || 0;
    const checkedIn = ch.count || 0;
    return { total, confirmed, pending: total - confirmed, checkedIn };
  }

  override async getCheckedInGuests(): Promise<RsvpGuest[]> {
    const { data, error } = await supabase
      .from('convidados')
      .select('*')

      .eq('checkin', true)
      .order('horario_entrada', { ascending: false });
    if (error) return [];
    return (data || []).map((item: Record<string, unknown>) =>
      this.mapToRsvpGuestPublic(item)
    );
  }

  override async declinePresence(
    code: string
  ): Promise<ConfirmPresenceResponse> {
    const guest = await this.getByCode(code);
    const { error } = await supabase
      .from('convidados')
      .update({
        confirmado: false,
        recusou: true,
        data_confirmacao: new Date().toISOString(),
      })
      .eq('id', guest.id);
    if (error) throw new Error(error.message);
    syncToGoogleScript('declinePresence', { code: guest.codigo });
    return {
      success: true,
      message: guest.parceiro
        ? `Ausência registrada para ${guest.nome} e ${guest.parceiro}.`
        : `Ausência registrada para ${guest.nome}.`,
      guest: { ...guest, confirmado: false },
    };
  }

  private mapToRsvpGuestPublic(data: Record<string, unknown>): RsvpGuest {
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
      invite_token: data.invite_token as string | undefined,
      recusou: (data.recusou as boolean) || false,
    };
  }
}
