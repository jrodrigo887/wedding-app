import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Photo } from '@/entities/photo';
import type { PhotoComment } from '@/entities/comment';
import { createPhotoRepository } from '@/app/providers';
import { usePhotosStore } from '@/features/photo-state';

/**
 * Store: usePhotoInteractionsStore
 * Gerencia interações com fotos: likes, comentários e modal de visualização
 */
export const usePhotoInteractionsStore = defineStore('photo-interactions', () => {
  const selectedPhoto = ref<Photo | null>(null);
  const selectedPhotoComments = ref<PhotoComment[]>([]);

  // ========== LIKES ==========

  const toggleLike = async (photoId: number): Promise<void> => {
    const photosStore = usePhotosStore();
    const guestCode = photosStore.currentGuestCode;
    if (!guestCode) return;

    const photo = photosStore.photos.find(p => p.id === photoId);
    if (!photo) return;

    try {
      if (photo.user_liked) {
        await createPhotoRepository().unlikePhoto(photoId, guestCode);
        photo.user_liked = false;
        photo.likes_count = Math.max(0, (photo.likes_count || 1) - 1);
      } else {
        await createPhotoRepository().likePhoto(photoId, guestCode);
        photo.user_liked = true;
        photo.likes_count = (photo.likes_count || 0) + 1;
      }
    } catch (err) {
      console.error('[PhotoInteractionsStore] Erro ao curtir:', err);
    }
  };

  // ========== COMENTÁRIOS ==========

  const fetchPhotoComments = async (photoId: number): Promise<void> => {
    try {
      selectedPhotoComments.value = await createPhotoRepository().getPhotoComments(photoId);
    } catch (err) {
      console.error('[PhotoInteractionsStore] Erro ao buscar comentários:', err);
    }
  };

  const addComment = async (photoId: number, texto: string): Promise<PhotoComment | null> => {
    const photosStore = usePhotosStore();
    const guestCode = photosStore.currentGuestCode;
    const guestName = photosStore.currentGuestName;
    if (!guestCode || !guestName) return null;

    try {
      const comment = await createPhotoRepository().addComment({
        foto_id: photoId,
        codigo_convidado: guestCode,
        nome_convidado: guestName,
        texto,
      });

      // Atualiza contador na lista de fotos
      const photo = photosStore.photos.find(p => p.id === photoId);
      if (photo) {
        photo.comments_count = (photo.comments_count || 0) + 1;
      }

      // Adiciona à lista se for a foto selecionada
      if (selectedPhoto.value?.id === photoId) {
        selectedPhotoComments.value.push(comment);
      }

      return comment;
    } catch (err) {
      console.error('[PhotoInteractionsStore] Erro ao comentar:', err);
      return null;
    }
  };

  // ========== MODAL ==========

  const selectPhoto = async (photo: Photo): Promise<void> => {
    selectedPhoto.value = photo;
    await fetchPhotoComments(photo.id!);
  };

  const closePhotoModal = (): void => {
    selectedPhoto.value = null;
    selectedPhotoComments.value = [];
  };

  // ========== REALTIME HANDLERS ==========

  const handleNewLike = (fotoId: number): void => {
    const photosStore = usePhotosStore();
    const photo = photosStore.photos.find(p => p.id === fotoId);
    if (photo) {
      photo.likes_count = (photo.likes_count || 0) + 1;
    }
  };

  const handleNewComment = (fotoId: number, comment: PhotoComment): void => {
    const photosStore = usePhotosStore();
    const photo = photosStore.photos.find(p => p.id === fotoId);
    if (photo) {
      photo.comments_count = (photo.comments_count || 0) + 1;
    }

    if (selectedPhoto.value?.id === fotoId) {
      if (!selectedPhotoComments.value.find(c => c.id === comment.id)) {
        selectedPhotoComments.value.push(comment);
      }
    }
  };

  return {
    // State
    selectedPhoto,
    selectedPhotoComments,
    // Actions
    toggleLike,
    fetchPhotoComments,
    addComment,
    selectPhoto,
    closePhotoModal,
    // Realtime handlers
    handleNewLike,
    handleNewComment,
  };
});
