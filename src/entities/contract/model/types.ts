export interface Contract {
  id?: number;
  responsavel: string | null;
  empresa: string | null;
  contato: string | null;
  valor: number | null;
  pago: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ContractForm {
  responsavel: string;
  empresa: string;
  contato: string;
  valor: number | string;
  pago: number | string;
}

export interface ContractStats {
  totalValor: number;
  totalPago: number;
  totalRestante: number;
}

export const createEmptyContract = (): ContractForm => ({
  responsavel: '',
  empresa: '',
  contato: '',
  valor: '',
  pago: '',
});

export const createEmptyContractStats = (): ContractStats => ({
  totalValor: 0,
  totalPago: 0,
  totalRestante: 0,
});
