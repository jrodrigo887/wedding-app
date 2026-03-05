export interface Guest {
  id?: number;
  codigo: string;
  nome: string;
  parceiro?: string;
  email?: string;
  telefone?: string;
  acompanhantes: number;
  confirmado: boolean;
  data_confirmacao?: string;
  checkin?: boolean;
  checkin?: boolean; // alias local de checkin (não existe no DB)
  horario_entrada?: string;
  observacoes?: string;
  invitation_delivery?: boolean; // convite entregue
  created_at?: string;
  updated_at?: string;
}

export interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  checkedIn: number;
}

export interface ConfirmPresenceResponse {
  success: boolean;
  message: string;
  guest: Omit<Guest, 'id'>;
}

export interface CheckinResponse {
  success: boolean;
  message: string;
  horario: string;
}

export interface SendQRCodeEmailParams {
  code: string;
  email: string;
  name: string;
}

export type RsvpGuest = Guest;
export type RsvpStats = GuestStats;

export const createEmptyGuestStats = (): GuestStats => ({
  total: 0,
  confirmed: 0,
  pending: 0,
  checkedIn: 0,
});

export const createEmptyRsvpStats = (): RsvpStats => createEmptyGuestStats();
