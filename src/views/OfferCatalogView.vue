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

      <div class="row px-1 mt-2 mb-5">
        <div class="col-12">
          <router-link to="/offer/new" class="create-offer-btn text-decoration-none">
            <div class="icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" fill="none"/>
                <path fill-rule="evenodd" d="M8 4a.75.75 0 0 1 .75.75v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5A.75.75 0 0 1 8 4z" fill="#111827"/>
              </svg>
            </div>
            <span class="btn-text">Neues Angebot erstellen</span>
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.content-wrapper-desktop {
  max-width: 1100px;
  margin: 0 auto;
}

.create-offer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
  padding: 16px;
  border: 2px dashed #b8b8b8; 
  border-radius: 16px; 
  background-color: transparent;
  transition: all 0.2s ease-in-out;
  color: #111827; 
}

.create-offer-btn:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-color: #888;
}

.icon-box {
  background-color: #d4a218; 
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none; 
}

.btn-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
</style>
