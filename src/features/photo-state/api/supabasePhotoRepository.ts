import { supabase } from '@shared/lib/supabase';
import { storageService } from '@shared/api/storageService';
import { compressImage } from '@/features/photo-upload';
import type {
  IPhotoRepository,
  Photo,
  PhotoUploadData,
  PhotoUploadResponse,
  PhotoStats,
  MediaUploadData,
  GuestMediaCount,
} from '@/entities/photo';
import type { PhotoComment, PhotoCommentForm } from '@/entities/comment';

/**
 * Repository: PhotoRepositorySupabase
 * Implementação do repositório de fotos para Supabase
 * Suporta multi-tenancy através do tenantId
 */
export class PhotoRepositorySupabase implements IPhotoRepository {
  private readonly TABLE = 'fotos';
  private readonly LIKES_TABLE = 'foto_likes';
  private readonly COMMENTS_TABLE = 'foto_comentarios';
  private readonly MAX_PHOTOS_PER_GUEST = 20;
  private readonly MAX_VIDEOS_PER_GUEST = 5;

  constructor() {}

  async getApprovedPhotos(limit = 50, offset = 0): Promise<Photo[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')

      .eq('aprovado', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao buscar fotos aprovadas:',
        error
      );
      throw new Error(error.message);
    }

    return this.mapPhotosWithUrls(data || []);
  }

  async getAllPhotos(): Promise<Photo[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')

      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao buscar todas as fotos:',
        error
      );
      throw new Error(error.message);
    }

    return this.mapPhotosWithUrls(data || []);
  }

  async getPendingPhotos(): Promise<Photo[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')

      .eq('aprovado', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao buscar fotos pendentes:',
        error
      );
      throw new Error(error.message);
    }

    return this.mapPhotosWithUrls(data || []);
  }

  async getPhotosByGuest(codigo: string): Promise<Photo[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')

      .ilike('codigo_convidado', codigo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao buscar fotos do convidado:',
        error
      );
      throw new Error(error.message);
    }

    return this.mapPhotosWithUrls(data || []);
  }

  async getPhotoById(id: number): Promise<Photo | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)

      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[PhotoRepositorySupabase] Erro ao buscar foto:', error);
      throw new Error(error.message);
    }

    return this.mapPhotoWithUrl(data);
  }

  async uploadPhoto(uploadData: PhotoUploadData): Promise<PhotoUploadResponse> {
    const currentCount = await this.getGuestPhotoCount(
      uploadData.codigo_convidado
    );
    if (currentCount >= this.MAX_PHOTOS_PER_GUEST) {
      return {
        success: false,
        message: `Limite de ${this.MAX_PHOTOS_PER_GUEST} fotos atingido`,
      };
    }

    try {
      const { file: compressedFile } = await compressImage(uploadData.file);

      const storagePath = await storageService.uploadPhoto(
        compressedFile,
        uploadData.codigo_convidado
      );

      const shouldAutoApprove = this.shouldAutoApprove();

      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({
          codigo_convidado: uploadData.codigo_convidado,
          nome_convidado: uploadData.nome_convidado,
          storage_path: storagePath,
          original_filename: uploadData.file.name,
          file_size: compressedFile.size,
          mime_type: compressedFile.type,
          caption: uploadData.caption || null,
          aprovado: shouldAutoApprove,

          media_type: 'photo',
        })
        .select()
        .single();

      if (error) {
        await storageService.deletePhoto(storagePath);
        throw new Error(error.message);
      }

      const photo = this.mapPhotoWithUrl(data);

      return {
        success: true,
        message: shouldAutoApprove
          ? 'Foto enviada com sucesso!'
          : 'Foto enviada! Aguardando aprovação.',
        photo,
      };
    } catch (err) {
      console.error('[PhotoRepositorySupabase] Erro ao fazer upload:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao enviar foto',
      };
    }
  }

  async uploadVideo(uploadData: MediaUploadData): Promise<PhotoUploadResponse> {
    const mediaCount = await this.getGuestMediaCount(
      uploadData.codigo_convidado
    );
    if (mediaCount.videos >= this.MAX_VIDEOS_PER_GUEST) {
      return {
        success: false,
        message: `Limite de ${this.MAX_VIDEOS_PER_GUEST} vídeos atingido`,
      };
    }

    let storagePath: string | null = null;
    let posterPath: string | null = null;

    try {
      storagePath = await storageService.uploadVideo(
        uploadData.file,
        uploadData.codigo_convidado
      );

      if (uploadData.posterBlob) {
        posterPath = await storageService.uploadPoster(
          uploadData.posterBlob,
          uploadData.codigo_convidado,
          uploadData.file.name
        );
      }

      const shouldAutoApprove = this.shouldAutoApprove();

      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({
          codigo_convidado: uploadData.codigo_convidado,
          nome_convidado: uploadData.nome_convidado,
          storage_path: storagePath,
          original_filename: uploadData.file.name,
          file_size: uploadData.file.size,
          mime_type: uploadData.file.type,
          caption: uploadData.caption || null,
          aprovado: shouldAutoApprove,

          media_type: 'video',
          duration: uploadData.duration || null,
          poster_path: posterPath,
        })
        .select()
        .single();

      if (error) {
        if (storagePath) await storageService.deletePhoto(storagePath);
        if (posterPath) await storageService.deletePhoto(posterPath);
        throw new Error(error.message);
      }

      const photo = this.mapPhotoWithUrl(data);

      return {
        success: true,
        message: shouldAutoApprove
          ? 'Vídeo enviado com sucesso!'
          : 'Vídeo enviado! Aguardando aprovação.',
        photo,
      };
    } catch (err) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao fazer upload de vídeo:',
        err
      );
      if (storagePath) {
        try {
          await storageService.deletePhoto(storagePath);
        } catch {
          /* ignore */
        }
      }
      if (posterPath) {
        try {
          await storageService.deletePhoto(posterPath);
        } catch {
          /* ignore */
        }
      }
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao enviar vídeo',
      };
    }
  }

  async getGuestMediaCount(codigo: string): Promise<GuestMediaCount> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('media_type')

      .ilike('codigo_convidado', codigo);

    if (error) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao contar mídia do convidado:',
        error
      );
      return { photos: 0, videos: 0 };
    }

    const photos = (data || []).filter(
      item => item.media_type === 'photo' || !item.media_type
    ).length;
    const videos = (data || []).filter(
      item => item.media_type === 'video'
    ).length;

    return { photos, videos };
  }

  async deletePhoto(id: number): Promise<void> {
    const photo = await this.getPhotoById(id);
    if (!photo) {
      throw new Error('Foto não encontrada');
    }

    await storageService.deletePhoto(photo.storage_path);

    if (photo.poster_path) {
      try {
        await storageService.deletePhoto(photo.poster_path);
      } catch {
        /* ignore */
      }
    }

    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
    if (error) {
      console.error('[PhotoRepositorySupabase] Erro ao deletar foto:', error);
      throw new Error(error.message);
    }
  }

  async approvePhoto(id: number): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE)
      .update({ aprovado: true, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('[PhotoRepositorySupabase] Erro ao aprovar foto:', error);
      throw new Error(error.message);
    }
  }

  async rejectPhoto(id: number): Promise<void> {
    await this.deletePhoto(id);
  }

  async bulkApprove(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    const { error } = await supabase
      .from(this.TABLE)
      .update({ aprovado: true, updated_at: new Date().toISOString() })

      .in('id', ids);

    if (error) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao aprovar fotos em lote:',
        error
      );
      throw new Error(error.message);
    }
  }

  async bulkReject(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.deletePhoto(id);
    }
  }

  async likePhoto(fotoId: number, codigoConvidado: string): Promise<void> {
    const { error } = await supabase.from(this.LIKES_TABLE).insert({
      foto_id: fotoId,
      codigo_convidado: codigoConvidado,
    });

    if (error && error.code !== '23505') {
      console.error('[PhotoRepositorySupabase] Erro ao curtir foto:', error);
      throw new Error(error.message);
    }
  }

  async unlikePhoto(fotoId: number, codigoConvidado: string): Promise<void> {
    const { error } = await supabase
      .from(this.LIKES_TABLE)
      .delete()
      .eq('foto_id', fotoId)
      .eq('codigo_convidado', codigoConvidado);
    if (error) {
      console.error('[PhotoRepositorySupabase] Erro ao descurtir foto:', error);
      throw new Error(error.message);
    }
  }

  async getPhotoLikes(fotoId: number): Promise<number> {
    const { count, error } = await supabase
      .from(this.LIKES_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('foto_id', fotoId);
    if (error) {
      console.error('[PhotoRepositorySupabase] Erro ao buscar likes:', error);
      return 0;
    }

    return count || 0;
  }

  async hasUserLiked(
    fotoId: number,
    codigoConvidado: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.LIKES_TABLE)
      .select('id')
      .eq('foto_id', fotoId)
      .eq('codigo_convidado', codigoConvidado)

      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[PhotoRepositorySupabase] Erro ao verificar like:', error);
    }

    return !!data;
  }

  async getPhotoComments(fotoId: number): Promise<PhotoComment[]> {
    const { data, error } = await supabase
      .from(this.COMMENTS_TABLE)
      .select('*')
      .eq('foto_id', fotoId)

      .order('created_at', { ascending: true });

    if (error) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao buscar comentários:',
        error
      );
      throw new Error(error.message);
    }

    return data || [];
  }

  async addComment(commentData: PhotoCommentForm): Promise<PhotoComment> {
    const { data, error } = await supabase
      .from(this.COMMENTS_TABLE)
      .insert({
        foto_id: commentData.foto_id,
        codigo_convidado: commentData.codigo_convidado,
        nome_convidado: commentData.nome_convidado,
        texto: commentData.texto,
      })
      .select()
      .single();

    if (error) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao adicionar comentário:',
        error
      );
      throw new Error(error.message);
    }

    return data;
  }

  async deleteComment(id: number): Promise<void> {
    const { error } = await supabase
      .from(this.COMMENTS_TABLE)
      .delete()
      .eq('id', id);
    if (error) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao deletar comentário:',
        error
      );
      throw new Error(error.message);
    }
  }

  async getStats(): Promise<PhotoStats> {
    const [
      totalResult,
      approvedResult,
      likesResult,
      commentsResult,
      photosResult,
      videosResult,
    ] = await Promise.all([
      supabase.from(this.TABLE).select('*', { count: 'exact', head: true }),
      supabase
        .from(this.TABLE)
        .select('*', { count: 'exact', head: true })

        .eq('aprovado', true),
      supabase
        .from(this.LIKES_TABLE)
        .select('*', { count: 'exact', head: true }),
      supabase
        .from(this.COMMENTS_TABLE)
        .select('*', { count: 'exact', head: true }),
      supabase
        .from(this.TABLE)
        .select('*', { count: 'exact', head: true })

        .eq('media_type', 'photo'),
      supabase
        .from(this.TABLE)
        .select('*', { count: 'exact', head: true })

        .eq('media_type', 'video'),
    ]);

    const total = totalResult.count || 0;
    const approved = approvedResult.count || 0;

    return {
      total,
      approved,
      pending: total - approved,
      totalLikes: likesResult.count || 0,
      totalComments: commentsResult.count || 0,
      totalPhotos: photosResult.count || 0,
      totalVideos: videosResult.count || 0,
    };
  }

  async getGuestPhotoCount(codigo: string): Promise<number> {
    const { count, error } = await supabase
      .from(this.TABLE)
      .select('*', { count: 'exact', head: true })

      .ilike('codigo_convidado', codigo)
      .eq('media_type', 'photo');

    if (error) {
      console.error(
        '[PhotoRepositorySupabase] Erro ao contar fotos do convidado:',
        error
      );
      return 0;
    }

    return count || 0;
  }

  async getPhotoDownloadUrls(): Promise<string[]> {
    const photos = await this.getApprovedPhotos(1000);
    return photos.map(photo => photo.public_url || '').filter(Boolean);
  }

  private shouldAutoApprove(): boolean {
    const weddingDateStr = import.meta.env.VITE_WEDDING_DATE;
    if (!weddingDateStr) {
      console.warn(
        '[PhotoRepositorySupabase] VITE_WEDDING_DATE não definido, usando moderação'
      );
      return false;
    }

    const weddingDate = new Date(`${weddingDateStr}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return today >= weddingDate;
  }

  private mapPhotoWithUrl(data: Record<string, unknown>): Photo {
    const storagePath = data.storage_path as string;
    const posterPath = data.poster_path as string | undefined;
    return {
      id: data.id as number,
      codigo_convidado: data.codigo_convidado as string,
      nome_convidado: data.nome_convidado as string,
      storage_path: storagePath,
      thumbnail_path: data.thumbnail_path as string | undefined,
      original_filename: data.original_filename as string | undefined,
      file_size: data.file_size as number | undefined,
      mime_type: data.mime_type as string | undefined,
      caption: data.caption as string | undefined,
      aprovado: data.aprovado as boolean,
      created_at: data.created_at as string | undefined,
      updated_at: data.updated_at as string | undefined,
      media_type: (data.media_type as 'photo' | 'video') || 'photo',
      duration: data.duration as number | undefined,
      poster_path: posterPath,
      public_url: storageService.getPublicUrl(storagePath),
      poster_url: posterPath
        ? storageService.getPublicUrl(posterPath)
        : undefined,
      likes_count: 0,
      comments_count: 0,
      user_liked: false,
    };
  }

  private mapPhotosWithUrls(data: Record<string, unknown>[]): Photo[] {
    return data.map(item => this.mapPhotoWithUrl(item));
  }
}
