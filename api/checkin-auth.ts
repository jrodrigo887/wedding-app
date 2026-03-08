import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, randomUUID } from 'node:crypto';

const CHECKIN_PIN = process.env.CHECKIN_PIN;
const SESSION_SECRET = process.env.CHECKIN_SESSION_SECRET;
const COOKIE_NAME = 'checkin_session';
const COOKIE_MAX_AGE = 2 * 24 * 60 * 60; // 2 dias em segundos

// Rate limiting simples em memória (adequado para evento com ~10-20 dispositivos)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function signToken(token: string): string {
  const hmac = createHmac('sha256', SESSION_SECRET!);
  hmac.update(token);
  return `${token}.${hmac.digest('hex')}`;
}

function verifyToken(signedToken: string): boolean {
  const lastDot = signedToken.lastIndexOf('.');
  if (lastDot === -1) return false;
  const token = signedToken.substring(0, lastDot);
  const signature = signedToken.substring(lastDot + 1);
  const expected = createHmac('sha256', SESSION_SECRET!).update(token).digest('hex');
  // Comparação constante para evitar timing attacks
  if (signature.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function getClientIp(req: VercelRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!CHECKIN_PIN || !SESSION_SECRET) {
    return res.status(500).json({ error: 'Servidor não configurado corretamente.' });
  }

  // GET — verifica se há sessão válida
  if (req.method === 'GET') {
    const cookie = parseCookies(req)[COOKIE_NAME];
    if (!cookie || !verifyToken(cookie)) {
      return res.status(200).json({ authenticated: false });
    }
    return res.status(200).json({ authenticated: true });
  }

  // POST — valida PIN e cria sessão
  if (req.method === 'POST') {
    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos.' });
    }

    const { pin } = req.body ?? {};
    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({ error: 'PIN não informado.' });
    }

    if (pin !== CHECKIN_PIN) {
      return res.status(401).json({ error: 'PIN incorreto. Tente novamente.' });
    }

    const token = randomUUID();
    const signed = signToken(token);
    const cookieValue = [
      `${COOKIE_NAME}=${signed}`,
      `Max-Age=${COOKIE_MAX_AGE}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      'Secure',
    ].join('; ');

    res.setHeader('Set-Cookie', cookieValue);
    return res.status(200).json({ success: true });
  }

  // DELETE — encerra sessão
  if (req.method === 'DELETE') {
    const cookieValue = [
      `${COOKIE_NAME}=`,
      'Max-Age=0',
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      'Secure',
    ].join('; ');
    res.setHeader('Set-Cookie', cookieValue);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}

function parseCookies(req: VercelRequest): Record<string, string> {
  const raw = req.headers.cookie ?? '';
  return Object.fromEntries(
    raw.split(';').map(part => {
      const [key, ...rest] = part.trim().split('=');
      return [key?.trim() ?? '', rest.join('=')];
    })
  );
}
