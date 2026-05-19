<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const url = 'http://localhost:8081/api/offer';

const offer = ref(null);
const isLoading = ref(true);

onMounted(async () => fetchOffer());

async function fetchOffer() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const allOffers = await response.json();
    offer.value = allOffers.find(o => String(o.id) === String(route.params.id)) || null;
  } catch (error) {
    console.error('Fehler beim Laden des Angebots:', error);
  } finally {
    isLoading.value = false;
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}`;
}

async function toggleBooking(avail) {
  const oldState = avail.booked;
  avail.booked = !avail.booked;

  try {
    const response = await fetch(`${url}/${offer.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer.value),
    });

    if (!response.ok) {
      throw new Error('Fehler beim Speichern im Backend');
    }
  } catch (error) {
    console.error('Netzwerkfehler:', error);
    avail.booked = oldState;
  }
}
</script>

<template>
  <div class="container py-4 content-wrapper-desktop">

    <div v-if="isLoading" class="text-center py-5">
      <p class="text-muted">Angebot wird geladen...</p>
    </div>

    <div v-else-if="offer" class="text-start mobile-card desktop-card">

      <div class="d-flex align-items-center mb-4">
        <div class="profile-avatar-large me-3">NL</div>
        <div>
          <h2 class="h4 mb-1 fw-bold text-dark">Natascha Lang</h2>
          <p class="mb-1 text-muted fw-bold" style="font-size: 14px;">
            {{ offer.course }}, {{ offer.university }}
          </p>
          <p class="mb-0 text-warning" style="font-size: 14px;">
            ★★★★★ <span class="text-dark fw-bold ms-1">4,9</span> <span class="text-muted">(62 Bew.)</span>
          </p>
        </div>
      </div>

      <div class="modul-box mb-4 p-3 bg-white">
        <div class="yellow-label mb-1">MODUL</div>
        <div class="fw-bold fs-5 text-dark">{{ offer.module }}</div>
        <div class="text-muted small mt-1">{{ offer.course }}</div>
      </div>

      <div class="mb-4">
        <div class="yellow-label mb-1">BESCHREIBUNG</div>
        <p class="lh-sm fs-6 text-dark">{{ offer.description }}</p>
      </div>

      <div class="mb-4">
        <div class="yellow-label mb-1">VERFÜGBARKEIT</div>
        <div class="fw-bold text-dark mb-3">Unterrichtsformat: {{ offer.format }}</div>

        <div v-if="offer.availabilities && offer.availabilities.length > 0">
          <ul class="list-unstyled mb-0">
            <li v-for="avail in offer.availabilities" :key="avail.id"
              class="mb-2 p-2 border rounded d-flex justify-content-between align-items-center"
              :class="{ 'bg-light': avail.booked }">

              <div>
                <div
                  :class="{ 'text-decoration-line-through text-muted': avail.booked, 'text-dark fw-bold': !avail.booked }"
                  style="font-size: 15px;">
                  <span class="d-block d-sm-inline mb-1 mb-sm-0">📅 {{ formatDate(avail.date) }}</span>

                  <span class="d-none d-sm-inline mx-1">|</span>

                  <span class="d-block d-sm-inline">🕒 {{ avail.startTime }} - {{ avail.endTime }} Uhr</span>
                </div>

                <div class="mt-1 mt-sm-0 d-sm-inline-block ms-sm-2">
                  <span v-if="avail.booked" class="badge bg-danger" style="font-size: 11px;">Gebucht</span>
                  <span v-else class="badge bg-success" style="font-size: 11px;">Frei</span>
                </div>
              </div>

              <button @click="toggleBooking(avail)" class="btn btn-sm px-3 py-1 m-0 fw-bold ms-2 flex-shrink-0"
                :class="avail.booked ? 'btn-outline-danger' : 'btn-yellow-main text-dark'"
                style="height: auto; font-size: 13px;">
                {{ avail.booked ? 'Stornieren' : 'Buchen' }}
              </button>
            </li>
          </ul>
        </div>

        <div v-else>
          <span class="text-muted fw-bold" style="font-size: 15px;">Bisher keine Termine hinterlegt.</span>
        </div>
      </div>
      <div class="price-book-box mb-3 d-flex justify-content-between align-items-center p-3 bg-white">
        <div>
          <div class="yellow-label mb-1">PREIS</div>
          <div class="fw-bold fs-3 text-dark">{{ offer.price }} €/Std.</div>
        </div>
      </div>

      <button class="btn-message-outline w-100 mb-3 text-dark">Nachricht senden</button>

      <div class="text-center mt-2 pb-2">
        <a href="#" class="report-link">⚠ Angebot melden</a>
      </div>

    </div>

    <div v-else class="text-center py-5">
      <h3 class="mb-3 fw-bold text-dark">Angebot wurde nicht gefunden.</h3>
      <router-link to="/offers" class="btn btn-outline-dark px-4 py-2 fw-bold">Zurück zur Übersicht</router-link>
    </div>

  </div>
</template>

<style scoped>
.content-wrapper-desktop {
  margin: 0 auto;
}

.profile-avatar-large {
  width: 70px;
  height: 70px;
  flex-shrink: 0;
  background-color: #dcdcdc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.modul-box,
.price-book-box {
  border: 1px solid #cccccc;
  border-radius: 8px;
}

.yellow-label {
  color: #d4a218;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-yellow-main {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 700;
  font-size: 16px;
  background-color: #fcdb39;
  border: 1px solid #d4b82d;
  transition: background-color 0.2s;
}

.btn-yellow-main:hover {
  background-color: #f0ce2b;
}

.btn-message-outline {
  height: 44px;
  background-color: white;
  border: 1px solid #b0b0b0;
  border-radius: 6px;
  font-weight: bold;
  font-size: 15px;
  transition: background-color 0.2s;
}

.btn-message-outline:hover {
  background-color: #f0f0f0;
}

.report-link {
  color: #a81c1c;
  font-size: 13px;
  font-weight: bold;
  text-decoration: underline !important;
}

.report-link:hover {
  color: #801515;
}

@media (max-width: 767px) {
  .content-wrapper-desktop {
    max-width: 500px;
  }

  .mobile-card {
    background-color: white;
    border: 1px solid #e0dcd5;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  }
}

@media (min-width: 768px) {
  .content-wrapper-desktop {
    max-width: 700px;
    padding-top: 40px !important;
    padding-bottom: 40px !important;
  }

  .desktop-card {
    background-color: #ffffff;
    border: 1px solid #f0f0f0;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}
</style>