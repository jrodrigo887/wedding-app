<script setup lang="ts">
import type { Photo } from '../model/types';
import PhotoCard from './PhotoCard.vue';
import VideoCard from './VideoCard.vue';

interface Props {
  photo: Photo;
  currentUserCode?: string | null;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'like', id: number): void;
  (e: 'view', photo: Photo): void;
}>();
</script>

<template>
  <VideoCard
    v-if="photo.media_type === 'video'"
    :photo="photo"
    :current-user-code="currentUserCode"
    @like="emit('like', $event)"
    @view="emit('view', $event)"
  />
  <PhotoCard
    v-else
    :photo="photo"
    :current-user-code="currentUserCode"
    @like="emit('like', $event)"
    @view="emit('view', $event)"
  />
</template>
