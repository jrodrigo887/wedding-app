import { ref } from 'vue';
import { compressImage, formatFileSize } from '../api/imageCompressor';
import { usePhotosStore } from '@/features/photo-state';

export function usePhotoUpload() {
  const store = usePhotosStore();

  const compressing = ref(false);
  const compressionProgress = ref(0);
  const previewUrl = ref<string | null>(null);
  const originalSize = ref<string>('');
  const compressedSize = ref<string>('');

  const generatePreview = (file: File): void => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = URL.createObjectURL(file);
    originalSize.value = formatFileSize(file.size);
  };

  const clearPreview = (): void => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = null;
    }
    originalSize.value = '';
    compressedSize.value = '';
    compressionProgress.value = 0;
  };

  const uploadWithCompression = async (file: File, caption?: string): Promise<boolean> => {
    compressing.value = true;
    compressionProgress.value = 0;

    try {
      const result = await compressImage(file, {
        onProgress: progress => {
          compressionProgress.value = progress;
        },
      });

      compressedSize.value = formatFileSize(result.compressedSize);
      compressing.value = false;

      const success = await store.uploadPhoto(result.file, caption);

      if (success) {
        clearPreview();
      }

      return success;
    } catch (error) {
      compressing.value = false;
      console.error('[usePhotoUpload] Erro:', error);
      return false;
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    const maxSize = 20 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato inválido. Use JPG, PNG ou WebP.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo 20MB.',
      };
    }

    return { valid: true };
  };

  return {
    compressing,
    compressionProgress,
    previewUrl,
    originalSize,
    compressedSize,
    generatePreview,
    clearPreview,
    uploadWithCompression,
    validateFile,
  };
}
