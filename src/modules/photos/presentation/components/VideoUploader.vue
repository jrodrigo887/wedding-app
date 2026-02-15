<script setup lang="ts">
import { ref } from 'vue';
import { useVideoUpload } from '../../infrastructure/composables/useVideoUpload';
import { usePhotosStore } from '../../infrastructure/stores';
import { formatFileSize, formatDuration } from '../../infrastructure/services/videoCompressor';
import UploadProgress from './UploadProgress.vue';

/**
 * Component: VideoUploader
 * Upload de arquivo de vídeo da galeria
 */

const emit = defineEmits<{
  (e: 'uploaded'): void;
}>();

const store = usePhotosStore();
const {
  selectedFile,
  previewUrl,
  posterUrl,
  videoDuration,
  validating,
  validationError,
  uploading,
  uploadError,
  hasVideo,
  validateVideoFile,
  uploadVideo,
  clearVideo,
} = useVideoUpload();

const fileInputRef = ref<HTMLInputElement | null>(null);
const caption = ref('');
const isDragging = ref(false);

const handleClick = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    await validateVideoFile(file);
  }
  // Reset input para permitir selecionar o mesmo arquivo novamente
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('video/')) {
    await validateVideoFile(file);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDiscard = () => {
  clearVideo();
  caption.value = '';
};

const handleUpload = async () => {
  const success = await uploadVideo(caption.value || undefined);
  if (success) {
    caption.value = '';
    emit('uploaded');
  }
};
</script>

<template>
  <div class="video-uploader">
    <!-- Input hidden -->
    <input
      ref="fileInputRef"
      type="file"
      accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
      class="video-uploader__input"
      @change="handleFileSelect"
    />

    <!-- Dropzone quando não há vídeo selecionado -->
    <div
      v-if="!hasVideo"
      class="video-uploader__dropzone"
      :class="{ 'video-uploader__dropzone--dragging': isDragging }"
      @click="handleClick"
      @drop.prevent="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <div
        v-if="validating"
        class="video-uploader__loading"
      >
        <div class="video-uploader__spinner"></div>
        <p>Processando vídeo...</p>
      </div>

      <template v-else>
        <span class="video-uploader__icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </span>
        <p class="video-uploader__text">
          <span class="video-uploader__text-main">Toque para selecionar um vídeo</span>
          <span class="video-uploader__text-hint">ou arraste e solte aqui</span>
        </p>
        <p class="video-uploader__formats">MP4, WebM, MOV - Máx. 60s / 100MB</p>
        <p class="video-uploader__limit">{{ store.currentGuestVideoCount }}/5 vídeos enviados</p>
      </template>
    </div>

    <!-- Preview do vídeo selecionado -->
    <div
      v-else
      class="video-uploader__preview"
    >
      <div class="video-uploader__video-container">
        <video
          :src="previewUrl || undefined"
          :poster="posterUrl || undefined"
          class="video-uploader__video"
          controls
          playsinline
        ></video>
      </div>

      <!-- Info do vídeo -->
      <div class="video-uploader__info">
        <div class="video-uploader__info-item">
          <span class="video-uploader__info-label">Duração:</span>
          <span>{{ formatDuration(videoDuration) }}</span>
        </div>
        <div
          v-if="selectedFile"
          class="video-uploader__info-item"
        >
          <span class="video-uploader__info-label">Tamanho:</span>
          <span>{{ formatFileSize(selectedFile.size) }}</span>
        </div>
      </div>

      <!-- Form caption -->
      <div class="video-uploader__form">
        <textarea
          v-model="caption"
          class="video-uploader__caption"
          placeholder="Adicione uma legenda (opcional)"
          rows="2"
          maxlength="500"
        ></textarea>

        <div class="video-uploader__form-actions">
          <button
            class="video-uploader__btn video-uploader__btn--secondary"
            :disabled="uploading"
            @click="handleDiscard"
          >
            Descartar
          </button>
          <button
            class="video-uploader__btn video-uploader__btn--primary"
            :disabled="uploading || !store.canUploadMoreVideos"
            @click="handleUpload"
          >
            {{ uploading ? 'Enviando...' : 'Enviar Vídeo' }}
          </button>
        </div>
      </div>

      <!-- Progress -->
      <UploadProgress
        v-if="uploading"
        :progress="100"
        status="uploading"
      />
    </div>

    <!-- Erros -->
    <p
      v-if="validationError"
      class="video-uploader__message video-uploader__message--error"
    >
      {{ validationError }}
    </p>
    <p
      v-if="uploadError"
      class="video-uploader__message video-uploader__message--error"
    >
      {{ uploadError }}
    </p>
  </div>
</template>

<style scoped>
.video-uploader {
  width: 100%;
}

.video-uploader__input {
  display: none;
}

.video-uploader__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.video-uploader__dropzone:hover {
  border-color: #d4a574;
  background: #fefdfb;
}

.video-uploader__dropzone--dragging {
  border-color: #d4a574;
  background: #fef7ed;
}

.video-uploader__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.video-uploader__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #d4a574;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.video-uploader__icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.video-uploader__text {
  margin: 0 0 0.5rem 0;
}

.video-uploader__text-main {
  display: block;
  font-size: 1rem;
  color: #374151;
  font-weight: 500;
}

.video-uploader__text-hint {
  display: block;
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.video-uploader__formats {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0.5rem 0;
}

.video-uploader__limit {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.video-uploader__preview {
  border-radius: 0.75rem;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.video-uploader__video-container {
  background: #000;
}

.video-uploader__video {
  width: 100%;
  max-height: 400px;
  display: block;
}

.video-uploader__info {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  font-size: 0.875rem;
}

.video-uploader__info-item {
  display: flex;
  gap: 0.5rem;
}

.video-uploader__info-label {
  color: #6b7280;
}

.video-uploader__form {
  padding: 1rem;
}

.video-uploader__caption {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: none;
  font-family: inherit;
}

.video-uploader__caption:focus {
  outline: none;
  border-color: #d4a574;
}

.video-uploader__form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.video-uploader__btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.video-uploader__btn--primary {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
}

.video-uploader__btn--primary:hover:not(:disabled) {
  opacity: 0.9;
}

.video-uploader__btn--secondary {
  background: #f3f4f6;
  color: #374151;
}

.video-uploader__btn--secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.video-uploader__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.video-uploader__message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.video-uploader__message--error {
  background: #fef2f2;
  color: #991b1b;
}
</style>
