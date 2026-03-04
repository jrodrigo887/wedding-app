import { formatFileSize } from '@shared/utils';
export { formatFileSize };

const MAX_VIDEO_DURATION = 60;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ACCEPTED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];

export interface VideoValidationResult {
  valid: boolean;
  error?: string;
  duration?: number;
}

export async function getVideoDuration(file: File | Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(Math.floor(video.duration));
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Erro ao carregar metadados do vídeo'));
    };

    video.src = URL.createObjectURL(file);
  });
}

export async function extractPosterFrame(file: File | Blob, timeInSeconds = 0.5): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Contexto de canvas não disponível'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const captureTime = Math.min(timeInSeconds, video.duration - 0.1);
      video.currentTime = Math.max(0, captureTime);
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        blob => {
          window.URL.revokeObjectURL(video.src);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Erro ao gerar thumbnail'));
          }
        },
        'image/jpeg',
        0.85
      );
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Erro ao processar vídeo para thumbnail'));
    };

    video.src = URL.createObjectURL(file);
  });
}

export async function validateVideo(file: File): Promise<VideoValidationResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ACCEPTED_VIDEO_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Formato não suportado. Use: ${ACCEPTED_VIDEO_EXTENSIONS.join(', ').toUpperCase()}`,
    };
  }

  if (file.type && !ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não suportado: ${file.type}`,
    };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    const sizeMB = Math.round(file.size / (1024 * 1024));
    return {
      valid: false,
      error: `Vídeo muito grande (${sizeMB}MB). Máximo: 100MB`,
    };
  }

  try {
    const duration = await getVideoDuration(file);
    if (duration > MAX_VIDEO_DURATION) {
      return {
        valid: false,
        error: `Vídeo muito longo (${duration}s). Máximo: ${MAX_VIDEO_DURATION} segundos`,
        duration,
      };
    }

    return {
      valid: true,
      duration,
    };
  } catch {
    return {
      valid: false,
      error: 'Não foi possível verificar a duração do vídeo',
    };
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const videoCompressor = {
  getVideoDuration,
  extractPosterFrame,
  validateVideo,
  formatDuration,
  formatFileSize,
  MAX_VIDEO_DURATION,
  MAX_VIDEO_SIZE,
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_VIDEO_EXTENSIONS,
};

export default videoCompressor;
