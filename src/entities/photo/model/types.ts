/**
 * Tipo de midia suportado
 */
export type MediaType = 'photo' | 'video';

/**
 * Entity: Photo (Media)
 * Representa uma foto ou video enviado por um convidado
 */
export interface Photo {
  id?: number;
  codigo_convidado: string;
  nome_convidado: string;
  storage_path: string;
  thumbnail_path?: string;
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  caption?: string;
  aprovado: boolean;
  created_at?: string;
  updated_at?: string;
  // Campos de video
  media_type: MediaType;
  duration?: number; // segundos, max 60
  poster_path?: string; // thumbnail do video
  // Campos computados/juncoes
  public_url?: string;
  thumbnail_url?: string;
  poster_url?: string; // URL computada do poster
  likes_count?: number;
  comments_count?: number;
  user_liked?: boolean;
}

export interface PhotoUploadData {
  codigo_convidado: string;
  nome_convidado: string;
  file: File;
  caption?: string;
}

/**
 * Dados para upload de midia (foto ou video)
 */
export interface MediaUploadData extends PhotoUploadData {
  media_type: MediaType;
  duration?: number;
  posterBlob?: Blob;
}

/**
 * Resposta de upload de foto
 */
export interface PhotoUploadResponse {
  success: boolean;
  message: string;
  photo?: Photo;
}

/**
 * Estatisticas de fotos
 */
export interface PhotoStats {
  total: number;
  approved: number;
  pending: number;
  totalLikes: number;
  totalComments: number;
  totalPhotos: number;
  totalVideos: number;
}

/**
 * Factory para criar estatisticas vazias
 */
export const createEmptyPhotoStats = (): PhotoStats => ({
  total: 0,
  approved: 0,
  pending: 0,
  totalLikes: 0,
  totalComments: 0,
  totalPhotos: 0,
  totalVideos: 0,
});

/**
 * Contagem de midia por convidado
 */
export interface GuestMediaCount {
  photos: number;
  videos: number;
}

/**
 * Entity: PhotoLike
 * Representa uma curtida em uma foto
 */
export interface PhotoLike {
  id?: number;
  foto_id: number;
  codigo_convidado: string;
  created_at?: string;
}
