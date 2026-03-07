// ========================================
// Contratos de tipo — Webhook InfinityPay
// ========================================

/** Item de compra enviado no payload do webhook */
export interface InfinityPayWebhookItem {
  quantity: number;
  price: number; // em centavos
  description: string;
}

/** Payload recebido da InfinityPay via POST ao webhook após pagamento confirmado */
export interface InfinityPayWebhookPayload {
  invoice_slug: string;
  amount: number;      // valor total em centavos
  paid_amount: number; // valor pago em centavos (pode incluir juros parcelamento)
  installments: number;
  capture_method: 'credit_card' | 'pix';
  transaction_nsu: string;
  order_nsu: string;
  receipt_url: string;
  items: InfinityPayWebhookItem[];
}

/** Resposta que nossa API devolve à InfinityPay */
export interface WebhookResponse {
  success: boolean;
  message: string | null;
}
