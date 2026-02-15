import { supabase } from '@shared/lib/supabase';
import type { IPhotoRepository } from '../../domain/interfaces';
import type {
  Photo,
  PhotoUploadData,
  PhotoUploadResponse,
  PhotoStats,
  MediaUploadData,
  GuestMediaCount,
} from '@/entities/photo';
import type { PhotoComment, PhotoCommentForm } from '@/entities/comment';
import { storageService, compressImage } from '../services';

/**
 * Repository: PhotoRepository
 * Implementação concreta do repositório de fotos
 * Princípio: Single Responsibility (SOLID)
 */
export class PhotoRepository implements IPhotoRepository {
  private readonly TABLE = 'fotos';
  private readonly LIKES_TABLE = 'foto_likes';
  private readonly COMMENTS_TABLE = 'foto_comentarios';
  private readonly MAX_PHOTOS_PER_GUEST = 20;
  private readonly MAX_VIDEOS_PER_GUEST = 5;

  // ========== CRUD DE FOTOS ==========

  async getApprovedPhotos(limit = 50, offset = 0): Promise<Photo[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('aprovado', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[PhotoRepository] Erro ao buscar fotos aprovadas:', error);
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
      console.error('[PhotoRepository] Erro ao buscar todas as fotos:', error);
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
      console.error('[PhotoRepository] Erro ao buscar fotos pendentes:', error);
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
      console.error('[PhotoRepository] Erro ao buscar fotos do convidado:', error);
      throw new Error(error.message);
    }

    return this.mapPhotosWithUrls(data || []);
  }

  async getPhotoById(id: number): Promise<Photo | null> {
    const { data, error } = await supabase.from(this.TABLE).select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[PhotoRepository] Erro ao buscar foto:', error);
      throw new Error(error.message);
    }

    return this.mapPhotoWithUrl(data);
  }

  async uploadPhoto(uploadData: PhotoUploadData): Promise<PhotoUploadResponse> {
    console.log('repository upload.');

    const currentCount = await this.getGuestPhotoCount(uploadData.codigo_convidado);
    if (currentCount >= this.MAX_PHOTOS_PER_GUEST) {
      return {
        success: false,
        message: `Limite de ${this.MAX_PHOTOS_PER_GUEST} fotos atingido`,
      };
    }

    try {
      // 1. Comprime a imagem
      const { file: compressedFile } = await compressImage(uploadData.file);

      // 2. Faz upload para o Storage
      const storagePath = await storageService.uploadPhoto(
        compressedFile,
        uploadData.codigo_convidado
      );

      // 3. Verifica se deve auto-aprovar
      const shouldAutoApprove = this.shouldAutoApprove();

      // 4. Insere no banco
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
        })
        .select()
        .single();

      if (error) {
        // Rollback: deleta arquivo do storage
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
      console.error('[PhotoRepository] Erro ao fazer upload:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao enviar foto',
      };
    }
  }

  async deletePhoto(id: number): Promise<void> {
    // Busca a foto para obter o storage_path
    const photo = await this.getPhotoById(id);
    if (!photo) {
      throw new Error('Foto não encontrada');
    }

    // Deleta do Storage
    await storageService.deletePhoto(photo.storage_path);

    // Deleta do banco (cascata deleta likes e comentários)
    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);

    if (error) {
      console.error('[PhotoRepository] Erro ao deletar foto:', error);
      throw new Error(error.message);
    }
  }

  // ========== MODERAÇÃO ==========

  async approvePhoto(id: number): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE)
      .update({ aprovado: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[PhotoRepository] Erro ao aprovar foto:', error);
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
      console.error('[PhotoRepository] Erro ao aprovar fotos em lote:', error);
      throw new Error(error.message);
    }
  }

  async bulkReject(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.deletePhoto(id);
    }
  }

  // ========== LIKES ==========

  async likePhoto(fotoId: number, codigoConvidado: string): Promise<void> {
    const { error } = await supabase
      .from(this.LIKES_TABLE)
      .insert({ foto_id: fotoId, codigo_convidado: codigoConvidado });

    // Ignora erro de constraint única (já curtiu)
    if (error && error.code !== '23505') {
      console.error('[PhotoRepository] Erro ao curtir foto:', error);
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
      console.error('[PhotoRepository] Erro ao descurtir foto:', error);
      throw new Error(error.message);
    }
  }

  async getPhotoLikes(fotoId: number): Promise<number> {
    const { count, error } = await supabase
      .from(this.LIKES_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('foto_id', fotoId);

    if (error) {
      console.error('[PhotoRepository] Erro ao buscar likes:', error);
      return 0;
    }

    return count || 0;
  }

  async hasUserLiked(fotoId: number, codigoConvidado: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.LIKES_TABLE)
      .select('id')
      .eq('foto_id', fotoId)
      .eq('codigo_convidado', codigoConvidado)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[PhotoRepository] Erro ao verificar like:', error);
    }

    return !!data;
  }

  // ========== COMENTÁRIOS ==========

  async getPhotoComments(fotoId: number): Promise<PhotoComment[]> {
    const { data, error } = await supabase
      .from(this.COMMENTS_TABLE)
      .select('*')
      .eq('foto_id', fotoId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[PhotoRepository] Erro ao buscar comentários:', error);
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
      console.error('[PhotoRepository] Erro ao adicionar comentário:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async deleteComment(id: number): Promise<void> {
    const { error } = await supabase.from(this.COMMENTS_TABLE).delete().eq('id', id);

    if (error) {
      console.error('[PhotoRepository] Erro ao deletar comentário:', error);
      throw new Error(error.message);
    }
  }

  // ========== ESTATÍSTICAS ==========

  async getStats(): Promise<PhotoStats> {
    const [totalResult, approvedResult, likesResult, commentsResult, photosResult, videosResult] =
      await Promise.all([
        supabase.from(this.TABLE).select('*', { count: 'exact', head: true }),
        supabase.from(this.TABLE).select('*', { count: 'exact', head: true }).eq('aprovado', true),
        supabase.from(this.LIKES_TABLE).select('*', { count: 'exact', head: true }),
        supabase.from(this.COMMENTS_TABLE).select('*', { count: 'exact', head: true }),
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
      console.error('[PhotoRepository] Erro ao contar fotos do convidado:', error);
      return 0;
    }

    return count || 0;
  }

  async getGuestMediaCount(codigo: string): Promise<GuestMediaCount> {
    const [photosResult, videosResult] = await Promise.all([
      supabase
        .from(this.TABLE)
        .select('*', { count: 'exact', head: true })
        .ilike('codigo_convidado', codigo)
        .eq('media_type', 'photo'),
      supabase
        .from(this.TABLE)
        .select('*', { count: 'exact', head: true })
        .ilike('codigo_convidado', codigo)
        .eq('media_type', 'video'),
    ]);

    return {
      photos: photosResult.count || 0,
      videos: videosResult.count || 0,
    };
  }

  async uploadVideo(data: MediaUploadData): Promise<PhotoUploadResponse> {
    // Verifica limite de vídeos
    const { videos } = await this.getGuestMediaCount(data.codigo_convidado);
    if (videos >= this.MAX_VIDEOS_PER_GUEST) {
      return {
        success: false,
        message: `Limite de ${this.MAX_VIDEOS_PER_GUEST} vídeos por convidado atingido`,
      };
    }

    try {
      // Faz upload do vídeo
      const videoPath = await storageService.uploadVideo(
        data.file,
        data.codigo_convidado,
        data.file.name
      );

      // Faz upload do poster se fornecido
      let posterPath: string | undefined;
      if (data.posterBlob) {
        try {
          posterPath = await storageService.uploadPoster(
            data.posterBlob,
            data.codigo_convidado,
            data.file.name
          );
        } catch (posterError) {
          console.warn('[PhotoRepository] Erro ao fazer upload do poster:', posterError);
        }
      }

      // Salva registro no banco
      const { data: foto, error } = await supabase
        .from(this.TABLE)
        .insert({
          codigo_convidado: data.codigo_convidado,
          nome_convidado: data.nome_convidado,
          storage_path: videoPath,
          poster_path: posterPath,
          original_filename: data.file.name,
          file_size: data.file.size,
          mime_type: data.file.type,
          caption: data.caption,
          media_type: 'video',
          duration: data.duration,
          aprovado: this.shouldAutoApprove(),
        })
        .select()
        .single();

      if (error) {
        console.error('[PhotoRepository] Erro ao salvar vídeo:', error);
        return {
          success: false,
          message: 'Erro ao salvar vídeo',
        };
      }

      return {
        success: true,
        message: foto.aprovado
          ? 'Vídeo enviado e publicado!'
          : 'Vídeo enviado! Aguardando aprovação.',
        photo: this.mapPhotoWithUrl(foto),
      };
    } catch (err) {
      console.error('[PhotoRepository] Erro no upload de vídeo:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao fazer upload do vídeo',
      };
    }
  }

  // ========== DOWNLOAD ==========

  async getPhotoDownloadUrls(): Promise<string[]> {
    const photos = await this.getApprovedPhotos(1000);
    return photos.map(photo => photo.public_url || '').filter(Boolean);
  }

  // ========== MÉTODOS PRIVADOS ==========

  /**
   * Verifica se deve auto-aprovar baseado na data do casamento
   */
  private shouldAutoApprove(): boolean {
    const weddingDateStr = import.meta.env.VITE_WEDDING_DATE;
    if (!weddingDateStr) {
      console.warn('[PhotoRepository] VITE_WEDDING_DATE não definido, usando moderação');
      return false;
    }

    const weddingDate = new Date(weddingDateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return today >= weddingDate;
  }

  /**
   * Mapeia dados do banco para entidade Photo com URL pública
   */
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
      poster_url: posterPath ? storageService.getPublicUrl(posterPath) : undefined,
      likes_count: 0,
      comments_count: 0,
      user_liked: false,
    };
  }

  /**
   * Mapeia array de dados para array de Photos
   */
  private mapPhotosWithUrls(data: Record<string, unknown>[]): Photo[] {
    return data.map(item => this.mapPhotoWithUrl(item));
  }
}

// Instância singleton
export const photoRepository = new PhotoRepository();
