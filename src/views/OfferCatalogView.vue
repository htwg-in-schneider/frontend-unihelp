<script setup>
import { ref, onMounted } from 'vue';
import OfferCard from '../components/OfferCard.vue';

const url = 'http://localhost:8081/api/offer';
const offers = ref([]);

onMounted(async () => fetchOffers());

async function fetchOffers() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    offers.value = await response.json();
    console.log("Erfolgreich vom lokalen Backend geladen:", offers.value);
  } catch (error) {
    console.error('Fehler beim Laden der Angebote:', error);
  }
}
</script>

<template>
  <div class="offer-catalog-view" style="border-top: 1px solid #e0dcd5;">
    <div class="container py-4 content-wrapper-desktop">

      <div class="search-section mb-4 mt-2 px-1">
        <div class="text-start mb-4">
          <h2 class="fw-bold text-dark mb-1">Nachhilfeangebote</h2>
          <p class="text-muted fs-6 mb-0">Finde die passende Nachhilfe an deiner Hochschule.</p>
        </div>
      </div>

      <div v-if="offers.length === 0" class="text-center py-5">
        <p class="text-muted">Angebote werden geladen...</p>
      </div>

      <div class="row offers-grid px-1">
        <div v-for="offer in offers" :key="offer.id" class="col-lg-4 col-md-6 mb-3">
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
