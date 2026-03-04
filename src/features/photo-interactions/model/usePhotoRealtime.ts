import { ref, onMounted, onUnmounted } from 'vue';
import { supabase } from '@shared/lib/supabase';
import { usePhotosStore } from '@/features/photo-state';
import { storageService } from '@shared/api/storageService';
import type { Photo } from '@/entities/photo';
import type { PhotoComment } from '@/entities/comment';

/**
 * Composable: usePhotoRealtime
 * Gerencia inscrições realtime para fotos
 */
export function usePhotoRealtime() {
  const store = usePhotosStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channel = ref<any>(null);
  const isConnected = ref(false);

  /**
   * Configura as inscrições realtime
   */
  const setupRealtimeSubscription = (): void => {
    channel.value = supabase
      .channel('photos-realtime')
      // Novas fotos
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fotos',
        },
        payload => {
          const newPhoto = payload.new as Record<string, unknown>;
          const storagePath = newPhoto.storage_path as string;
          const posterPath = newPhoto.poster_path as string | undefined;

          const photo: Photo = {
            id: newPhoto.id as number,
            codigo_convidado: newPhoto.codigo_convidado as string,
            nome_convidado: newPhoto.nome_convidado as string,
            storage_path: storagePath,
            caption: newPhoto.caption as string | undefined,
            aprovado: newPhoto.aprovado as boolean,
            created_at: newPhoto.created_at as string,
            // Campos de vídeo
            media_type: (newPhoto.media_type as 'photo' | 'video') || 'photo',
            duration: newPhoto.duration as number | undefined,
            poster_path: posterPath,
            // URLs computadas
            public_url: storageService.getPublicUrl(storagePath),
            poster_url: posterPath ? storageService.getPublicUrl(posterPath) : undefined,
            likes_count: 0,
            comments_count: 0,
            user_liked: false,
          };

          store.handleNewPhoto(photo);
        }
      )
      // Atualizações de fotos (aprovação)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'fotos',
        },
        payload => {
          const updatedPhoto = payload.new as Record<string, unknown>;
          const storagePath = updatedPhoto.storage_path as string;
          const posterPath = updatedPhoto.poster_path as string | undefined;

          const photo: Photo = {
            id: updatedPhoto.id as number,
            codigo_convidado: updatedPhoto.codigo_convidado as string,
            nome_convidado: updatedPhoto.nome_convidado as string,
            storage_path: storagePath,
            caption: updatedPhoto.caption as string | undefined,
            aprovado: updatedPhoto.aprovado as boolean,
            created_at: updatedPhoto.created_at as string,
            // Campos de vídeo
            media_type: (updatedPhoto.media_type as 'photo' | 'video') || 'photo',
            duration: updatedPhoto.duration as number | undefined,
            poster_path: posterPath,
            // URLs computadas
            public_url: storageService.getPublicUrl(storagePath),
            poster_url: posterPath ? storageService.getPublicUrl(posterPath) : undefined,
          };

          store.handlePhotoUpdate(photo);
        }
      )
      // Novos likes
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'foto_likes',
        },
        payload => {
          const like = payload.new as { foto_id: number };
          store.handleNewLike(like.foto_id);
        }
      )
      // Novos comentários
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'foto_comentarios',
        },
        payload => {
          const comment = payload.new as PhotoComment;
          store.handleNewComment(comment.foto_id, comment);
        }
      )
      .subscribe(status => {
        isConnected.value = status === 'SUBSCRIBED';
        console.log('[PhotoRealtime] Status:', status);
      });
  };

  /**
   * Limpa as inscrições
   */
  const cleanup = (): void => {
    if (channel.value) {
      supabase.removeChannel(channel.value);
      channel.value = null;
      isConnected.value = false;
    }
  };

  /**
   * Reconecta ao canal
   */
  const reconnect = (): void => {
    cleanup();
    setupRealtimeSubscription();
  };

  onMounted(() => {
    setupRealtimeSubscription();
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    isConnected,
    reconnect,
    cleanup,
  };
}
