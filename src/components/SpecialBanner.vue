<script setup>
import { useBannerStore } from '../stores/banner.js';

const bannerStore = useBannerStore();
</script>

<template>
  <div v-if="bannerStore.isVisible" class="special-banner d-flex justify-content-center align-items-center px-3 py-2 text-center">
    <span class="me-3 fw-bold">UniHelp wurde als "Beste Nachhilfe-Plattform 2026" ausgezeichnet!</span>
    <button @click="bannerStore.hideBanner" class="btn btn-sm btn-outline-light rounded-pill px-3 mt-2 mt-md-0">Schließen</button>
  </div>
</template>

<style scoped>
.special-banner {
  background-color: #09295a; 
  color: white;
  font-size: 14px;
}

@media (max-width: 767px) {
  .special-banner {
    flex-direction: column;
    font-size: 18px;
  }
}
</style>
