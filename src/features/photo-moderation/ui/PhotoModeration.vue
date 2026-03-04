<template>
  <div class="photo-moderation">
    <!-- Header -->
    <div class="photo-moderation__header">
      <h3 class="photo-moderation__title">
        Mídia Pendente ({{ store.pendingPhotos.length }})
      </h3>

      <div
        v-if="store.pendingPhotos.length > 0"
        class="photo-moderation__actions"
      >
        <label class="photo-moderation__select-all">
          <input
            type="checkbox"
            :checked="selectedIds.length === store.pendingPhotos.length"
            @change="selectAll"
          />
          Selecionar todos
        </label>

        <button
          v-if="selectedIds.length > 0"
          class="photo-moderation__bulk-btn"
          :disabled="approving"
          @click="handleBulkApprove"
        >
          {{
            approving ? 'Aprovando...' : `Aprovar ${selectedIds.length} item(s)`
          }}
        </button>
      </div>
    </div>

    <!-- Status de moderação -->
    <div
      class="photo-moderation__status"
      :class="{ 'photo-moderation__status--auto': store.isAutoApproveEnabled }"
    >
      <span v-if="store.isAutoApproveEnabled">
        Modo automático ativo - novas mídias são aprovadas instantaneamente
      </span>
      <span v-else>
        Modo moderação ativo - fotos e vídeos precisam de aprovação manual
      </span>
    </div>

    <!-- Loading -->
    <div
      v-if="store.loading"
      class="photo-moderation__loading"
    >
      Carregando mídia pendente...
    </div>

    <!-- Empty -->
    <div
      v-else-if="!store.hasPendingPhotos"
      class="photo-moderation__empty"
    >
      Nenhuma mídia pendente de aprovação
    </div>

    <!-- Grid -->
    <div
      v-else
      class="photo-moderation__grid"
    >
      <div
        v-for="photo in store.pendingPhotos"
        :key="photo.id"
        class="photo-moderation__card"
        :class="{
          'photo-moderation__card--selected': selectedIds.includes(photo.id!),
        }"
      >
        <div class="photo-moderation__checkbox">
          <input
            type="checkbox"
            :checked="selectedIds.includes(photo.id!)"
            @change="toggleSelection(photo.id!)"
          />
        </div>

        <div class="photo-moderation__media-wrapper">
          <img
            :src="getMediaSrc(photo)"
            :alt="photo.caption || (isVideo(photo) ? 'Vídeo' : 'Foto')"
            class="photo-moderation__image"
          />

          <!-- Indicadores de vídeo -->
          <template v-if="isVideo(photo)">
            <div class="photo-moderation__play-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div
              v-if="photo.duration"
              class="photo-moderation__duration"
            >
              {{ formatDuration(photo.duration) }}
            </div>
          </template>
        </div>

        <div class="photo-moderation__info">
          <div class="photo-moderation__info-header">
            <span class="photo-moderation__author">{{
              photo.nome_convidado
            }}</span>
            <span
              class="photo-moderation__type-badge"
              :class="{ 'photo-moderation__type-badge--video': isVideo(photo) }"
            >
              {{ isVideo(photo) ? '🎥' : '📷' }}
            </span>
          </div>
          <span class="photo-moderation__date">{{
            formatDate(photo.created_at)
          }}</span>
          <p
            v-if="photo.caption"
            class="photo-moderation__caption"
          >
            {{ photo.caption }}
          </p>
        </div>

        <div class="photo-moderation__card-actions">
          <button
            class="photo-moderation__btn photo-moderation__btn--approve"
            @click="handleApprove(photo.id!)"
          >
            Aprovar
          </button>
          <button
            class="photo-moderation__btn photo-moderation__btn--reject"
            @click="handleReject(photo.id!)"
          >
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePhotosStore } from '@/features/photo-state';
import { formatDuration } from '@/features/photo-upload';
import type { Photo } from '@/entities/photo';

/**
 * Component: PhotoModeration
 * Painel de moderação de fotos e vídeos para admin
 */

const store = usePhotosStore();
const selectedIds = ref<number[]>([]);
const approving = ref(false);

onMounted(async () => {
  await store.fetchPendingPhotos();
});

const toggleSelection = (id: number) => {
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
};

const selectAll = () => {
  if (selectedIds.value.length === store.pendingPhotos.length) {
    selectedIds.value = [];
  } else {
    selectedIds.value = store.pendingPhotos.map(p => p.id!);
  }
};

const handleApprove = async (id: number) => {
  await store.approvePhoto(id);
  selectedIds.value = selectedIds.value.filter(i => i !== id);
};

const handleReject = async (id: number) => {
  const item = store.pendingPhotos.find(p => p.id === id);
  const itemType = item?.media_type === 'video' ? 'vídeo' : 'foto';
  if (
    confirm(
      `Tem certeza que deseja rejeitar ${itemType === 'vídeo' ? 'este' : 'esta'} ${itemType}? ${itemType === 'vídeo' ? 'Ele' : 'Ela'} será ${itemType === 'vídeo' ? 'excluído' : 'excluída'}.`
    )
  ) {
    await store.rejectPhoto(id);
    selectedIds.value = selectedIds.value.filter(i => i !== id);
  }
};

const handleBulkApprove = async () => {
  if (selectedIds.value.length === 0) return;
  approving.value = true;
  await store.bulkApprove(selectedIds.value);
  selectedIds.value = [];
  approving.value = false;
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isVideo = (photo: Photo): boolean => photo.media_type === 'video';

const getMediaSrc = (photo: Photo): string => {
  if (isVideo(photo)) {
    return photo.poster_url || photo.public_url || '';
  }
  return photo.public_url || '';
};
</script>

<style scoped>
.photo-moderation {
  padding: 1.5rem;
}

.photo-moderation__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.photo-moderation__title {
  margin: 0;
  font-size: 1.125rem;
  color: #e5e7eb;
}

.photo-moderation__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.photo-moderation__select-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #9ca3af;
  cursor: pointer;
}

.photo-moderation__bulk-btn {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.photo-moderation__bulk-btn:hover:not(:disabled) {
  background: #059669;
}

.photo-moderation__bulk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-moderation__status {
  padding: 0.75rem 1rem;
  background: #374151;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #fbbf24;
  margin-bottom: 1.5rem;
}

.photo-moderation__status--auto {
  background: #065f46;
  color: #a7f3d0;
}

.photo-moderation__loading,
.photo-moderation__empty {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

.photo-moderation__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.photo-moderation__card {
  position: relative;
  background: #374151;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.photo-moderation__card--selected {
  box-shadow: 0 0 0 2px #10b981;
}

.photo-moderation__checkbox {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 1;
}

.photo-moderation__checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.photo-moderation__media-wrapper {
  position: relative;
}

.photo-moderation__image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.photo-moderation__play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}

.photo-moderation__duration {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.125rem 0.375rem;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 0.6875rem;
  font-weight: 500;
  border-radius: 0.25rem;
}

.photo-moderation__info {
  padding: 0.75rem;
}

.photo-moderation__info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photo-moderation__type-badge {
  font-size: 0.875rem;
}

.photo-moderation__type-badge--video {
  animation: pulse 2s infinite;
}

.photo-moderation__author {
  display: block;
  font-weight: 500;
  color: #e5e7eb;
  font-size: 0.875rem;
}

.photo-moderation__date {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.photo-moderation__caption {
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  color: #d1d5db;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.photo-moderation__card-actions {
  display: flex;
  border-top: 1px solid #4b5563;
}

.photo-moderation__btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.photo-moderation__btn--approve {
  background: #065f46;
  color: #a7f3d0;
}

.photo-moderation__btn--approve:hover {
  background: #047857;
}

.photo-moderation__btn--reject {
  background: #7f1d1d;
  color: #fecaca;
}

.photo-moderation__btn--reject:hover {
  background: #991b1b;
}
</style>
