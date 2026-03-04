import type {
  Photo,
  PhotoUploadData,
  PhotoUploadResponse,
  PhotoStats,
  MediaUploadData,
  GuestMediaCount,
} from './types';
import type { PhotoComment, PhotoCommentForm } from '@/entities/comment';

/**
 * Interface: IPhotoRepository
 * Define o contrato para operações de fotos
 * Princípio: Dependency Inversion (SOLID)
 */
export interface IPhotoRepository {
  // CRUD de Fotos
  getApprovedPhotos(limit?: number, offset?: number): Promise<Photo[]>;
  getAllPhotos(): Promise<Photo[]>;
  getPendingPhotos(): Promise<Photo[]>;
  getPhotosByGuest(codigo: string): Promise<Photo[]>;
  getPhotoById(id: number): Promise<Photo | null>;
  uploadPhoto(data: PhotoUploadData): Promise<PhotoUploadResponse>;
  uploadVideo(data: MediaUploadData): Promise<PhotoUploadResponse>;
  deletePhoto(id: number): Promise<void>;

  // Moderação
  approvePhoto(id: number): Promise<void>;
  rejectPhoto(id: number): Promise<void>;
  bulkApprove(ids: number[]): Promise<void>;
  bulkReject(ids: number[]): Promise<void>;

  // Likes
  likePhoto(fotoId: number, codigoConvidado: string): Promise<void>;
  unlikePhoto(fotoId: number, codigoConvidado: string): Promise<void>;
  getPhotoLikes(fotoId: number): Promise<number>;
  hasUserLiked(fotoId: number, codigoConvidado: string): Promise<boolean>;

  // Comentários
  getPhotoComments(fotoId: number): Promise<PhotoComment[]>;
  addComment(data: PhotoCommentForm): Promise<PhotoComment>;
  deleteComment(id: number): Promise<void>;

  // Estatísticas
  getStats(): Promise<PhotoStats>;
  getGuestPhotoCount(codigo: string): Promise<number>;
  getGuestMediaCount(codigo: string): Promise<GuestMediaCount>;

  // Download
  getPhotoDownloadUrls(): Promise<string[]>;
}
