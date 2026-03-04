<script setup lang="ts">
import type { Photo } from '../model/types';
import { LikeButton } from '@/features/photo-interactions';
import { formatDuration } from '@/features/photo-upload';
import { formatDateTime } from '@shared/utils';

interface Props {
  photo: Photo;
  currentUserCode?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'like', id: number): void;
  (e: 'view', photo: Photo): void;
}>();

const isVideo = props.photo.media_type === 'video';
</script>

<template>
  <div
    class="media-card"
    :class="{ 'media-card--video': isVideo }"
    @click="emit('view', photo)"
  >
    <!-- Área de mídia -->
    <div class="media-card__media-wrapper">
      <img
        :src="isVideo ? (photo.poster_url || photo.public_url) : photo.public_url"
        :alt="photo.caption || (isVideo ? 'Vídeo do casamento' : 'Foto do casamento')"
        class="media-card__image"
        loading="lazy"
      />

      <!-- Play overlay para vídeos -->
      <div
        v-if="isVideo"
        class="media-card__play-overlay"
      >
        <span class="media-card__play-icon">
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

      <!-- Badge de duração para vídeos -->
      <div
        v-if="isVideo && photo.duration"
        class="media-card__duration"
      >
        {{ formatDuration(photo.duration) }}
      </div>

      <!-- Overlay de hover -->
      <div class="media-card__overlay">
        <span class="media-card__view-text">{{ isVideo ? 'Ver vídeo' : 'Ver foto' }}</span>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="media-card__content">
      <div class="media-card__header">
        <span class="media-card__author">{{ photo.nome_convidado }}</span>
        <span class="media-card__date">{{ formatDateTime(photo.created_at) }}</span>
      </div>

      <p
        v-if="photo.caption"
        class="media-card__caption"
      >
        {{ photo.caption }}
      </p>

      <div
        class="media-card__actions"
        @click.stop
      >
        <LikeButton
          :liked="photo.user_liked || false"
          :count="photo.likes_count || 0"
          :disabled="!currentUserCode"
          @toggle="emit('like', photo.id!)"
        />
        <button
          class="media-card__comment-btn"
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
.media-card {
  background: white;
  border-radius: 0.875rem;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.media-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.06);
}

/* Fotos: aspect-ratio 4:3 | Vídeos: quadrado */
.media-card__media-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #f3f4f6;
}

.media-card--video .media-card__media-wrapper {
  aspect-ratio: 1;
}

.media-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.media-card:hover .media-card__image {
  transform: scale(1.03);
}

/* Play overlay (vídeos) */
.media-card__play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  transition: background 0.2s;
}

.media-card:hover .media-card__play-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.media-card__play-icon {
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

.media-card:hover .media-card__play-icon {
  transform: scale(1.1);
  background: rgba(0, 0, 0, 0.7);
}

.media-card__duration {
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

/* Overlay de hover */
.media-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.media-card--video .media-card__overlay {
  background: rgba(0, 0, 0, 0.3);
}

.media-card:hover .media-card__overlay {
  opacity: 1;
}

.media-card__view-text {
  color: white;
  font-weight: 500;
  font-size: 0.8125rem;
  padding: 0.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Conteúdo */
.media-card__content {
  padding: 0.875rem 1rem;
}

.media-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
}

.media-card__author {
  font-weight: 600;
  color: #374151;
  font-size: 0.8125rem;
}

.media-card__date {
  font-size: 0.6875rem;
  color: #c0c5ce;
  letter-spacing: 0.01em;
}

.media-card__caption {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0 0 0.625rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.media-card__actions {
  display: flex;
  gap: 0.25rem;
  margin: 0 -0.375rem;
}

.media-card__comment-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.375rem 0.625rem;
  border: none;
  background: transparent;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.8125rem;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.media-card__comment-btn:hover {
  background: #f9fafb;
  color: #6b7280;
}

.media-card__comment-btn span:first-child {
  font-size: 1rem;
}
</style>
