export interface CheckoutRequest {
  item_id: string;
  item_title: string;
  item_price_brl: number;
}

export interface CheckoutResponse {
  checkout_url: string;
  order_nsu: string;
}
