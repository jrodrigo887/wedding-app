import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Photo } from '@/entities/photo';
import { storageService } from '@shared/api/storageService';

export interface DownloadProgress {
  current: number;
  total: number;
  percentage: number;
}

export async function downloadPhotosAsZip(
  photos: Photo[],
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('fotos-casamento');

  if (!folder) {
    throw new Error('Erro ao criar pasta no ZIP');
  }

  let downloaded = 0;
  const total = photos.length;

  for (const photo of photos) {
    try {
      const url = storageService.getPublicUrl(photo.storage_path);
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`[DownloadService] Falha ao baixar foto ${photo.id}`);
        continue;
      }

      const blob = await response.blob();

      const timestamp = photo.created_at ? new Date(photo.created_at).getTime() : Date.now();
      const extension = photo.mime_type?.split('/')[1] || 'jpg';
      const guestName = photo.nome_convidado.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${guestName}_${timestamp}.${extension}`;

      folder.file(filename, blob);

      downloaded++;
      onProgress?.({
        current: downloaded,
        total,
        percentage: Math.round((downloaded / total) * 100),
      });
    } catch (err) {
      console.error(`[DownloadService] Erro ao baixar foto ${photo.id}:`, err);
    }
  }

  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const dateStr = new Date().toISOString().split('T')[0];
  saveAs(content, `fotos-casamento-${dateStr}.zip`);
}

export async function downloadSinglePhoto(photo: Photo): Promise<void> {
  try {
    const url = storageService.getPublicUrl(photo.storage_path);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Falha ao baixar foto');
    }

    const blob = await response.blob();
    const extension = photo.mime_type?.split('/')[1] || 'jpg';
    const guestName = photo.nome_convidado.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${guestName}_foto.${extension}`;

    saveAs(blob, filename);
  } catch (err) {
    console.error('[DownloadService] Erro ao baixar foto:', err);
    throw new Error('Erro ao baixar foto');
  }
}
