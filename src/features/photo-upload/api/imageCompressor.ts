import imageCompression from 'browser-image-compression';
export { formatFileSize } from '@shared/utils';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  onProgress?: (progress: number) => void;
}

export interface CompressedResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  if (originalSize < 500 * 1024) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
    };
  }

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: opts.maxSizeMB,
      maxWidthOrHeight: opts.maxWidthOrHeight,
      useWebWorker: opts.useWebWorker,
      onProgress: opts.onProgress,
      fileType: 'image/jpeg',
    });

    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
      compressionRatio: originalSize / compressedFile.size,
    };
  } catch (error) {
    console.error('[ImageCompressor] Erro na compressão:', error);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
    };
  }
}

export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {},
  onFileProgress?: (index: number, total: number) => void
): Promise<CompressedResult[]> {
  const results: CompressedResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await compressImage(files[i], options);
    results.push(result);
    onFileProgress?.(i + 1, files.length);
  }

  return results;
}

