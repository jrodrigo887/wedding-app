<template>
  <div class="photo-gallery">
    <PhotoFeed @view="selectedPhoto = $event" />
    <PhotoModal
      :photo="selectedPhoto"
      @close="selectedPhoto = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PhotoFeed, PhotoModal } from '@/features/photo-interactions';
import type { Photo } from '@/entities/photo';

/**
 * Widget: PhotoGallery
 * Orquestra PhotoFeed + PhotoModal
 */

const selectedPhoto = ref<Photo | null>(null);
</script>

<style scoped>
.photo-gallery {
  width: 100%;
}
</style>
