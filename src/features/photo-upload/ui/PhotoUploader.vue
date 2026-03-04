<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePhotoUpload } from '../model/usePhotoUpload';
import { usePhotosStore } from '@/features/photo-state';
import UploadProgress from './UploadProgress.vue';

interface FileItem {
  file: File;
  previewUrl: string;
}

const store = usePhotosStore();
const { compressing, compressionProgress, clearPreview, uploadWithCompression, validateFile } =
  usePhotoUpload();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<FileItem[]>([]);
const caption = ref('');
const error = ref('');
const success = ref(false);
const isDragging = ref(false);
const uploading = ref(false);
const uploadCurrent = ref(0);
const uploadTotal = ref(0);

const hasFiles = computed(() => selectedFiles.value.length > 0);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const processFiles = (files: FileList | File[]) => {
  error.value = '';
  success.value = false;

  const remaining = store.remainingUploads - selectedFiles.value.length;
  if (remaining <= 0) {
    error.value = 'Limite de fotos atingido';
    return;
  }

  const filesToAdd = Array.from(files).slice(0, remaining);
  const errors: string[] = [];

  for (const file of filesToAdd) {
    const validation = validateFile(file);
    if (!validation.valid) {
      errors.push(`${file.name}: ${validation.error}`);
      continue;
    }

    selectedFiles.value.push({
      file,
      previewUrl: URL.createObjectURL(file),
    });
  }

  if (errors.length > 0) {
    error.value = errors.join('\n');
  }
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  processFiles(input.files);
  input.value = '';
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;

  const files = event.dataTransfer?.files;
  if (!files?.length) return;
  processFiles(files);
};

const removeFile = (index: number) => {
  const item = selectedFiles.value[index];
  URL.revokeObjectURL(item.previewUrl);
  selectedFiles.value.splice(index, 1);
};

const handleUpload = async () => {
  if (selectedFiles.value.length === 0) {
    error.value = 'Nenhum arquivo selecionado';
    return;
  }

  error.value = '';
  uploading.value = true;
  uploadTotal.value = selectedFiles.value.length;
  uploadCurrent.value = 0;

  const filesToUpload = [...selectedFiles.value];
  let successCount = 0;
  const errors: string[] = [];

  for (const item of filesToUpload) {
    uploadCurrent.value++;
    const uploaded = await uploadWithCompression(item.file, caption.value);

    if (uploaded) {
      successCount++;
    } else {
      errors.push(item.file.name);
    }
  }

  uploading.value = false;

  if (successCount > 0) {
    success.value = true;
    caption.value = '';
    for (const item of selectedFiles.value) {
      URL.revokeObjectURL(item.previewUrl);
    }
    selectedFiles.value = [];
    setTimeout(() => {
      success.value = false;
    }, 3000);
  }

  if (errors.length > 0) {
    error.value = `Erro ao enviar: ${errors.join(', ')}`;
  }
};

const handleCancel = () => {
  clearPreview();
  caption.value = '';
  error.value = '';
  for (const item of selectedFiles.value) {
    URL.revokeObjectURL(item.previewUrl);
  }
  selectedFiles.value = [];
};
</script>

<template>
  <div class="photo-uploader">
    <div
      v-if="!uploading"
      class="photo-uploader__dropzone"
      :class="{ 'photo-uploader__dropzone--dragging': isDragging }"
      @click="triggerFileInput"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        class="photo-uploader__input"
        @change="handleFileSelect"
      />

      <div class="photo-uploader__icon">📷</div>
      <p class="photo-uploader__text">
        {{ isDragging ? 'Solte as fotos aqui' : 'Toque ou arraste fotos aqui' }}
      </p>
      <p class="photo-uploader__hint">{{ store.remainingUploads }} fotos restantes</p>
    </div>

    <div
      v-if="hasFiles && !uploading"
      class="photo-uploader__grid"
    >
      <div
        v-for="(item, index) in selectedFiles"
        :key="index"
        class="photo-uploader__thumb"
      >
        <img
          :src="item.previewUrl"
          alt="Preview"
          class="photo-uploader__thumb-img"
        />
        <button
          type="button"
          class="photo-uploader__thumb-remove"
          @click.stop="removeFile(index)"
        >
          &times;
        </button>
      </div>
    </div>

    <div
      v-if="uploading"
      class="photo-uploader__uploading"
    >
      <UploadProgress
        :progress="compressing ? compressionProgress : store.uploadProgress"
        :status="compressing ? 'compressing' : 'uploading'"
      />
      <p class="photo-uploader__uploading-count">
        Enviando {{ uploadCurrent }} de {{ uploadTotal }}
      </p>
    </div>

    <div
      v-if="hasFiles && !uploading"
      class="photo-uploader__form"
    >
      <p class="photo-uploader__count">
        {{ selectedFiles.length }} foto{{ selectedFiles.length > 1 ? 's' : '' }} selecionada{{
          selectedFiles.length > 1 ? 's' : ''
        }}
      </p>

      <textarea
        v-model="caption"
        class="photo-uploader__caption"
        placeholder="Adicione uma legenda (opcional)"
        maxlength="200"
        rows="2"
      ></textarea>

      <div class="photo-uploader__actions">
        <button
          type="button"
          class="photo-uploader__btn photo-uploader__btn--cancel"
          @click="handleCancel"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="photo-uploader__btn photo-uploader__btn--upload"
          :disabled="!store.canUploadMore"
          @click="handleUpload"
        >
          Enviar {{ selectedFiles.length }} foto{{ selectedFiles.length > 1 ? 's' : '' }}
        </button>
      </div>
    </div>

    <p
      v-if="error"
      class="photo-uploader__error"
    >
      {{ error }}
    </p>
    <p
      v-if="success"
      class="photo-uploader__success"
    >
      Fotos enviadas com sucesso!
    </p>

    <p class="photo-uploader__moderation">
      {{ store.moderationStatus }}
    </p>
  </div>
</template>

<style scoped>
.photo-uploader {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.photo-uploader__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  border: 2px dashed #d4a574;
  border-radius: 1rem;
  background: #fefdfb;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-uploader__dropzone:hover {
  background: #faf4e8;
  border-color: #c49a6c;
}

.photo-uploader__dropzone--dragging {
  background: #faf4e8;
  border-color: #c49a6c;
  border-style: solid;
  transform: scale(1.02);
}

.photo-uploader__input {
  display: none;
}

.photo-uploader__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.photo-uploader__text {
  font-size: 1rem;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.photo-uploader__hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.photo-uploader__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}

.photo-uploader__thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
}

.photo-uploader__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-uploader__thumb-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.photo-uploader__thumb-remove:hover {
  background: rgba(0, 0, 0, 0.8);
}

.photo-uploader__uploading {
  margin-top: 1rem;
  text-align: center;
}

.photo-uploader__uploading-count {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.photo-uploader__count {
  font-size: 0.875rem;
  color: #374151;
  margin: 0 0 0.75rem 0;
  text-align: center;
}

.photo-uploader__form {
  margin-top: 1rem;
}

.photo-uploader__caption {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: none;
  font-family: inherit;
}

.photo-uploader__caption:focus {
  outline: none;
  border-color: #d4a574;
}

.photo-uploader__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.photo-uploader__btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-uploader__btn--cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.photo-uploader__btn--cancel:hover {
  background: #e5e7eb;
}

.photo-uploader__btn--upload {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
}

.photo-uploader__btn--upload:hover:not(:disabled) {
  opacity: 0.9;
}

.photo-uploader__btn--upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-uploader__error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.photo-uploader__success {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.photo-uploader__moderation {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
}
</style>
