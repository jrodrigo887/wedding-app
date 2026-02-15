<script setup lang="ts">
import { ref } from 'vue';
import type { PhotoComment } from '@/entities/comment';
import { CommentItem } from '@/entities/comment';

/**
 * Component: CommentSection
 * Seção de comentários com input
 */

interface Props {
  comments: PhotoComment[];
  currentUserCode?: string | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  (e: 'add', texto: string): void;
  (e: 'delete', id: number): void;
}>();

const newComment = ref('');
const submitting = ref(false);

const handleSubmit = async () => {
  const texto = newComment.value.trim();
  if (!texto || submitting.value) return;

  submitting.value = true;
  emit('add', texto);
  newComment.value = '';
  submitting.value = false;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
};
</script>

<template>
  <div class="comment-section">
    <div
      v-if="loading"
      class="comment-section__loading"
    >
      Carregando comentários...
    </div>

    <div
      v-else-if="comments.length === 0"
      class="comment-section__empty"
    >
      Nenhum comentário ainda
    </div>

    <div
      v-else
      class="comment-section__list"
    >
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :current-user-code="currentUserCode"
        @delete="emit('delete', $event)"
      />
    </div>

    <form
      class="comment-section__form"
      @submit.prevent="handleSubmit"
    >
      <input
        v-model="newComment"
        type="text"
        class="comment-section__input"
        placeholder="Escreva um comentário..."
        maxlength="500"
        :disabled="!currentUserCode || submitting"
        @keydown="handleKeydown"
      />
      <button
        type="submit"
        class="comment-section__submit"
        :disabled="!newComment.trim() || !currentUserCode || submitting"
      >
        Enviar
      </button>
    </form>
  </div>
</template>

<style scoped>
.comment-section {
  padding: 1rem;
  background: #fafafa;
  border-radius: 0.5rem;
}

.comment-section__loading,
.comment-section__empty {
  text-align: center;
  padding: 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.comment-section__list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.comment-section__form {
  display: flex;
  gap: 0.5rem;
}

.comment-section__input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.comment-section__input:focus {
  border-color: #d4a574;
}

.comment-section__input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.comment-section__submit {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.comment-section__submit:hover:not(:disabled) {
  opacity: 0.9;
}

.comment-section__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
