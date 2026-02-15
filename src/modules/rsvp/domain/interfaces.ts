// RSVP Module - Interfaces
// Contratos de repositórios do módulo de confirmação de presença

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
   * Confirma a presença de um convidado
   */
  confirmPresence(code: string): Promise<ConfirmPresenceResponse>;

  /**
   * Cancela/recusa a presença de um convidado
   */
  cancelPresence(code: string): Promise<ConfirmPresenceResponse>;

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
