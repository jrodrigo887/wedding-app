export interface Contract {
  id?: string;          // uuid no banco (gen_random_uuid)
  responsavel: string | null;
  empresa: string | null;
  contato: number | null; // bigint no banco
  valor: number | null;
  pago: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ContractForm {
  responsavel: string;
  empresa: string;
  contato: string;        // campo de texto no form; convertido para number no repositório
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
