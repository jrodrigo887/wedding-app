<script setup lang="ts">
interface Props {
  progress: number;
  status: 'compressing' | 'uploading' | 'done';
}

defineProps<Props>();

const getStatusText = (status: string): string => {
  switch (status) {
    case 'compressing':
      return 'Comprimindo imagem...';
    case 'uploading':
      return 'Enviando foto...';
    case 'done':
      return 'Concluído!';
    default:
      return 'Processando...';
  }
};
</script>

<template>
  <div class="upload-progress">
    <div class="upload-progress__bar">
      <div
        class="upload-progress__fill"
        :class="{ 'upload-progress__fill--done': status === 'done' }"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
    <div class="upload-progress__info">
      <span class="upload-progress__status">{{ getStatusText(status) }}</span>
      <span class="upload-progress__percent">{{ progress }}%</span>
    </div>
  </div>
</template>

<style scoped>
.upload-progress {
  width: 100%;
  padding: 1rem;
}

.upload-progress__bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.upload-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #d4a574 0%, #c49a6c 100%);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.upload-progress__fill--done {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.upload-progress__info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.upload-progress__status {
  color: #6b7280;
}

.upload-progress__percent {
  color: #374151;
  font-weight: 500;
}
</style>
