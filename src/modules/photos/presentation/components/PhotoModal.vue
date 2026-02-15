<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Photo } from '@/entities/photo';
import { usePhotosStore } from '../../infrastructure/stores';
import { downloadSinglePhoto } from '../../infrastructure/services';
import { formatDuration } from '../../infrastructure/services/videoCompressor';
import LikeButton from './LikeButton.vue';
import CommentSection from './CommentSection.vue';

/**
 * Component: PhotoModal
 * Modal de visualização de foto/vídeo em tela cheia
 */

interface Props {
  photo: Photo | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = usePhotosStore();
const downloading = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);

const isVideo = computed(() => props.photo?.media_type === 'video');

const mediaLabel = computed(() => (isVideo.value ? 'Vídeo' : 'Foto'));

watch(
  () => props.photo,
  async (newPhoto, oldPhoto) => {
    if (newPhoto) {
      await store.fetchPhotoComments(newPhoto.id!);
    }
    // Pause o vídeo anterior ao trocar
    if (oldPhoto && videoRef.value) {
      videoRef.value.pause();
    }
  },
  { immediate: true }
);

const handleLike = () => {
  if (props.photo) {
    store.toggleLike(props.photo.id!);
  }
};

const handleAddComment = async (texto: string) => {
  if (props.photo) {
    await store.addComment(props.photo.id!, texto);
  }
};

const handleDownload = async () => {
  if (!props.photo) return;
  downloading.value = true;
  try {
    await downloadSinglePhoto(props.photo);
  } catch (error) {
    console.error('Erro ao baixar:', error);
  } finally {
    downloading.value = false;
  }
};

const handleClose = () => {
  // Pausa o vídeo antes de fechar
  if (videoRef.value) {
    videoRef.value.pause();
  }
  emit('close');
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="photo"
        class="photo-modal"
        @click.self="handleClose"
      >
        <button
          class="photo-modal__close"
          @click="handleClose"
        >
          ✕
        </button>

        <div class="photo-modal__content">
          <!-- Container de mídia -->
          <div class="photo-modal__media-container">
            <!-- Vídeo -->
            <video
              v-if="isVideo"
              ref="videoRef"
              :src="photo.public_url"
              :poster="photo.poster_url"
              class="photo-modal__video"
              controls
              playsinline
            >
              Seu navegador não suporta vídeos.
            </video>

            <!-- Imagem -->
            <img
              v-else
              :src="photo.public_url"
              :alt="photo.caption || 'Foto do casamento'"
              class="photo-modal__image"
            />
          </div>

          <!-- Sidebar -->
          <div class="photo-modal__sidebar">
            <!-- Header -->
            <div class="photo-modal__header">
              <div class="photo-modal__author">
                <span class="photo-modal__author-name">
                  {{ photo.nome_convidado }}
                </span>
                <span class="photo-modal__date">
                  {{ formatDate(photo.created_at) }}
                </span>
              </div>
              <!-- Badge de tipo de mídia -->
              <span
                class="photo-modal__media-badge"
                :class="{ 'photo-modal__media-badge--video': isVideo }"
              >
                {{ isVideo ? '🎥' : '📷' }} {{ mediaLabel }}
                <template v-if="isVideo && photo.duration">
                  ({{ formatDuration(photo.duration) }})
                </template>
              </span>
            </div>

            <!-- Caption -->
            <p
              v-if="photo.caption"
              class="photo-modal__caption"
            >
              {{ photo.caption }}
            </p>

            <!-- Actions -->
            <div class="photo-modal__actions">
              <LikeButton
                :liked="photo.user_liked || false"
                :count="photo.likes_count || 0"
                :disabled="!store.currentGuestCode"
                @toggle="handleLike"
              />
              <button
                class="photo-modal__download"
                :disabled="downloading"
                @click="handleDownload"
              >
                {{ downloading ? 'Baixando...' : '⬇️ Baixar' }}
              </button>
            </div>

            <!-- Comments -->
            <div class="photo-modal__comments">
              <h3 class="photo-modal__comments-title">
                Comentários ({{ photo.comments_count || 0 }})
              </h3>
              <CommentSection
                :comments="store.selectedPhotoComments"
                :current-user-code="store.currentGuestCode"
                @add="handleAddComment"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.photo-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.photo-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.25rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
}

.photo-modal__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.photo-modal__content {
  display: flex;
  max-width: 1200px;
  max-height: 90vh;
  width: 100%;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
}

.photo-modal__media-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  min-height: 400px;
}

.photo-modal__image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.photo-modal__video {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  outline: none;
}

.photo-modal__sidebar {
  width: 350px;
  display: flex;
  flex-direction: column;
  background: white;
}

.photo-modal__header {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.photo-modal__author {
  display: flex;
  flex-direction: column;
}

.photo-modal__media-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  background: #f3f4f6;
  color: #6b7280;
  white-space: nowrap;
}

.photo-modal__media-badge--video {
  background: #fef3c7;
  color: #d97706;
}

.photo-modal__author-name {
  font-weight: 600;
  color: #374151;
}

.photo-modal__date {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.photo-modal__caption {
  padding: 1rem;
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
  border-bottom: 1px solid #f3f4f6;
}

.photo-modal__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.photo-modal__download {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 9999px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-modal__download:hover:not(:disabled) {
  background: #f9fafb;
}

.photo-modal__download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-modal__comments {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.photo-modal__comments-title {
  padding: 1rem;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.photo-modal__comments :deep(.comment-section) {
  flex: 1;
  overflow-y: auto;
}

/* Animação */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Mobile */
@media (max-width: 768px) {
  .photo-modal__content {
    flex-direction: column;
    max-height: 95vh;
  }

  .photo-modal__media-container {
    max-height: 50vh;
  }

  .photo-modal__video,
  .photo-modal__image {
    max-height: 50vh;
  }

  .photo-modal__sidebar {
    width: 100%;
    max-height: 50vh;
    overflow-y: auto;
  }
}
</style>
