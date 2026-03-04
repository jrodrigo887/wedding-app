import { supabase } from '@shared/lib/supabase';

const BUCKET_NAME = 'wedding-photos';

export const storageService = {
  async uploadPhoto(
    file: File | Blob,
    codigoConvidado: string,
    originalName?: string
  ): Promise<string> {
    const timestamp = Date.now();
    const uuid = crypto.randomUUID();
    const name = originalName || (file instanceof File ? file.name : 'photo.jpg');
    const extension = name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}_${uuid}.${extension}`;
    const storagePath = `${codigoConvidado}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('[StorageService] Erro ao fazer upload:', error);
      throw new Error('Erro ao enviar foto. Tente novamente.');
    }

    return storagePath;
  },

  async uploadVideo(
    file: File | Blob,
    codigoConvidado: string,
    originalName?: string
  ): Promise<string> {
    const timestamp = Date.now();
    const uuid = crypto.randomUUID();
    const name = originalName || (file instanceof File ? file.name : 'video.mp4');
    const extension = name.split('.').pop()?.toLowerCase() || 'mp4';
    const fileName = `${timestamp}_${uuid}.${extension}`;
    const storagePath = `${codigoConvidado}/videos/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('[StorageService] Erro ao fazer upload de vídeo:', error);
      throw new Error('Erro ao enviar vídeo. Tente novamente.');
    }

    return storagePath;
  },

  async uploadPoster(blob: Blob, codigoConvidado: string, videoName: string): Promise<string> {
    const timestamp = Date.now();
    const uuid = crypto.randomUUID();
    const baseName = videoName.replace(/\.[^.]+$/, '');
    const fileName = `${baseName}_${timestamp}_${uuid}_poster.jpg`;
    const storagePath = `${codigoConvidado}/thumbnails/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
    });

    if (error) {
      console.error('[StorageService] Erro ao fazer upload do poster:', error);
      throw new Error('Erro ao enviar thumbnail. Tente novamente.');
    }

    return storagePath;
  },

  getPublicUrl(storagePath: string): string {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    return data.publicUrl;
  },

  async deletePhoto(storagePath: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);

    if (error) {
      console.error('[StorageService] Erro ao deletar foto:', error);
      throw new Error('Erro ao deletar foto.');
    }
  },

  async deletePhotos(storagePaths: string[]): Promise<void> {
    if (storagePaths.length === 0) return;

    const { error } = await supabase.storage.from(BUCKET_NAME).remove(storagePaths);

    if (error) {
      console.error('[StorageService] Erro ao deletar fotos:', error);
      throw new Error('Erro ao deletar fotos.');
    }
  },

  async listGuestPhotos(codigoConvidado: string): Promise<string[]> {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(codigoConvidado);

    if (error) {
      console.error('[StorageService] Erro ao listar fotos:', error);
      return [];
    }

    return (data || []).map(file => `${codigoConvidado}/${file.name}`);
  },
};

export default storageService;
