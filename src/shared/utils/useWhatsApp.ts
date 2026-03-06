/**
 * Composable: useWhatsApp
 * Utilitários para abrir WhatsApp com mensagem pré-formatada.
 * - Mobile: abre app nativo (wa.me redireciona para whatsapp://)
 * - Desktop/Tablet: abre web.whatsapp.com
 */

/**
 * Formata número brasileiro para E.164 internacional.
 * Ex: "(83) 99999-1234" → "5583999991234"
 */
function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length === 11 || digits.length === 10) return `55${digits}`;
  return digits;
}

export function useWhatsApp() {
  /**
   * Abre WhatsApp sem destinatário (convidado escolhe para quem enviar).
   * Ideal para o convidado compartilhar a própria confirmação.
   */
  const openWhatsApp = (message: string): void => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /**
   * Abre WhatsApp direto para um número específico.
   * Ideal para o admin enviar o link de convite para o convidado.
   */
  const openWhatsAppDirect = (phone: string, message: string): void => {
    const number = formatPhoneE164(phone);
    const url = `https://wa.me/55${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /**
   * Retorna a URL de compartilhamento (sem abrir).
   */
  const buildShareUrl = (message: string): string =>
    `https://wa.me/?text=${encodeURIComponent(message)}`;

  /**
   * Retorna a URL direta para um número (sem abrir).
   */
  const buildDirectUrl = (phone: string, message: string): string => {
    const number = formatPhoneE164(phone);
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  return { openWhatsApp, openWhatsAppDirect, buildShareUrl, buildDirectUrl };
}
