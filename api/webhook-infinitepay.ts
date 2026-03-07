// ========================================
// Vercel Serverless Function - Webhook InfinityPay
// ========================================
// URL: /api/webhook-infinitepay
// Recebe a confirmação de pagamento da InfinityPay e persiste a contribuição no Supabase.
// A InfinityPay reenvia o webhook em caso de resposta 400 — retornamos 200 para idempotência.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { PaymentWebhookBody } from '../src/shared/api/contracts';
import type { ApiErrorResponse } from '../src/shared/api/contracts';
import type { ContribuicaoInsert } from '../src/features/lua-de-mel/api/supabaseContribuicoesRepository';
import { createClient } from '@supabase/supabase-js';

const TABLE = 'contribuicoes_lua_de_mel';

// Prefixo que identifica pedidos originados neste sistema
const ORDER_NSU_PREFIX = 'luamel-';

function mapCaptureMethod(captureMethod: string): 'pix' | 'cartao' {
  return captureMethod === 'pix' ? 'pix' : 'cartao';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // InfinityPay só envia POST — OPTIONS não é esperado, mas mantemos por segurança
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const body = (req.body ?? {}) as PaymentWebhookBody;
  const { order_nsu, capture_method, items } = body;

  // Valida que o pedido pertence ao nosso sistema
  if (!order_nsu || !order_nsu.startsWith(ORDER_NSU_PREFIX)) {
    console.warn(
      '[webhook-infinitepay] order_nsu inválido ou ausente:',
      order_nsu
    );
    return res
      .status(400)
      .json({ success: false, message: 'Pedido não encontrado' });
  }

  // Extrai item_id do formato "luamel-{item_id}-{timestamp}"
  const parts = order_nsu.split('-');
  const itemId = parseInt(parts[1], 10);

  if (isNaN(itemId)) {
    console.warn(
      '[webhook-infinitepay] item_id não pôde ser extraído do order_nsu:',
      order_nsu
    );
    return res
      .status(400)
      .json({ success: false, message: 'order_nsu com formato inválido' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[webhook-infinitepay] Env vars do Supabase ausentes');
    return res
      .status(400)
      .json({ success: false, message: 'Erro de configuração do servidor' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Idempotência: se já foi registrado (ex: reenvio da InfinityPay), responde 200
  const { count, error: countError } = await supabase
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('order_nsu', order_nsu);

  if (countError) {
    console.error(
      '[webhook-infinitepay] Erro ao verificar idempotência:',
      countError
    );
    // Não retorna 400 aqui para evitar reenvio desnecessário da InfinityPay
    return res.status(200).json({ success: true, message: null });
  }

  if ((count ?? 0) > 0) {
    console.info(
      '[webhook-infinitepay] Pagamento já registrado para order_nsu:',
      order_nsu
    );
    return res.status(200).json({ success: true, message: null });
  }

  // Lê título e preço do primeiro item enviado pela InfinityPay
  const firstItem = items?.[0];
  const itemTitle = firstItem?.description ?? `Item #${itemId}`;
  const itemPrice = firstItem ? firstItem.price / 100 : 0;

  const contribuicao: ContribuicaoInsert = {
    item_id: itemId,
    item_title: itemTitle,
    item_price: itemPrice,
    metodo: mapCaptureMethod(capture_method),
    order_nsu,
  };

  const { error: insertError } = await supabase
    .from(TABLE)
    .insert(contribuicao);

  if (insertError) {
    console.error(
      '[webhook-infinitepay] Erro ao inserir contribuição:',
      insertError
    );
    return res
      .status(400)
      .json({ success: false, message: 'Erro ao registrar contribuição' });
  }

  console.info(
    '[webhook-infinitepay] Contribuição registrada com sucesso. order_nsu:',
    order_nsu
  );
  return res.status(200).json({ success: true, message: null });
}
