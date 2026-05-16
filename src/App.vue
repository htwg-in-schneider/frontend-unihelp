<script setup>
import { ref } from 'vue';
import { offers } from './data.js';

const isMenuOpen = ref(false);
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };
const closeMenu = () => { isMenuOpen.value = false; };

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
    
    <nav class="navbar navbar-expand-md px-4 py-3 global-navbar" style="background-color: #f7f4ed;">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold fs-4 text-dark text-decoration-none" href="#" @click="closeMenu">UniHelp</a>

        <button class="navbar-toggler border-0" type="button" @click="toggleMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse justify-content-end" :class="{ 'show': isMenuOpen }">
          <ul class="navbar-nav align-items-center text-center mt-3 mt-md-0 gap-2 ms-auto">
            <li class="nav-item">
              <a class="nav-link py-2" href="#" @click="closeMenu">Angebote</a>
            </li>
            <li class="nav-item">
              <a class="nav-link py-2" href="/#steps" @click="closeMenu">Ablauf</a>
            </li>
            <li class="nav-item">
              <a class="nav-link py-2" href="/#for-students" @click="closeMenu">Für Studenten</a>
            </li>
            <li class="nav-item">
              <a class="nav-link py-2" href="/#for-tutors" @click="closeMenu">Tutor werden</a>
            </li>
            <li class="nav-item mt-3 mt-md-0 px-3 px-md-0">
              <button class="btn btn-outline-dark w-100 px-4" @click="closeMenu">Anmelden</button>
            </li>
            <li class="nav-item mb-2 mb-md-0 px-3 px-md-0">
              <button class="btn btn-warning w-100 fw-bold px-4" @click="closeMenu">Registrieren</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

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
            <div class="card offer-card h-100 text-start">
              <div class="card-body p-3 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-1 flex-grow-1">
                  <div>
                    <h5 class="fw-bold mb-0 text-dark" style="font-size: 16px;">{{ offer.module }}</h5>
                    <p class="text-muted small mt-1 mb-1">{{ offer.course }} ({{ offer.university }})</p>
                  </div>
                </div>
                
                <div>
                  <p class="mb-3 fw-bold text-dark" style="font-size: 15px;">{{ offer.price }} €/Std.</p>
                  <div class="mt-auto d-flex flex-column gap-2">
                    <button @click="showDetails(offer.description)" class="btn-yellow-solid w-100">Details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <footer class="site-footer border-top py-4 mt-auto" style="background-color: #f7f4ed;">
      <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div class="fw-bold fs-5 mb-2 mb-md-0 text-dark">UniHelp 2026</div>
        
        <div class="text-dark">
          <a href="#" class="text-decoration-none text-dark opacity-75">Impressum</a>
          <a href="#" class="text-decoration-none text-dark opacity-75">Datenschutz</a>
          <a href="#" class="text-decoration-none text-dark opacity-75">Kontakt</a>
        </div>
      </div>
    </footer>

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

.offer-card {
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  background-color: #fff;
  transition: transform 0.2s, opacity 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.btn-yellow-solid {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  color: white;
  background-color: #d4a218;
  transition: opacity 0.2s;
}

.btn-yellow-solid:hover {
  opacity: 0.7;
}

@media (max-width: 767px) {
  .navbar-collapse {
    background-color: #f7f4ed;
    border-top: 1px solid #e0dcd5;
    padding-top: 15px;
    padding-bottom: 15px;
  }
}
</style>
