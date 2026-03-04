<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { usePhotosStore } from '@/features/photo-state';
import { usePhotoRealtime } from '../model/usePhotoRealtime';
import { MediaCard } from '@/entities/photo';

/**
 * Component: PhotoFeed
 * Grid de fotos e vídeos com filtros, realtime e infinite scroll
 */

const store = usePhotosStore();
const { isConnected } = usePhotoRealtime();

const emit = defineEmits<{
  (e: 'view', photo: (typeof store.photos)[0]): void;
}>();

// Infinite scroll
const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// Filtros de mídia
type MediaFilterType = 'all' | 'photo' | 'video';

const filters: { value: MediaFilterType; label: string; icon: string }[] = [
  { value: 'all', label: 'Todos', icon: '🎬' },
  { value: 'photo', label: 'Fotos', icon: '📷' },
  { value: 'video', label: 'Vídeos', icon: '🎥' },
];

const hasMedia = computed(() => store.filteredMedia.length > 0);

const emptyMessage = computed(() => {
  if (store.mediaFilter === 'photo') return 'Nenhuma foto ainda';
  if (store.mediaFilter === 'video') return 'Nenhum vídeo ainda';
  return 'Nenhuma mídia ainda';
});

const emptyIcon = computed(() => {
  if (store.mediaFilter === 'photo') return '📷';
  if (store.mediaFilter === 'video') return '🎥';
  return '📷';
});

const setupObserver = () => {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && store.hasMore && !store.loadingMore) {
        store.fetchMorePhotos();
      }
    },
    { rootMargin: '200px' }
  );

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
};

onMounted(async () => {
  await store.fetchApprovedPhotos();
  setupObserver();
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

const handleLike = (photoId: number) => {
  store.toggleLike(photoId);
};

const handleView = (photo: (typeof store.photos)[0]) => {
  emit('view', photo);
};

const setFilter = (filter: MediaFilterType) => {
  store.setMediaFilter(filter);
};
</script>

<template>
  <div class="photo-feed">
    <!-- Header com status e filtros -->
    <div class="photo-feed__header">
      <!-- Status de conexão -->
      <div class="photo-feed__status">
        <span
          class="photo-feed__indicator"
          :class="{ 'photo-feed__indicator--connected': isConnected }"
        ></span>
        <span class="photo-feed__status-text">
          {{ isConnected ? 'Ao vivo' : 'Reconectando...' }}
        </span>
      </div>

      <!-- Filtros de mídia -->
      <div class="photo-feed__filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="photo-feed__filter-btn"
          :class="{ 'photo-feed__filter-btn--active': store.mediaFilter === filter.value }"
          @click="setFilter(filter.value)"
        >
          <span class="photo-feed__filter-icon">{{ filter.icon }}</span>
          <span class="photo-feed__filter-label">{{ filter.label }}</span>
        </button>
      </div>
    </div>

    <!-- Loading inicial -->
    <div
      v-if="store.loading"
      class="photo-feed__loading"
    >
      <div class="photo-feed__spinner"></div>
      <p>Carregando...</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!hasMedia"
      class="photo-feed__empty"
    >
      <span class="photo-feed__empty-icon">{{ emptyIcon }}</span>
      <p class="photo-feed__empty-text">{{ emptyMessage }}</p>
      <p class="photo-feed__empty-hint">Seja o primeiro a compartilhar!</p>
    </div>

    <!-- Grid -->
    <template v-else>
      <div class="photo-feed__grid">
        <MediaCard
          v-for="photo in store.filteredMedia"
          :key="photo.id"
          :photo="photo"
          :current-user-code="store.currentGuestCode"
          @like="handleLike"
          @view="handleView"
        />
      </div>

      <!-- Sentinel para infinite scroll -->
      <div
        ref="sentinelRef"
        class="photo-feed__sentinel"
      >
        <div
          v-if="store.loadingMore"
          class="photo-feed__loading-more"
        >
          <div class="photo-feed__spinner photo-feed__spinner--small"></div>
          <span>Carregando mais...</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.photo-feed {
  width: 100%;
}

.photo-feed__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.photo-feed__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #9ca3af;
  letter-spacing: 0.02em;
}

.photo-feed__filters {
  display: flex;
  gap: 0.375rem;
}

.photo-feed__filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.8125rem;
  color: #6b7280;
  transition: all 0.2s ease;
}

.photo-feed__filter-btn:hover {
  border-color: #c9956a;
  color: #c9956a;
  background: #fdf8f4;
}

.photo-feed__filter-btn--active {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.photo-feed__filter-btn--active:hover {
  background: linear-gradient(135deg, #c9956a 0%, #b88c60 100%);
  border-color: transparent;
  color: white;
}

.photo-feed__filter-icon {
  font-size: 0.875rem;
}

.photo-feed__filter-label {
  font-weight: 500;
}

.photo-feed__indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
}

.photo-feed__indicator--connected {
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.photo-feed__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.photo-feed__spinner {
  width: 36px;
  height: 36px;
  border: 2.5px solid #f3f4f6;
  border-top-color: #d4a574;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

.photo-feed__spinner--small {
  width: 24px;
  height: 24px;
  border-width: 2px;
  margin-bottom: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.photo-feed__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.photo-feed__empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1.25rem;
  opacity: 0.4;
}

.photo-feed__empty-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.photo-feed__empty-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.photo-feed__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.photo-feed__sentinel {
  display: flex;
  justify-content: center;
  padding: 2rem 0 1rem;
  min-height: 1px;
}

.photo-feed__loading-more {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #9ca3af;
  font-size: 0.8125rem;
}

@media (max-width: 640px) {
  .photo-feed__header {
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .photo-feed__grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
