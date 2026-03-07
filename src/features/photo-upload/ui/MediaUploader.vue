<script setup lang="ts">
import { ref } from 'vue';
import { usePhotosStore } from '@/features/photo-state';
import PhotoUploader from './PhotoUploader.vue';
import VideoUploader from './VideoUploader.vue';
import VideoRecorder from './VideoRecorder.vue';

type TabType = 'photo' | 'video' | 'record';

const store = usePhotosStore();
const activeTab = ref<TabType>('photo');

const tabs = [
  { id: 'photo' as const, label: 'Foto', icon: '📷' },
  { id: 'video' as const, label: 'Vídeo', icon: '🎬' },
  { id: 'record' as const, label: 'Gravar', icon: '🔴' },
];

const handleUploaded = () => {};
</script>

<template>
  <div class="media-uploader">
    <div class="media-uploader__limits">
      <span class="media-uploader__limit">
        <span class="media-uploader__limit-icon">📷</span>
        {{ store.currentGuestPhotoCount }}/20 fotos
      </span>
      <span class="media-uploader__limit-divider">|</span>
      <span class="media-uploader__limit">
        <span class="media-uploader__limit-icon">🎬</span>
        {{ store.currentGuestVideoCount }}/5 vídeos
      </span>
    </div>

    <div class="media-uploader__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="media-uploader__tab"
        :class="{ 'media-uploader__tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="media-uploader__tab-icon">{{ tab.icon }}</span>
        <span class="media-uploader__tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="media-uploader__content">
      <PhotoUploader v-if="activeTab === 'photo'" />
      <VideoUploader
        v-else-if="activeTab === 'video'"
        @uploaded="handleUploaded"
      />
      <VideoRecorder
        v-else-if="activeTab === 'record'"
        @uploaded="handleUploaded"
      />
    </div>

    <p class="media-uploader__moderation">
      {{ store.moderationStatus }}
    </p>
  </div>
</template>

<style scoped>
.media-uploader {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.media-uploader__limits {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #374151;
}

.media-uploader__limit {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.media-uploader__limit-icon {
  font-size: 1rem;
}

.media-uploader__limit-divider {
  color: #e5e7eb;
  margin: 0 0.25rem;
}

.media-uploader__tabs {
  display: flex;
  background: white;
  border-radius: 0.75rem;
  padding: 0.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.media-uploader__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.media-uploader__tab:hover {
  color: #374151;
  background: #f9fafb;
}

.media-uploader__tab--active {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
}

.media-uploader__tab--active:hover {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
}

.media-uploader__tab-icon {
  font-size: 1.125rem;
}

.media-uploader__tab-label {
  display: none;
}

@media (min-width: 400px) {
  .media-uploader__tab-label {
    display: inline;
  }
}

.media-uploader__content {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.media-uploader__moderation {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
}
</style>
