import type {
  RsvpGuest,
  ConfirmPresenceResponse,
  CheckinResponse,
  RsvpStats,
  SendQRCodeEmailParams,
} from '@/entities/guest';

/**
 * Interface: IRsvpRepository
 * Define o contrato para operações de RSVP (confirmação de presença)
 * Princípio: Dependency Inversion (SOLID)
 */
export interface IRsvpRepository {
  /**
   * Busca um convidado pelo código
   */
  getByCode(code: string): Promise<RsvpGuest>;

  /**
   * Busca um convidado pelo invite_token exclusivo
   */
  getByToken(token: string): Promise<RsvpGuest>;

  /**
   * Confirma a presença de um convidado (via código — admin/legado)
   */
  confirmPresence(code: string): Promise<ConfirmPresenceResponse>;

  /**
   * Confirma a presença via invite_token (RPC SECURITY DEFINER)
   */
  confirmPresenceByToken(token: string): Promise<void>;

  /**
   * Cancela a presença de um convidado (via código — admin/legado)
   */
  cancelPresence(code: string): Promise<ConfirmPresenceResponse>;

  /**
   * Cancela a presença via invite_token (RPC SECURITY DEFINER)
   */
  cancelPresenceByToken(token: string): Promise<void>;

  /**
   * Recusa a presença explicitamente (via código — admin/legado)
   */
  declinePresence(code: string): Promise<ConfirmPresenceResponse>;

  /**
   * Recusa a presença via invite_token (RPC SECURITY DEFINER)
   */
  declinePresenceByToken(token: string): Promise<void>;

  /**
   * Registra o check-in de um convidado no evento
   */
  registerCheckin(code: string): Promise<CheckinResponse>;

  /**
   * Busca a contagem de check-ins realizados
   */
  getCheckinCount(): Promise<number>;

  /**
   * Busca estatísticas gerais dos convidados
   */
  getStats(): Promise<RsvpStats>;

  /**
   * Busca lista de convidados com check-in realizado
   */
  getCheckedInGuests(): Promise<RsvpGuest[]>;

  /**
   * Envia QR Code por email
   */
  sendQRCodeEmail(params: SendQRCodeEmailParams): Promise<{ success: boolean; error?: string }>;
}
