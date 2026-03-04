import type { Contract, ContractForm } from './types';

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
