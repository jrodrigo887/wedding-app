import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const code = req.query.code as string | undefined;
  if (!code || typeof code !== 'string' || code.length > 16) {
    return res.status(404).send('Link inválido.');
  }

  const { data, error } = await supabase.rpc('resolve_short_code', {
    p_short_code: code.toUpperCase(),
  });

  if (error || !data) {
    return res.status(404).send('Link inválido ou não encontrado.');
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.redirect(302, `/confirmar-presenca?guest=${data}`);
}
