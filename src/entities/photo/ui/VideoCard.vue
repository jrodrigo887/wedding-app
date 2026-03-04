<script setup lang="ts">
import type { Photo } from '../model/types';
import { formatDuration } from '@/features/photo-upload';
import { LikeButton } from '@/features/photo-interactions';

interface Props {
  photo: Photo;
  currentUserCode?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'like', id: number): void;
  (e: 'view', photo: Photo): void;
}>();

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<template>
  <div
    class="video-card"
    @click="emit('view', photo)"
  >
    <div class="video-card__image-wrapper">
      <img
        :src="photo.poster_url || photo.public_url"
        :alt="photo.caption || 'Vídeo do casamento'"
        class="video-card__image"
        loading="lazy"
      />

      <div class="video-card__play-overlay">
        <span class="video-card__play-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>

      <div
        v-if="photo.duration"
        class="video-card__duration"
      >
        {{ formatDuration(photo.duration) }}
      </div>

      <div class="video-card__overlay">
        <span class="video-card__view-text">Ver vídeo</span>
      </div>
    </div>

    <div class="video-card__content">
      <div class="video-card__header">
        <span class="video-card__author">{{ photo.nome_convidado }}</span>
        <span class="video-card__date">{{ formatDate(photo.created_at) }}</span>
      </div>

      <p
        v-if="photo.caption"
        class="video-card__caption"
      >
        {{ photo.caption }}
      </p>

      <div
        class="video-card__actions"
        @click.stop
      >
        <LikeButton
          :liked="photo.user_liked || false"
          :count="photo.likes_count || 0"
          :disabled="!currentUserCode"
          @toggle="emit('like', photo.id!)"
        />
        <button
          class="video-card__comment-btn"
          @click="emit('view', photo)"
        >
          <span>💬</span>
          <span>{{ photo.comments_count || 0 }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.video-card__image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.video-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.video-card:hover .video-card__image {
  transform: scale(1.05);
}

.video-card__play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  transition: background 0.2s;
}

.video-card:hover .video-card__play-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.video-card__play-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  transition:
    transform 0.2s,
    background 0.2s;
}

.video-card:hover .video-card__play-icon {
  transform: scale(1.1);
  background: rgba(0, 0, 0, 0.7);
}

.video-card__duration {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.25rem;
}

.video-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.video-card:hover .video-card__overlay {
  opacity: 1;
}

.video-card__view-text {
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}

.video-card__content {
  padding: 1rem;
}

.video-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.video-card__author {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.video-card__date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.video-card__caption {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-card__actions {
  display: flex;
  gap: 0.5rem;
}

.video-card__comment-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  transition: background 0.2s;
}

.video-card__comment-btn:hover {
  background: #f3f4f6;
}

.video-card__comment-btn span:first-child {
  font-size: 1.125rem;
}
</style>
