export interface PaymentWebhookItem {
  quantity: number;
  price: number; // em centavos
  description: string;
}

export interface PaymentWebhookBody {
  invoice_slug: string;
  amount: number;      // valor total em centavos
  paid_amount: number; // valor pago em centavos (pode incluir juros de parcelamento)
  installments: number;
  capture_method: 'credit_card' | 'debit_card' | 'pix' | string;
  transaction_nsu: string;
  order_nsu: string;
  receipt_url: string;
  items: PaymentWebhookItem[];
}

/** Resposta que nossa API devolve à InfinityPay após processar o webhook */
export interface WebhookResponse {
  success: boolean;
  message: string | null;
}
