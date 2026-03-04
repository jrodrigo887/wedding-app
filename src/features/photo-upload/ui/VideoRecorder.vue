<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';
import { useVideoUpload } from '../model/useVideoUpload';
import { usePhotosStore } from '@/features/photo-state';
import UploadProgress from './UploadProgress.vue';

const emit = defineEmits<{
  (e: 'uploaded'): void;
}>();

const store = usePhotosStore();
const {
  isRecording,
  recordingDuration,
  recordingTimeFormatted,
  maxTimeFormatted,
  previewUrl,
  posterUrl,
  videoDuration,
  uploading,
  validationError,
  uploadError,
  canRecord,
  hasVideo,
  startRecording,
  stopRecording,
  cancelRecording,
  uploadVideo,
  clearVideo,
  getMediaStream,
} = useVideoUpload();

const videoPreviewRef = ref<HTMLVideoElement | null>(null);
const caption = ref('');
const cameraActive = ref(false);

watch(isRecording, recording => {
  if (recording && videoPreviewRef.value) {
    const stream = getMediaStream();
    if (stream) {
      videoPreviewRef.value.srcObject = stream;
      videoPreviewRef.value.play();
    }
  } else if (!recording && videoPreviewRef.value) {
    videoPreviewRef.value.srcObject = null;
  }
});

const handleStartRecording = async () => {
  cameraActive.value = true;
  const started = await startRecording();
  if (!started) {
    cameraActive.value = false;
  }
};

const handleStopRecording = () => {
  stopRecording();
  cameraActive.value = false;
};

const handleCancelRecording = () => {
  cancelRecording();
  cameraActive.value = false;
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

const timePercentage = () => {
  return (recordingDuration.value / 60) * 100;
};

onUnmounted(() => {
  if (isRecording.value) {
    cancelRecording();
  }
});
</script>

<template>
  <div class="video-recorder">
    <div
      v-if="!canRecord"
      class="video-recorder__error"
    >
      <span class="video-recorder__error-icon">!</span>
      <p>Seu navegador não suporta gravação de vídeo.</p>
      <p class="video-recorder__error-hint">Tente usar o Chrome, Firefox ou Safari mais recente.</p>
    </div>

    <template v-else>
      <div
        v-if="cameraActive || isRecording"
        class="video-recorder__camera"
      >
        <video
          ref="videoPreviewRef"
          class="video-recorder__video"
          autoplay
          muted
          playsinline
        ></video>

        <div
          v-if="isRecording"
          class="video-recorder__overlay"
        >
          <div class="video-recorder__timer">
            <span class="video-recorder__timer-dot"></span>
            <span>{{ recordingTimeFormatted }} / {{ maxTimeFormatted }}</span>
          </div>
          <div class="video-recorder__progress-bar">
            <div
              class="video-recorder__progress-fill"
              :style="{ width: `${timePercentage()}%` }"
            ></div>
          </div>
        </div>

        <div class="video-recorder__controls">
          <button
            v-if="isRecording"
            class="video-recorder__stop-btn"
            @click="handleStopRecording"
          >
            <span class="video-recorder__stop-icon"></span>
            Parar
          </button>
          <button
            v-else
            class="video-recorder__cancel-btn"
            @click="handleCancelRecording"
          >
            Cancelar
          </button>
        </div>
      </div>

      <div
        v-else-if="hasVideo && previewUrl"
        class="video-recorder__preview"
      >
        <video
          :src="previewUrl"
          :poster="posterUrl || undefined"
          class="video-recorder__video"
          controls
          playsinline
        ></video>

        <div class="video-recorder__info">
          <span>Duração: {{ Math.floor(videoDuration) }}s</span>
        </div>

        <div class="video-recorder__form">
          <textarea
            v-model="caption"
            class="video-recorder__caption"
            placeholder="Adicione uma legenda (opcional)"
            rows="2"
            maxlength="500"
          ></textarea>

          <div class="video-recorder__form-actions">
            <button
              class="video-recorder__btn video-recorder__btn--secondary"
              :disabled="uploading"
              @click="handleDiscard"
            >
              Descartar
            </button>
            <button
              class="video-recorder__btn video-recorder__btn--primary"
              :disabled="uploading || !store.canUploadMoreVideos"
              @click="handleUpload"
            >
              {{ uploading ? 'Enviando...' : 'Enviar Vídeo' }}
            </button>
          </div>
        </div>

        <UploadProgress
          v-if="uploading"
          :progress="100"
          status="uploading"
        />
      </div>

      <div
        v-else
        class="video-recorder__start"
      >
        <button
          class="video-recorder__record-btn"
          :disabled="!store.canUploadMoreVideos"
          @click="handleStartRecording"
        >
          <span class="video-recorder__record-icon"></span>
          Gravar Vídeo
        </button>
        <p class="video-recorder__hint">Máximo: 1 minuto</p>
        <p class="video-recorder__limit">{{ store.currentGuestVideoCount }}/5 vídeos enviados</p>
      </div>

      <p
        v-if="validationError"
        class="video-recorder__message video-recorder__message--error"
      >
        {{ validationError }}
      </p>
      <p
        v-if="uploadError"
        class="video-recorder__message video-recorder__message--error"
      >
        {{ uploadError }}
      </p>
    </template>
  </div>
</template>

<style scoped>
.video-recorder { width: 100%; }
.video-recorder__error { text-align: center; padding: 2rem; background: #fef2f2; border-radius: 0.75rem; color: #991b1b; }
.video-recorder__error-icon { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #fee2e2; border-radius: 50%; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
.video-recorder__error-hint { font-size: 0.875rem; color: #b91c1c; margin-top: 0.5rem; }
.video-recorder__camera, .video-recorder__preview { position: relative; border-radius: 0.75rem; overflow: hidden; background: #000; }
.video-recorder__video { width: 100%; max-height: 400px; object-fit: cover; display: block; }
.video-recorder__overlay { position: absolute; top: 0; left: 0; right: 0; padding: 1rem; background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%); }
.video-recorder__timer { display: flex; align-items: center; gap: 0.5rem; color: white; font-size: 1rem; font-weight: 500; }
.video-recorder__timer-dot { width: 12px; height: 12px; background: #ef4444; border-radius: 50%; animation: pulse-dot 1s infinite; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.video-recorder__progress-bar { margin-top: 0.5rem; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden; }
.video-recorder__progress-fill { height: 100%; background: #ef4444; transition: width 1s linear; }
.video-recorder__controls { position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); }
.video-recorder__stop-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #ef4444; color: white; border: none; border-radius: 9999px; font-size: 1rem; font-weight: 500; cursor: pointer; }
.video-recorder__stop-btn:hover { background: #dc2626; }
.video-recorder__stop-icon { width: 16px; height: 16px; background: white; border-radius: 2px; }
.video-recorder__cancel-btn { padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 9999px; font-size: 1rem; cursor: pointer; }
.video-recorder__cancel-btn:hover { background: rgba(255,255,255,0.3); }
.video-recorder__info { padding: 0.75rem 1rem; background: #f9fafb; font-size: 0.875rem; color: #6b7280; }
.video-recorder__form { padding: 1rem; background: white; }
.video-recorder__caption { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; font-size: 0.875rem; resize: none; font-family: inherit; }
.video-recorder__caption:focus { outline: none; border-color: #d4a574; }
.video-recorder__form-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
.video-recorder__btn { flex: 1; padding: 0.75rem 1rem; border: none; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.video-recorder__btn--primary { background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%); color: white; }
.video-recorder__btn--primary:hover:not(:disabled) { opacity: 0.9; }
.video-recorder__btn--secondary { background: #f3f4f6; color: #374151; }
.video-recorder__btn--secondary:hover:not(:disabled) { background: #e5e7eb; }
.video-recorder__btn:disabled { opacity: 0.5; cursor: not-allowed; }
.video-recorder__start { text-align: center; padding: 3rem 2rem; background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 0.75rem; }
.video-recorder__record-btn { display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; border-radius: 9999px; font-size: 1.125rem; font-weight: 500; cursor: pointer; }
.video-recorder__record-btn:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 4px 12px rgba(239,68,68,0.3); }
.video-recorder__record-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.video-recorder__record-icon { width: 20px; height: 20px; background: white; border-radius: 50%; }
.video-recorder__hint { margin: 1rem 0 0.5rem 0; font-size: 0.875rem; color: #6b7280; }
.video-recorder__limit { margin: 0; font-size: 0.75rem; color: #9ca3af; }
.video-recorder__message { margin-top: 1rem; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; text-align: center; }
.video-recorder__message--error { background: #fef2f2; color: #991b1b; }
</style>
