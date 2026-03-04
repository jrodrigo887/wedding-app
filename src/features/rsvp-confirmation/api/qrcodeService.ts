import QRCode from 'qrcode';
import type { QRCodeOptions } from '@shared/types';

interface QRCodeInternalOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export const qrcodeService = {
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
