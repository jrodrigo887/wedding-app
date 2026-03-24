<template>
  <div class="rsvp-card">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * Component: RsvpCard
 * Card container reutilizável para o fluxo RSVP
 */
</script>

<style scoped>
.rsvp-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

@media (max-width: 480px) {
  .rsvp-card {
    padding: 1.5rem;
  }
}
</style>
