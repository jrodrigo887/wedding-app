// ========================================
// SERVICO DE QR CODE
// ========================================

import QRCode from 'qrcode';
import type { QRCodeOptions } from '@/types';

interface QRCodeInternalOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Servico para gerar QR Codes para check-in
 */
export const qrcodeService = {
  /**
   * Gera um QR Code como Data URL (base64)
   */
  async generateQRCode(code: string, options: QRCodeOptions = {}): Promise<string> {
    const defaultOptions: QRCodeInternalOptions = {
      width: options.width ?? 300,
      margin: options.margin ?? 2,
      color: {
        dark: options.color?.dark ?? '#000000',
        light: options.color?.light ?? '#ffffff',
      },
      errorCorrectionLevel: options.errorCorrectionLevel ?? 'H',
    };

    try {
      const dataUrl = await QRCode.toDataURL(code, defaultOptions);
      return dataUrl;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      throw new Error('Erro ao gerar QR Code');
    }
  },

  /**
   * Gera um QR Code e retorna como canvas element
   */
  async generateToCanvas(
    code: string,
    canvas: HTMLCanvasElement,
    options: QRCodeOptions = {}
  ): Promise<void> {
    const defaultOptions: QRCodeInternalOptions = {
      width: options.width ?? 300,
      margin: options.margin ?? 2,
      color: {
        dark: options.color?.dark ?? '#000000',
        light: options.color?.light ?? '#ffffff',
      },
      errorCorrectionLevel: options.errorCorrectionLevel ?? 'H',
    };

    try {
      await QRCode.toCanvas(canvas, code, defaultOptions);
    } catch (error) {
      console.error('Erro ao gerar QR Code no canvas:', error);
      throw new Error('Erro ao gerar QR Code');
    }
  },

  /**
   * Gera QR Code com estilo customizado para o casamento
   */
  async generateWeddingQRCode(code: string): Promise<string> {
    return this.generateQRCode(code, {
      width: 400,
      margin: 3,
      color: {
        dark: '#3d2b1f',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  },

  /**
   * Faz download do QR Code como imagem
   */
  downloadQRCode(dataUrl: string, filename = 'qrcode-checkin.png'): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default qrcodeService;
