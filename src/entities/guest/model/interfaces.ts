import type { Guest, GuestStats } from './types';

/**
 * Interface: IGuestRepository
 * Define o contrato para operações com convidados
 * Princípio: Dependency Inversion (SOLID)
 */
export interface IGuestRepository {
  getAll(): Promise<Guest[]>;
  getById(id: number): Promise<Guest | null>;
  getByCode(code: string): Promise<Guest | null>;
  getStats(): Promise<GuestStats>;
  getCheckedIn(): Promise<Guest[]>;
  registerCheckin(code: string): Promise<void>;
  regenerateInviteToken(guestId: number): Promise<string>;
}
