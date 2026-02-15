import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Photo, PhotoStats, MediaType } from '@/entities/photo';
import type { PhotoComment } from '@/entities/comment';
import { createEmptyPhotoStats } from '@/entities/photo';
import { photoRepository } from '../repositories';

/**
 * Store: usePhotosStore
 * Gerencia o estado das fotos com cache
 * Princípio: Single Source of Truth
 */
export const usePhotosStore = defineStore('photos', () => {
  // ========== STATE ==========
  const photos = ref<Photo[]>([]);
  const pendingPhotos = ref<Photo[]>([]);
  const stats = ref<PhotoStats>(createEmptyPhotoStats());
  const loading = ref(false);
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const error = ref<string | null>(null);

  // Contexto do convidado
  const currentGuestCode = ref<string | null>(null);
  const currentGuestName = ref<string | null>(null);
  const currentGuestPhotoCount = ref(0);
  const currentGuestVideoCount = ref(0);

  // Filtro de mídia
  const mediaFilter = ref<'all' | 'photo' | 'video'>('all');

  // Paginação
  const PAGE_SIZE = 20;
  const hasMore = ref(true);
  const loadingMore = ref(false);

  // Cache
  const lastFetch = ref<number | null>(null);
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

  // Foto selecionada (modal)
  const selectedPhoto = ref<Photo | null>(null);
  const selectedPhotoComments = ref<PhotoComment[]>([]);

  // ========== COMPUTED ==========
  const hasPhotos = computed(() => photos.value.length > 0);
  const hasPendingPhotos = computed(() => pendingPhotos.value.length > 0);
  const canUploadMore = computed(() => currentGuestPhotoCount.value < 20);
  const remainingUploads = computed(() => 20 - currentGuestPhotoCount.value);
  const canUploadMoreVideos = computed(() => currentGuestVideoCount.value < 5);
  const remainingVideoUploads = computed(() => 5 - currentGuestVideoCount.value);

  // Mídia filtrada
  const filteredMedia = computed(() => {
    if (mediaFilter.value === 'all') return photos.value;
    return photos.value.filter(p => p.media_type === mediaFilter.value);
  });

  const isAutoApproveEnabled = computed(() => {
    const weddingDateStr = import.meta.env.VITE_WEDDING_DATE;
    if (!weddingDateStr) return false;

    const weddingDate = new Date(weddingDateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= weddingDate;
  });

  const moderationStatus = computed(() => {
    if (isAutoApproveEnabled.value) {
      return 'Fotos e vídeos aparecem automaticamente no feed';
    }
    return 'Fotos e vídeos precisam de aprovação antes de aparecer';
  });

  // ========== ACTIONS ==========

  const shouldRefetch = (): boolean => {
    if (!lastFetch.value) return true;
    return Date.now() - lastFetch.value > CACHE_DURATION;
  };

  /**
   * Define o contexto do convidado atual
   */
  const setGuestContext = (code: string, name: string) => {
    currentGuestCode.value = code;
    currentGuestName.value = name;
  };

  /**
   * Limpa o contexto do convidado
   */
  const clearGuestContext = () => {
    currentGuestCode.value = null;
    currentGuestName.value = null;
    currentGuestPhotoCount.value = 0;
    currentGuestVideoCount.value = 0;
  };

  /**
   * Define o filtro de mídia
   */
  const setMediaFilter = (filter: 'all' | 'photo' | 'video') => {
    mediaFilter.value = filter;
  };

  /**
   * Busca fotos aprovadas para o feed (primeira página)
   */
  const fetchApprovedPhotos = async (force = false): Promise<void> => {
    if (!force && !shouldRefetch() && photos.value.length > 0) return;

    loading.value = true;
    error.value = null;

    try {
      const fetchedPhotos = await photoRepository.getApprovedPhotos(PAGE_SIZE, 0);

      // Busca likes e comentários para cada foto
      if (currentGuestCode.value) {
        for (const photo of fetchedPhotos) {
          photo.user_liked = await photoRepository.hasUserLiked(photo.id!, currentGuestCode.value);
          photo.likes_count = await photoRepository.getPhotoLikes(photo.id!);
        }
      }

      photos.value = fetchedPhotos;
      hasMore.value = fetchedPhotos.length >= PAGE_SIZE;
      lastFetch.value = Date.now();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar fotos';
      console.error('[PhotosStore] Erro ao carregar fotos:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Carrega mais fotos (próxima página)
   */
  const fetchMorePhotos = async (): Promise<void> => {
    if (loadingMore.value || !hasMore.value) return;

    loadingMore.value = true;

    try {
      const offset = photos.value.length;
      const fetchedPhotos = await photoRepository.getApprovedPhotos(PAGE_SIZE, offset);

      if (currentGuestCode.value) {
        for (const photo of fetchedPhotos) {
          photo.user_liked = await photoRepository.hasUserLiked(photo.id!, currentGuestCode.value);
          photo.likes_count = await photoRepository.getPhotoLikes(photo.id!);
        }
      }

      photos.value.push(...fetchedPhotos);
      hasMore.value = fetchedPhotos.length >= PAGE_SIZE;
    } catch (err) {
      console.error('[PhotosStore] Erro ao carregar mais fotos:', err);
    } finally {
      loadingMore.value = false;
    }
  };

  /**
   * Busca contagem de fotos e vídeos do convidado atual
   */
  const fetchGuestPhotoCount = async (): Promise<void> => {
    if (!currentGuestCode.value) return;

    try {
      const mediaCount = await photoRepository.getGuestMediaCount(currentGuestCode.value);
      currentGuestPhotoCount.value = mediaCount.photos;
      currentGuestVideoCount.value = mediaCount.videos;
    } catch (err) {
      console.error('[PhotosStore] Erro ao buscar contagem:', err);
    }
  };

  /**
   * Faz upload de uma foto
   */
  const uploadPhoto = async (file: File, caption?: string): Promise<boolean> => {
    if (!currentGuestCode.value || !currentGuestName.value) {
      error.value = 'Identifique-se antes de enviar fotos';
      return false;
    }

    if (!canUploadMore.value) {
      error.value = 'Limite de 20 fotos atingido';
      return false;
    }

    uploading.value = true;
    uploadProgress.value = 0;
    error.value = null;

    try {
      const result = await photoRepository.uploadPhoto({
        codigo_convidado: currentGuestCode.value,
        nome_convidado: currentGuestName.value,
        file,
        caption,
      });

      if (!result.success) {
        error.value = result.message;
        return false;
      }

      // Atualiza contagem
      currentGuestPhotoCount.value++;
      uploadProgress.value = 100;

      // Se auto-aprovado, adiciona ao feed
      if (result.photo?.aprovado) {
        photos.value.unshift(result.photo);
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao enviar foto';
      return false;
    } finally {
      uploading.value = false;
    }
  };

  /**
   * Faz upload de mídia (foto ou vídeo) - unificado
   */
  const uploadMedia = async (
    file: File,
    caption?: string,
    options?: {
      media_type: MediaType;
      duration?: number;
      posterBlob?: Blob;
    }
  ): Promise<boolean> => {
    if (!currentGuestCode.value || !currentGuestName.value) {
      error.value = 'Identifique-se antes de enviar';
      return false;
    }

    const mediaType = options?.media_type || 'photo';

    // Verifica limites
    if (mediaType === 'photo' && !canUploadMore.value) {
      error.value = 'Limite de 20 fotos atingido';
      return false;
    }

    if (mediaType === 'video' && !canUploadMoreVideos.value) {
      error.value = 'Limite de 5 vídeos atingido';
      return false;
    }

    uploading.value = true;
    uploadProgress.value = 0;
    error.value = null;

    try {
      let result;

      if (mediaType === 'video') {
        result = await photoRepository.uploadVideo({
          codigo_convidado: currentGuestCode.value,
          nome_convidado: currentGuestName.value,
          file,
          caption,
          media_type: 'video',
          duration: options?.duration,
          posterBlob: options?.posterBlob,
        });

        if (result.success) {
          currentGuestVideoCount.value++;
        }
      } else {
        result = await photoRepository.uploadPhoto({
          codigo_convidado: currentGuestCode.value,
          nome_convidado: currentGuestName.value,
          file,
          caption,
        });

        if (result.success) {
          currentGuestPhotoCount.value++;
        }
      }

      if (!result.success) {
        error.value = result.message;
        return false;
      }

      uploadProgress.value = 100;

      // Se auto-aprovado, adiciona ao feed
      if (result.photo?.aprovado) {
        photos.value.unshift(result.photo);
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao enviar mídia';
      return false;
    } finally {
      uploading.value = false;
    }
  };

  /**
   * Toggle like em uma foto
   */
  const toggleLike = async (photoId: number): Promise<void> => {
    if (!currentGuestCode.value) return;

    const photo = photos.value.find(p => p.id === photoId);
    if (!photo) return;

    try {
      if (photo.user_liked) {
        await photoRepository.unlikePhoto(photoId, currentGuestCode.value);
        photo.user_liked = false;
        photo.likes_count = Math.max(0, (photo.likes_count || 1) - 1);
      } else {
        await photoRepository.likePhoto(photoId, currentGuestCode.value);
        photo.user_liked = true;
        photo.likes_count = (photo.likes_count || 0) + 1;
      }
    } catch (err) {
      console.error('[PhotosStore] Erro ao curtir:', err);
    }
  };

  /**
   * Adiciona comentário em uma foto
   */
  const addComment = async (photoId: number, texto: string): Promise<PhotoComment | null> => {
    if (!currentGuestCode.value || !currentGuestName.value) return null;

    try {
      const comment = await photoRepository.addComment({
        foto_id: photoId,
        codigo_convidado: currentGuestCode.value,
        nome_convidado: currentGuestName.value,
        texto,
      });

      // Atualiza contador
      const photo = photos.value.find(p => p.id === photoId);
      if (photo) {
        photo.comments_count = (photo.comments_count || 0) + 1;
      }

      // Se é a foto selecionada, adiciona aos comentários
      if (selectedPhoto.value?.id === photoId) {
        selectedPhotoComments.value.push(comment);
      }

      return comment;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao comentar';
      return null;
    }
  };

  /**
   * Busca comentários de uma foto
   */
  const fetchPhotoComments = async (photoId: number): Promise<void> => {
    try {
      selectedPhotoComments.value = await photoRepository.getPhotoComments(photoId);
    } catch (err) {
      console.error('[PhotosStore] Erro ao buscar comentários:', err);
    }
  };

  /**
   * Seleciona uma foto para visualização
   */
  const selectPhoto = async (photo: Photo): Promise<void> => {
    selectedPhoto.value = photo;
    await fetchPhotoComments(photo.id!);
  };

  /**
   * Fecha modal da foto
   */
  const closePhotoModal = (): void => {
    selectedPhoto.value = null;
    selectedPhotoComments.value = [];
  };

  // ========== ADMIN ACTIONS ==========

  /**
   * Busca fotos pendentes de aprovação
   */
  const fetchPendingPhotos = async (): Promise<void> => {
    loading.value = true;
    try {
      pendingPhotos.value = await photoRepository.getPendingPhotos();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar fotos pendentes';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Aprova uma foto
   */
  const approvePhoto = async (id: number): Promise<void> => {
    try {
      await photoRepository.approvePhoto(id);

      const photo = pendingPhotos.value.find(p => p.id === id);
      if (photo) {
        photo.aprovado = true;
        photos.value.unshift(photo);
        pendingPhotos.value = pendingPhotos.value.filter(p => p.id !== id);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao aprovar foto';
    }
  };

  /**
   * Rejeita/deleta uma foto
   */
  const rejectPhoto = async (id: number): Promise<void> => {
    try {
      await photoRepository.rejectPhoto(id);
      pendingPhotos.value = pendingPhotos.value.filter(p => p.id !== id);
      photos.value = photos.value.filter(p => p.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao rejeitar foto';
    }
  };

  /**
   * Aprova múltiplas fotos
   */
  const bulkApprove = async (ids: number[]): Promise<void> => {
    try {
      await photoRepository.bulkApprove(ids);

      const approvedPhotos = pendingPhotos.value.filter(p => ids.includes(p.id!));
      approvedPhotos.forEach(p => {
        p.aprovado = true;
        photos.value.unshift(p);
      });

      pendingPhotos.value = pendingPhotos.value.filter(p => !ids.includes(p.id!));
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao aprovar fotos';
    }
  };

  /**
   * Busca estatísticas
   */
  const fetchStats = async (): Promise<void> => {
    try {
      stats.value = await photoRepository.getStats();
    } catch (err) {
      console.error('[PhotosStore] Erro ao buscar estatísticas:', err);
    }
  };

  // ========== REALTIME HANDLERS ==========

  const handleNewPhoto = (photo: Photo): void => {
    if (photo.aprovado) {
      // Evita duplicatas
      if (!photos.value.find(p => p.id === photo.id)) {
        photos.value.unshift(photo);
      }
    } else {
      if (!pendingPhotos.value.find(p => p.id === photo.id)) {
        pendingPhotos.value.unshift(photo);
      }
    }
  };

  const handlePhotoUpdate = (updatedPhoto: Photo): void => {
    // Atualiza no feed
    const index = photos.value.findIndex(p => p.id === updatedPhoto.id);
    if (index !== -1) {
      photos.value[index] = { ...photos.value[index], ...updatedPhoto };
    }

    // Se foi aprovada, move de pending para feed
    if (updatedPhoto.aprovado) {
      const pendingIndex = pendingPhotos.value.findIndex(p => p.id === updatedPhoto.id);
      if (pendingIndex !== -1) {
        const photo = pendingPhotos.value[pendingIndex];
        photo.aprovado = true;
        photos.value.unshift(photo);
        pendingPhotos.value.splice(pendingIndex, 1);
      }
    }
  };

  const handleNewLike = (fotoId: number): void => {
    const photo = photos.value.find(p => p.id === fotoId);
    if (photo) {
      photo.likes_count = (photo.likes_count || 0) + 1;
    }
  };

  const handleNewComment = (fotoId: number, comment: PhotoComment): void => {
    const photo = photos.value.find(p => p.id === fotoId);
    if (photo) {
      photo.comments_count = (photo.comments_count || 0) + 1;
    }

    if (selectedPhoto.value?.id === fotoId) {
      if (!selectedPhotoComments.value.find(c => c.id === comment.id)) {
        selectedPhotoComments.value.push(comment);
      }
    }
  };

  // ========== RESET ==========

  const reset = (): void => {
    photos.value = [];
    pendingPhotos.value = [];
    stats.value = createEmptyPhotoStats();
    currentGuestCode.value = null;
    currentGuestName.value = null;
    currentGuestPhotoCount.value = 0;
    currentGuestVideoCount.value = 0;
    mediaFilter.value = 'all';
    selectedPhoto.value = null;
    selectedPhotoComments.value = [];
    hasMore.value = true;
    loadingMore.value = false;
    lastFetch.value = null;
    error.value = null;
  };

  return {
    // State
    photos,
    pendingPhotos,
    stats,
    loading,
    loadingMore,
    uploading,
    uploadProgress,
    error,
    currentGuestCode,
    currentGuestName,
    currentGuestPhotoCount,
    currentGuestVideoCount,
    mediaFilter,
    hasMore,
    selectedPhoto,
    selectedPhotoComments,
    // Computed
    hasPhotos,
    hasPendingPhotos,
    canUploadMore,
    remainingUploads,
    canUploadMoreVideos,
    remainingVideoUploads,
    filteredMedia,
    isAutoApproveEnabled,
    moderationStatus,
    // Actions
    setGuestContext,
    clearGuestContext,
    setMediaFilter,
    fetchApprovedPhotos,
    fetchMorePhotos,
    fetchGuestPhotoCount,
    uploadPhoto,
    uploadMedia,
    toggleLike,
    addComment,
    fetchPhotoComments,
    selectPhoto,
    closePhotoModal,
    // Admin actions
    fetchPendingPhotos,
    approvePhoto,
    rejectPhoto,
    bulkApprove,
    fetchStats,
    // Realtime handlers
    handleNewPhoto,
    handlePhotoUpdate,
    handleNewLike,
    handleNewComment,
    // Reset
    reset,
  };
});
