<script setup>
import { ref } from 'vue';
import { offers } from './data.js';

import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import OfferCard from './components/OfferCard.vue';

const activeDescription = ref("");

function getOffers() {
  return offers;
}

function showDetails(description) {
  activeDescription.value = description;
}

function closeDetails() {
  activeDescription.value = "";
}
</script>

<template>
  <div class="app-layout is-offer-page" style="background-color: #f7f4ed; min-height: 100vh;">
    
    <Navbar />

    <main class="main-content profile-view">
      <div class="container py-4 content-wrapper-desktop">

        <div class="search-section mb-4 mt-2 px-1">
          <div class="text-start mb-4">
            <h2 class="fw-bold text-dark mb-1">Nachhilfeangebote</h2>
            <p class="text-muted fs-6 mb-0">Finde die passende Nachhilfe an deiner Hochschule.</p>
          </div>
        </div>

        <div v-if="activeDescription" class="mb-4 mx-1 p-3 rounded d-flex justify-content-between align-items-center" style="background-color: #fff3cd; border: 1px solid #ffe69c;">
          <p class="mb-0 text-dark" style="font-size: 15px;"><strong>Beschreibung zum Angebot:</strong><br>{{ activeDescription }}</p>
          <button @click="closeDetails" class="btn btn-dark btn-sm ms-3">Schließen</button>
        </div>

        <div class="row offers-grid px-1">
          <div v-for="offer in getOffers()" :key="offer.id" class="col-lg-4 col-md-6 mb-3">
            <OfferCard :offer="offer" @showDetails="showDetails" />
          </div>
        </div>

      </div>
    </main>

    <Footer />

  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.main-content {
  flex: 1;
  padding-bottom: 0; 
}

.content-wrapper-desktop {
  max-width: 850px;
  margin: 0 auto;
}
</style>