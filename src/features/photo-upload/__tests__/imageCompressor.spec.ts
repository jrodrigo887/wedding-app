import { describe, it, expect } from 'vitest';
import { formatFileSize, compressImage } from '../api/imageCompressor';

describe('imageCompressor', () => {
  describe('formatFileSize', () => {
    it('formata bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('formata kilobytes', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('formata megabytes', () => {
      expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
    });
  });

  describe('compressImage', () => {
    it('retorna arquivo sem compressão quando menor que 500KB', async () => {
      const smallFile = new File(['x'.repeat(100)], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(smallFile, 'size', { value: 100 });

      const result = await compressImage(smallFile);

      expect(result.originalSize).toBe(100);
      expect(result.compressedSize).toBe(100);
      expect(result.compressionRatio).toBe(1);
    });
  });
});
