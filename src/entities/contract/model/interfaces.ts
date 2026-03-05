import type { Contract, ContractForm } from './types';

/**
 * Interface: IContractRepository
 * Define o contrato para operações com contratos
 * Princípio: Dependency Inversion (SOLID)
 */
export interface IContractRepository {
  getAll(): Promise<Contract[]>;
  getById(id: string): Promise<Contract | null>;
  create(data: ContractForm): Promise<Contract>;
  update(id: string, data: ContractForm): Promise<Contract>;
  delete(id: string): Promise<void>;
}
