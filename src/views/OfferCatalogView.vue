<script setup>
import { offers } from '../data.js';
import OfferCard from '../components/OfferCard.vue';

function getOffers() {
  return offers;
}
</script>

<template>
  <div class="profile-view">
    <div class="container py-4 content-wrapper-desktop">

      <div class="search-section mb-4 mt-2 px-1">
        <div class="text-start mb-4">
          <h2 class="fw-bold text-dark mb-1">Nachhilfeangebote</h2>
          <p class="text-muted fs-6 mb-0">Finde die passende Nachhilfe an deiner Hochschule.</p>
        </div>
      </div>

      <div class="row offers-grid px-1">
        <div v-for="offer in getOffers()" :key="offer.id" class="col-lg-4 col-md-6 mb-3">
          <OfferCard :offer="offer" />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.content-wrapper-desktop {
  max-width: 850px;
  margin: 0 auto;
}
</style>
