// ========================================
// Vercel Serverless Function - Envio de Email
// ========================================
// URL: https://seu-projeto.vercel.app/api/send-email

import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SendEmailRequest, SendEmailResponse, ApiErrorResponse } from '../src/shared/api/contracts';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const SMTP_CONFIG: SmtpConfig = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'no-reply@notificacoes.rodrigoelisa.com.br',
    pass: process.env.SMTP_PASS || '',
  },
};

const WEDDING_COUPLE = 'Rodrigo e Elisa';

function getEmailTemplate(name: string, code: string, qrCodeUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu QR Code - ${WEDDING_COUPLE}</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">
        ${WEDDING_COUPLE}
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
        Confirmação de Presença
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #333; margin: 0 0 10px 0; font-weight: 400;">
        Olá, ${name}!
      </h2>

      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Sua presença foi confirmada! Abaixo está seu QR Code para o check-in no dia do evento.
      </p>

      <!-- QR Code -->
      <div style="background-color: #f8f8f8; border-radius: 12px; padding: 30px; margin: 0 0 30px 0;">
        <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px; border-radius: 8px;" />
        <p style="color: #888; font-size: 14px; margin: 15px 0 0 0;">
          Código: <strong style="color: #C44569;">${code}</strong>
        </p>
      </div>

      <!-- Instructions -->
      <div style="background-color: #fff8f0; border-left: 4px solid #FF6B9D; padding: 15px 20px; text-align: left; border-radius: 0 8px 8px 0;">
        <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.6;">
          <strong>Instruções:</strong><br>
          Apresente este QR Code na entrada do evento para fazer o check-in rapidamente.
          Você também pode informar o código acima caso prefira.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        Este email foi enviado automaticamente.<br>
        Em caso de dúvidas, entre em contato com os noivos.
      </p>
    </div>

  </div>
</body>
</html>
`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse<SendEmailResponse | ApiErrorResponse>
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { code, email, name } = req.body as SendEmailRequest;

    if (!code || !email || !name) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: code, email, name' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!SMTP_CONFIG.auth.pass) {
      console.error('SMTP_PASS não configurado');
      return res.status(500).json({ error: 'Serviço de email não configurado' });
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`;

    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    const info = await transporter.sendMail({
      from: `"${WEDDING_COUPLE}" <${SMTP_CONFIG.auth.user}>`,
      to: email,
      subject: `Seu QR Code - Casamento ${WEDDING_COUPLE}`,
      text: `Olá ${name}! Sua presença foi confirmada. Seu código é: ${code}`,
      html: getEmailTemplate(name, code, qrCodeUrl),
    });

    console.log('Email enviado:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Email enviado com sucesso!',
      messageId: info.messageId,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Erro ao enviar email:', err);
    return res.status(500).json({ error: 'Erro ao enviar email', details: err.message });
  }
}
