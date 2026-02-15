// ========================================
// TIPOS COMPARTILHADOS
// ========================================

// Convidado (Guest)
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
  entrada_confirmada?: boolean;
  horario_entrada?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Resposta de confirmacao de presenca
export interface ConfirmPresenceResponse {
  success: boolean;
  message: string;
  guest: {
    codigo: string;
    nome: string;
    parceiro?: string;
    acompanhantes: number;
    confirmado: boolean;
  };
}

// Resposta de check-in
export interface CheckinResponse {
  success: boolean;
  message: string;
  horario: string;
}

// Presente (Gift)
export interface Gift {
  id: string | number;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  status: 'available' | 'reserved';
  reservedBy?: string;
  type?: string;
}

// Cliente para pagamento
export interface Customer {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

// Opcoes de QR Code
export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

// Transacao pendente InfinityPay
export interface PendingTransaction {
  giftId: string | number;
  giftName: string;
  customer: Customer;
  orderNsu: string;
  createdAt: string;
}

// Configuracao InfinityPay
export interface InfinityPayConfig {
  handle: string;
  redirectUrl: string;
  webhookUrl: string;
  googleScriptUrl: string;
}

// Resposta do checkout InfinityPay
export interface CheckoutResponse {
  checkoutUrl: string;
  orderNsu: string;
  url?: string;
  checkout_url?: string;
}

// Notificacao
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
