export { default as MediaUploader } from './ui/MediaUploader.vue';
export { default as PhotoUploader } from './ui/PhotoUploader.vue';
export { default as VideoUploader } from './ui/VideoUploader.vue';
export { default as VideoRecorder } from './ui/VideoRecorder.vue';
export { default as UploadProgress } from './ui/UploadProgress.vue';

export { usePhotoUpload } from './model/usePhotoUpload';
export { useVideoUpload } from './model/useVideoUpload';

export { compressImage, formatFileSize, type CompressedResult } from './api/imageCompressor';
export {
  videoCompressor,
  validateVideo,
  extractPosterFrame,
  getVideoDuration,
  formatDuration,
  type VideoValidationResult,
} from './api/videoCompressor';
export { storageService } from '@shared/api/storageService';
export {
  downloadSinglePhoto,
  downloadPhotosAsZip,
  type DownloadProgress,
} from './api/downloadService';
