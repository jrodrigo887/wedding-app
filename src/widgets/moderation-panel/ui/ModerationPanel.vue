<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePhotosStore } from '@/features/photo-state';
import { downloadPhotosAsZip, type DownloadProgress } from '@/features/photo-upload';
import { PhotoModeration } from '@/features/photo-moderation';

/**
 * Widget: ModerationPanel
 * Painel de administração de fotos com estatísticas, download e moderação
 */

const store = usePhotosStore();
const downloading = ref(false);
const downloadProgress = ref<DownloadProgress>({ current: 0, total: 0, percentage: 0 });

onMounted(async () => {
  await Promise.all([store.fetchStats(), store.fetchApprovedPhotos()]);
});

const handleDownloadAll = async () => {
  if (store.photos.length === 0) return;

  downloading.value = true;
  downloadProgress.value = { current: 0, total: store.photos.length, percentage: 0 };

  try {
    await downloadPhotosAsZip(store.photos, progress => {
      downloadProgress.value = progress;
    });
  } catch (error) {
    console.error('Erro ao baixar:', error);
  } finally {
    downloading.value = false;
    downloadProgress.value = { current: 0, total: 0, percentage: 0 };
  }
};
</script>

<template>
  <div class="admin-photos">
    <!-- Stats -->
    <div class="admin-photos__stats">
      <div class="admin-photos__stat">
        <span class="admin-photos__stat-value">{{ store.stats.total }}</span>
        <span class="admin-photos__stat-label">Total</span>
      </div>
      <div class="admin-photos__stat admin-photos__stat--success">
        <span class="admin-photos__stat-value">{{ store.stats.approved }}</span>
        <span class="admin-photos__stat-label">Aprovadas</span>
      </div>
      <div class="admin-photos__stat admin-photos__stat--warning">
        <span class="admin-photos__stat-value">{{ store.stats.pending }}</span>
        <span class="admin-photos__stat-label">Pendentes</span>
      </div>
      <div class="admin-photos__stat">
        <span class="admin-photos__stat-value">{{ store.stats.totalLikes }}</span>
        <span class="admin-photos__stat-label">Curtidas</span>
      </div>
      <div class="admin-photos__stat">
        <span class="admin-photos__stat-value">{{ store.stats.totalComments }}</span>
        <span class="admin-photos__stat-label">Comentários</span>
      </div>
    </div>

    <!-- Download -->
    <div class="admin-photos__download">
      <button
        class="admin-photos__download-btn"
        :disabled="downloading || store.photos.length === 0"
        @click="handleDownloadAll"
      >
        <span v-if="downloading"> Baixando... {{ downloadProgress.percentage }}% </span>
        <span v-else> ⬇️ Baixar todas as fotos (ZIP) </span>
      </button>

      <div
        v-if="downloading"
        class="admin-photos__progress"
      >
        <div
          class="admin-photos__progress-bar"
          :style="{ width: downloadProgress.percentage + '%' }"
        ></div>
      </div>

      <p class="admin-photos__download-info">
        {{ store.photos.length }} fotos aprovadas disponíveis para download
      </p>
    </div>

    <!-- Moderation -->
    <PhotoModeration />
  </div>
</template>

<style scoped>
.admin-photos {
  padding: 1.5rem;
}

.admin-photos__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.admin-photos__stat {
  padding: 1.25rem;
  background: #374151;
  border-radius: 0.5rem;
  text-align: center;
  border-left: 3px solid #6b7280;
}

.admin-photos__stat--success {
  border-left-color: #10b981;
}

.admin-photos__stat--warning {
  border-left-color: #f59e0b;
}

.admin-photos__stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 600;
  color: #f9fafb;
}

.admin-photos__stat-label {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  text-transform: uppercase;
}

.admin-photos__download {
  padding: 1.5rem;
  background: #374151;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.admin-photos__download-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.admin-photos__download-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.admin-photos__download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-photos__progress {
  width: 100%;
  height: 8px;
  background: #4b5563;
  border-radius: 9999px;
  margin-top: 1rem;
  overflow: hidden;
}

.admin-photos__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.admin-photos__download-info {
  margin: 1rem 0 0 0;
  font-size: 0.875rem;
  color: #9ca3af;
}
</style>
