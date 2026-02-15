// Admin Module - Interfaces
// Contratos de repositórios do módulo administrativo

import type { Guest, GuestStats } from '@/entities/guest';
import type { Contract, ContractForm } from '@/entities/contract';

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
}

/**
 * Interface: IContractRepository
 * Define o contrato para operações com contratos
 * Princípio: Dependency Inversion (SOLID)
 */
export interface IContractRepository {
  getAll(): Promise<Contract[]>;
  getById(id: number): Promise<Contract | null>;
  create(data: ContractForm): Promise<Contract>;
  update(id: number, data: ContractForm): Promise<Contract>;
  delete(id: number): Promise<void>;
}
