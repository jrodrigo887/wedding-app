// ========================================
// Vercel Serverless Function - InfinityPay Checkout
// ========================================
// URL: /api/checkout-infinitepay
// Cria um link de checkout na InfinityPay com item e valor pré-definidos.
// O handle e redirect_url ficam server-side (sem VITE_) para não vazar no bundle.

const INFINITYPAY_CHECKOUT_URL =
  'https://api.infinitepay.io/invoices/public/checkout/links';

module.exports = async function handler(req, res) {
  // CORS — mesmo padrão do send-email.js
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const handle = process.env.INFINITYPAY_HANDLE;
  const redirectUrl = process.env.INFINITYPAY_REDIRECT_URL;

  if (!handle || !redirectUrl) {
    console.error('[checkout-infinitepay] Env vars ausentes:', { handle: !!handle, redirectUrl: !!redirectUrl });
    return res.status(500).json({ error: 'Configuração do servidor incompleta' });
  }

  const { item_id, item_title, item_price_brl } = req.body ?? {};

  if (!item_id || !item_title || item_price_brl == null) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: item_id, item_title, item_price_brl' });
  }

  const order_nsu = `luamel-${item_id}-${Date.now()}`;
  const price_centavos = Math.round(Number(item_price_brl) * 100);

  const payload = {
    handle,
    redirect_url: redirectUrl,
    order_nsu,
    items: [
      {
        quantity: 1,
        price: price_centavos,
        description: String(item_title).slice(0, 100),
      },
    ],
  };

  try {
    const response = await fetch(INFINITYPAY_CHECKOUT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('[checkout-infinitepay] InfinityPay error:', response.status, responseText);
      return res.status(502).json({
        error: 'Erro ao criar checkout na InfinityPay',
        detail: responseText,
        status: response.status,
      });
    }

    const data = JSON.parse(responseText);
    const checkoutUrl = data.url || data.checkout_url;

    if (!checkoutUrl) {
      console.error('[checkout-infinitepay] URL não encontrada na resposta:', data);
      return res.status(502).json({ error: 'Resposta inesperada da InfinityPay', detail: data });
    }

    return res.status(200).json({ checkout_url: checkoutUrl, order_nsu });

  } catch (error) {
    console.error('[checkout-infinitepay] Erro inesperado:', error);
    return res.status(500).json({ error: 'Erro interno', detail: error.message });
  }
};
