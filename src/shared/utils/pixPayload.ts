/**
 * Gerador de payload PIX Copia e Cola (padrão EMV QR Code - Banco Central do Brasil)
 * Ref: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II-ManualdePadroesparaIniciacaodoPix.pdf
 */

/** CRC-16/CCITT-FALSE */
function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Formata um campo EMV: ID (2 chars) + tamanho (2 chars) + valor */
function f(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`;
}

/** Remove acentos para compatibilidade com o padrão PIX */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export interface PixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  description?: string;
}

/**
 * Gera um payload PIX Copia e Cola com valor embutido.
 * Quando escaneado por um app bancário, o valor é pré-preenchido automaticamente.
 */
export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  description,
}: PixPayloadParams): string {
  const gui = f('00', 'br.gov.bcb.pix');
  const key = f('01', pixKey);
  const desc = description ? f('02', description.slice(0, 25)) : '';
  const merchantInfo = f('26', gui + key + desc);

  const name = removeAccents(merchantName).slice(0, 25);
  const city = removeAccents(merchantCity).slice(0, 15);
  const amountStr = amount.toFixed(2);

  // ID 62: Additional Data — Reference Label obrigatório
  const additionalData = f('62', f('05', '***'));

  const body =
    f('00', '01') +        // Payload Format Indicator
    f('01', '12') +        // Point of Initiation: 12 = uso único com valor
    merchantInfo +          // Merchant Account Information (chave PIX)
    f('52', '0000') +      // Merchant Category Code
    f('53', '986') +       // Transaction Currency (986 = BRL)
    f('54', amountStr) +   // Transaction Amount
    f('58', 'BR') +        // Country Code
    f('59', name) +        // Merchant Name
    f('60', city) +        // Merchant City
    additionalData +        // Additional Data
    '6304';                 // CRC16 placeholder (sem valor ainda)

  return body + crc16(body);
}
