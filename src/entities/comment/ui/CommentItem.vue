<script setup lang="ts">
import { computed } from 'vue';
import type { PhotoComment } from '@/entities/comment';

interface Props {
  comment: PhotoComment;
  currentUserCode?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'delete', id: number): void;
}>();

const isOwnComment = computed(() => {
  return props.currentUserCode === props.comment.codigo_convidado;
});

const timeAgo = computed(() => {
  if (!props.comment.created_at) return '';

  const date = new Date(props.comment.created_at);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
});
</script>

<template>
  <div class="comment-item">
    <div class="comment-item__header">
      <span class="comment-item__author">{{ comment.nome_convidado }}</span>
      <span class="comment-item__time">{{ timeAgo }}</span>
    </div>
    <p class="comment-item__text">{{ comment.texto }}</p>
    <button
      v-if="isOwnComment"
      class="comment-item__delete"
      @click="emit('delete', comment.id!)"
      type="button"
    >
      Excluir
    </button>
  </div>
</template>

<style scoped>
.comment-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.comment-item__author {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.comment-item__time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.comment-item__text {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
  line-height: 1.4;
}

.comment-item__delete {
  margin-top: 0.5rem;
  padding: 0;
  border: none;
  background: none;
  font-size: 0.75rem;
  color: #ef4444;
  cursor: pointer;
}

.comment-item__delete:hover {
  text-decoration: underline;
}
</style>
