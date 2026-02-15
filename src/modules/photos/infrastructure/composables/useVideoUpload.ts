import { ref, computed, onUnmounted } from 'vue';
import { usePhotosStore } from '../stores';
import {
  validateVideo,
  extractPosterFrame,
  getVideoDuration,
  formatDuration,
} from '../services/videoCompressor';

const MAX_RECORDING_DURATION = 60; // segundos

/**
 * Composable: useVideoUpload
 * Gerencia upload e gravação de vídeos
 */
export function useVideoUpload() {
  const store = usePhotosStore();

  // Estado do arquivo selecionado
  const selectedFile = ref<File | null>(null);
  const previewUrl = ref<string | null>(null);
  const posterBlob = ref<Blob | null>(null);
  const posterUrl = ref<string | null>(null);
  const videoDuration = ref<number>(0);
  const validating = ref(false);
  const validationError = ref<string | null>(null);

  // Estado de gravação
  const isRecording = ref(false);
  const recordingDuration = ref(0);
  const recordedBlob = ref<Blob | null>(null);
  const mediaRecorder = ref<MediaRecorder | null>(null);
  const mediaStream = ref<MediaStream | null>(null);
  const recordingInterval = ref<ReturnType<typeof setInterval> | null>(null);

  // Estado de upload
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const uploadError = ref<string | null>(null);

  // Computed
  const canRecord = computed(() => {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  });

  const recordingTimeFormatted = computed(() => {
    return formatDuration(recordingDuration.value);
  });

  const maxTimeFormatted = computed(() => {
    return formatDuration(MAX_RECORDING_DURATION);
  });

  const hasVideo = computed(() => {
    return !!selectedFile.value || !!recordedBlob.value;
  });

  /**
   * Valida e prepara um arquivo de vídeo para upload
   */
  async function validateVideoFile(file: File): Promise<boolean> {
    validating.value = true;
    validationError.value = null;

    try {
      const result = await validateVideo(file);

      if (!result.valid) {
        validationError.value = result.error || 'Vídeo inválido';
        return false;
      }

      // Extrai poster frame
      const poster = await extractPosterFrame(file);

      // Atualiza estados
      selectedFile.value = file;
      previewUrl.value = URL.createObjectURL(file);
      posterBlob.value = poster;
      posterUrl.value = URL.createObjectURL(poster);
      videoDuration.value = result.duration || 0;

      return true;
    } catch (error) {
      console.error('[useVideoUpload] Erro ao validar vídeo:', error);
      validationError.value = 'Erro ao processar vídeo';
      return false;
    } finally {
      validating.value = false;
    }
  }

  /**
   * Inicia a gravação de vídeo
   */
  async function startRecording(): Promise<boolean> {
    if (!canRecord.value) {
      validationError.value = 'Gravação de vídeo não suportada neste navegador';
      return false;
    }

    try {
      // Solicita acesso à câmera e microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Câmera traseira no mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      mediaStream.value = stream;

      // Configura o MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : 'video/mp4';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        recordedBlob.value = blob;
        previewUrl.value = URL.createObjectURL(blob);

        // Extrai poster
        try {
          const poster = await extractPosterFrame(blob);
          posterBlob.value = poster;
          posterUrl.value = URL.createObjectURL(poster);
          videoDuration.value = await getVideoDuration(blob);
        } catch (error) {
          console.error('[useVideoUpload] Erro ao extrair poster:', error);
        }

        // Para a stream
        stopStream();
      };

      mediaRecorder.value = recorder;
      recorder.start(1000); // Coleta dados a cada segundo

      isRecording.value = true;
      recordingDuration.value = 0;

      // Inicia contador de tempo
      recordingInterval.value = setInterval(() => {
        recordingDuration.value++;

        // Auto-stop aos 60 segundos
        if (recordingDuration.value >= MAX_RECORDING_DURATION) {
          stopRecording();
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('[useVideoUpload] Erro ao iniciar gravação:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        validationError.value = 'Permissão para câmera negada';
      } else {
        validationError.value = 'Erro ao acessar câmera';
      }
      return false;
    }
  }

  /**
   * Para a gravação de vídeo
   */
  function stopRecording(): void {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop();
      isRecording.value = false;

      if (recordingInterval.value) {
        clearInterval(recordingInterval.value);
        recordingInterval.value = null;
      }
    }
  }

  /**
   * Para a stream de vídeo
   */
  function stopStream(): void {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop());
      mediaStream.value = null;
    }
  }

  /**
   * Cancela gravação em andamento
   */
  function cancelRecording(): void {
    if (isRecording.value) {
      if (mediaRecorder.value) {
        mediaRecorder.value.stop();
      }
      isRecording.value = false;
    }

    if (recordingInterval.value) {
      clearInterval(recordingInterval.value);
      recordingInterval.value = null;
    }

    stopStream();
    recordingDuration.value = 0;
    recordedBlob.value = null;
  }

  /**
   * Faz upload do vídeo (gravado ou selecionado)
   */
  async function uploadVideo(caption?: string): Promise<boolean> {
    const videoToUpload = recordedBlob.value || selectedFile.value;
    if (!videoToUpload) {
      uploadError.value = 'Nenhum vídeo para enviar';
      return false;
    }

    if (!posterBlob.value) {
      uploadError.value = 'Poster não gerado';
      return false;
    }

    uploading.value = true;
    uploadProgress.value = 0;
    uploadError.value = null;

    try {
      const file =
        videoToUpload instanceof File
          ? videoToUpload
          : new File([videoToUpload], `video_${Date.now()}.webm`, { type: videoToUpload.type });

      const success = await store.uploadMedia(file, caption, {
        media_type: 'video',
        duration: videoDuration.value,
        posterBlob: posterBlob.value,
      });

      if (success) {
        clearVideo();
      }

      return success;
    } catch (error) {
      console.error('[useVideoUpload] Erro ao fazer upload:', error);
      uploadError.value = 'Erro ao enviar vídeo';
      return false;
    } finally {
      uploading.value = false;
    }
  }

  /**
   * Limpa o vídeo atual
   */
  function clearVideo(): void {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    if (posterUrl.value) {
      URL.revokeObjectURL(posterUrl.value);
    }

    selectedFile.value = null;
    previewUrl.value = null;
    posterBlob.value = null;
    posterUrl.value = null;
    recordedBlob.value = null;
    videoDuration.value = 0;
    validationError.value = null;
    uploadError.value = null;
  }

  /**
   * Retorna a stream de vídeo para preview
   */
  function getMediaStream(): MediaStream | null {
    return mediaStream.value;
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cancelRecording();
    clearVideo();
  });

  return {
    // Estado do arquivo
    selectedFile,
    previewUrl,
    posterUrl,
    videoDuration,
    validating,
    validationError,

    // Estado de gravação
    isRecording,
    recordingDuration,
    recordedBlob,

    // Estado de upload
    uploading,
    uploadProgress,
    uploadError,

    // Computed
    canRecord,
    recordingTimeFormatted,
    maxTimeFormatted,
    hasVideo,

    // Métodos
    validateVideoFile,
    startRecording,
    stopRecording,
    cancelRecording,
    uploadVideo,
    clearVideo,
    getMediaStream,
  };
}
