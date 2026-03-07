<template>
  <div
    id="app"
    :data-theme="isDarkMode ? 'dark' : 'light'"
  >
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@shared/utils';

const { isDarkMode } = useTheme();
</script>

<style scoped>
#app {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  transition:
    background-color var(--transition-normal) ease,
    color var(--transition-normal) ease;
}
</style>
