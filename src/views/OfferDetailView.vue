<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const route = useRoute();
const router = useRouter();
const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } = useAuth0();
const baseUrl = 'http://localhost:8081';

const offer = ref(null);
const reviews = ref([]);
const isLoading = ref(true);

const showBookingForm = ref(false);
const isReported = ref(false);
const isModerator = ref(false);
const showModMenu = ref(false);

const selectedDate = ref(null);
const selectedAvailabilityIndex = ref(null);
const bookingMessage = ref('');
const bookingError = ref('');

onMounted(async () => {
  await fetchOffer();
  await fetchReviews();
  if (isAuthenticated.value) {
    await checkModeratorRole();
  }
});

async function fetchOffer() {
  try {
    const response = await fetch(`${baseUrl}/api/offer`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const allOffers = await response.json();
    offer.value = allOffers.find(o => String(o.id) === String(route.params.id)) || null;
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
}

async function fetchReviews() {
  try {
    const response = await fetch(`${baseUrl}/api/offer/${route.params.id}/reviews`);
    if (response.ok) {
      reviews.value = await response.json();
    }
  } catch (error) {
    console.error("Fehler beim Laden der Bewertungen");
  }
}

const reviewCount = computed(() => reviews.value.length);
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const sum = reviews.value.reduce((acc, r) => acc + r.ratingStars, 0);
  return (sum / reviews.value.length).toFixed(1);
});

async function checkModeratorRole() {
  try {
    const token = await getAccessTokenSilently();
    const response = await fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      const profile = await response.json();
      if (profile.role === 'MODERATOR' || profile.role === 'ADMIN') {
        isModerator.value = true;
      }
    }
  } catch (e) {
  }
}

function getFormatLabel(format) {
  if (format === 'ONLINE') return 'Online';
  if (format === 'PRAESENZ') return 'Präsenz';
  if (format === 'HYBRID') return 'Online & Präsenz';
  return format;
}

function formatShortDate(dateInput) {
  if (!dateInput) return '';
  let date;
  if (Array.isArray(dateInput)) {
    date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date)) return '';

  const weekday = date.toLocaleDateString('de-DE', { weekday: 'short' });
  const day = date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${weekday}, ${day}`;
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

const groupedAvailabilities = computed(() => {
  if (!offer.value || !offer.value.availabilities) return {};
  const grouped = {};
  offer.value.availabilities.forEach((avail, index) => {
    if (!avail.booked) {
      if (!grouped[avail.date]) {
        grouped[avail.date] = [];
      }
      grouped[avail.date].push({ ...avail, originalIndex: index });
    }
  });
  return grouped;
});

const availableDates = computed(() => Object.keys(groupedAvailabilities.value).sort());

const totalFreeSlotsCount = computed(() => {
  let count = 0;
  for (const date in groupedAvailabilities.value) {
    count += groupedAvailabilities.value[date].length;
  }
  return count;
});

function selectDate(date) {
  selectedDate.value = date;
  selectedAvailabilityIndex.value = null;
}

function startBooking() {
  if (!isAuthenticated.value) {
    loginWithRedirect({ appState: { targetUrl: route.path } });
    return;
  }
  showBookingForm.value = true;
  selectedDate.value = availableDates.value.length > 0 ? availableDates.value[0] : null;
  selectedAvailabilityIndex.value = null;
  bookingError.value = '';
}

function cancelBooking() {
  showBookingForm.value = false;
  selectedDate.value = null;
  selectedAvailabilityIndex.value = null;
  bookingError.value = '';
}

async function confirmBooking() {
  if (selectedAvailabilityIndex.value === null) {
    bookingError.value = 'Bitte wähle eine Uhrzeit aus.';
    return;
  }

  try {
    const token = await getAccessTokenSilently();
    const slotIndex = selectedAvailabilityIndex.value;
    const availability = offer.value.availabilities[slotIndex];

    const response = await fetch(`${baseUrl}/api/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        availability: { id: availability.id },
        messageToTutor: bookingMessage.value || ""
      }),
    });

    if (!response.ok) throw new Error(`Backend meldet Fehler`);
    router.push('/bookings');

  } catch (error) {
    bookingError.value = 'Leider gab es einen Fehler bei der Buchung. Bitte versuche es später.';
  }
}

async function reportOffer() {
  if (!isAuthenticated.value) return;
  try {
    const token = await getAccessTokenSilently();
    await fetch(`${baseUrl}/api/moderation/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        targetType: 'OFFER',
        targetId: offer.value.id,
        reason: 'Nutzer hat dieses Angebot gemeldet'
      })
    });
    isReported.value = true;
  } catch (e) {
  }
}

async function deleteOfferAsMod() {
  try {
    const token = await getAccessTokenSilently();
    await fetch(`${baseUrl}/api/moderation/offer/${offer.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    showModMenu.value = false;
    router.push('/moderation');
  } catch (e) {
  }
}

function startChatWithTutor() {
  if (!isAuthenticated.value) {
    loginWithRedirect({ appState: { targetUrl: route.path } });
    return;
  }
  router.push({
    path: `/chat/${offer.value.ownerOauthId}`,
    query: { name: offer.value.ownerName }
  });
}
</script>

<template>
  <div class="container py-4 content-wrapper-desktop">

    <div v-if="isLoading" class="text-center py-5">
      <p class="text-muted">Angebot wird geladen...</p>
    </div>

    <div v-else-if="offer" class="text-start mobile-card desktop-card position-relative">
      <div v-if="!showBookingForm">

        <div class="d-flex align-items-center mb-4">
          <div class="profile-avatar-large me-3">{{ getInitials(offer.ownerName || 'Tutor') }}</div>
          <div>
            <h2 class="h4 mb-1 fw-bold text-dark">{{ offer.ownerName || 'Tutor' }}</h2>
            <p class="mb-1 text-muted fw-bold offer-meta">
              {{ offer.course }}, {{ offer.university }}
            </p>
            <p class="mb-0 offer-meta d-flex align-items-center">
              <span class="d-flex text-warning me-1">
                <svg v-for="n in 5" :key="n" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                  :fill="n <= Math.round(averageRating) ? '#fcdb39' : '#e0e0e0'" class="bi bi-star-fill me-1"
                  viewBox="0 0 16 16">
                  <path
                    d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>
              </span>
              <span class="text-dark fw-bold">{{ averageRating > 0 ? averageRating.toString().replace('.', ',') : 'Neu'
              }}</span>
              <span class="text-muted ms-1">({{ reviewCount }} Bew.)</span>
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
          <div class="fw-bold text-dark mb-3">Unterrichtsformat: {{ getFormatLabel(offer.format) }}</div>

          <div v-if="totalFreeSlotsCount > 0">
            <span class="text-success fw-bold small">
              📅 {{ totalFreeSlotsCount }} {{ totalFreeSlotsCount === 1 ? 'freier Termin' : 'freie Termine' }} verfügbar
            </span>
          </div>
          <div v-else>
            <span class="text-danger fw-bold small">❌ Aktuell keine freien Termine</span>
          </div>
        </div>

        <div class="price-book-box mb-4 d-flex justify-content-between align-items-center p-3 bg-white">
          <div>
            <div class="yellow-label mb-1">PREIS</div>
            <div class="fw-bold fs-3 text-dark lh-1">{{ offer.price }} €<span class="fs-6 fw-normal">/Std.</span></div>
          </div>
          <button @click="startBooking" class="btn-yellow-main px-4" :disabled="totalFreeSlotsCount === 0">
            Buchen
          </button>
        </div>

        <button @click="startChatWithTutor" class="btn-message-outline w-100 mb-3 text-dark">Nachricht senden</button>

        <div class="text-center mt-2 pb-2">
          <button v-if="!isReported && !isModerator" @click="reportOffer" class="report-link">⚠ Angebot melden</button>
          <span v-else-if="isReported && !isModerator" class="text-success fw-bold small">Angebot wurde gemeldet</span>
        </div>

        <hr class="my-5 border-light">

        <div class="mb-4">
          <div class="yellow-label mb-3">BEWERTUNGEN</div>

          <div v-if="reviews.length === 0" class="text-muted small p-4 bg-light rounded-3 text-center border">
            Bisher gibt es noch keine Bewertungen für dieses Angebot.
          </div>

          <div v-else class="reviews-list d-flex flex-column gap-3">
            <div v-for="review in reviews" :key="review.id" class="review-card p-4 bg-white rounded-4 border shadow-sm">
              <div class="d-flex align-items-center mb-3">
                <div class="profile-avatar-small me-3">{{ getInitials(review.studentName) }}</div>
                <div>
                  <div class="fw-bold text-dark mb-0 fs-6">{{ review.studentName }}</div>
                  <div class="text-muted" style="font-size: 13px;">{{ formatShortDate(review.createdAt) }}</div>
                </div>
              </div>
              <div class="d-flex mb-2">
                <span v-for="n in 5" :key="n" class="me-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    :fill="n <= review.ratingStars ? '#fcdb39' : '#e0e0e0'" class="bi bi-star-fill" viewBox="0 0 16 16">
                    <path
                      d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                </span>
              </div>
              <p class="mb-0 text-dark" style="font-size: 15px; line-height: 1.5;" v-if="review.ratingComment">
                "{{ review.ratingComment }}"
              </p>
            </div>
          </div>
        </div>

        <button v-if="isModerator" @click="showModMenu = true" class="btn-modal-red w-100 mt-4">Angebot
          moderieren</button>

      </div>
      <div v-else>

        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="h4 fw-bold text-dark mb-0">Termin buchen</h2>
          <button @click="cancelBooking" class="btn btn-sm btn-outline-secondary fw-bold">Abbrechen</button>
        </div>

        <div class="modul-box mb-4 p-3 bg-white">
          <div class="yellow-label mb-1">MODUL</div>
          <div class="fw-bold fs-5 text-dark">{{ offer.module }}</div>
        </div>

        <div class="mb-4">
          <div class="yellow-label mb-2">1. DATUM WÄHLEN</div>

          <div class="d-flex flex-wrap gap-2">
            <button v-for="date in availableDates" :key="date" @click="selectDate(date)" class="date-btn"
              :class="{ 'date-btn-active': selectedDate === date }">
              {{ formatShortDate(date) }}
            </button>
          </div>
        </div>

        <div v-if="selectedDate" class="mb-4">
          <div class="yellow-label mb-2">2. UHRZEIT WÄHLEN</div>

          <div class="d-flex flex-wrap gap-2">
            <button v-for="slot in groupedAvailabilities[selectedDate]" :key="slot.originalIndex"
              @click="selectedAvailabilityIndex = slot.originalIndex" class="time-btn"
              :class="{ 'time-btn-active': selectedAvailabilityIndex === slot.originalIndex }">
              {{ slot.startTime }} - {{ slot.endTime }}
            </button>
          </div>
        </div>

        <div class="mb-4">
          <div class="yellow-label mb-2 text-dark">Nachricht an Tutor (optional)</div>
          <textarea v-model="bookingMessage" class="form-control message-textarea" rows="3"
            placeholder="Ich brauche besonders Hilfe bei..."></textarea>
        </div>

        <div v-if="bookingError" class="alert alert-danger py-2 small fw-bold mb-3">
          {{ bookingError }}
        </div>

        <button @click="confirmBooking" class="btn-yellow-main w-100" :disabled="selectedAvailabilityIndex === null">
          Buchung bestätigen
        </button>

      </div>
    </div>

    <div v-else class="text-center py-5">
      <h3 class="mb-3 fw-bold text-dark">Angebot wurde nicht gefunden.</h3>
      <router-link to="/offers" class="btn btn-outline-dark px-4 py-2 fw-bold">Zurück zur Übersicht</router-link>
    </div>

    <div v-if="showModMenu" class="modal-overlay d-flex justify-content-center align-items-center">
      <div class="custom-modal bg-white p-4 rounded-4 shadow-lg text-center">
        <h3 class="fw-bold text-dark mb-4 fs-4">Aktion auswählen</h3>

        <div class="d-flex flex-column gap-3">
          <button @click="router.push(`/offer/edit/${offer.id}`)" class="btn-modal-yellow">Bearbeiten</button>
          <button @click="deleteOfferAsMod" class="btn-modal-red">Löschen</button>
          <button @click="showModMenu = false" class="btn-modal-outline mt-2">Abbrechen</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.content-wrapper-desktop {
  margin: 0 auto;
}

.offer-meta {
  font-size: 14px;
}

.clickable {
  cursor: pointer;
}

.appointment-subject {
  max-width: 90%;
}

.appointment-time {
  font-weight: 500;
}

.message-textarea {
  border-color: #cccccc;
  border-radius: 8px;
  resize: none;
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

.profile-avatar-small {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  background-color: #dcdcdc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
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
  color: #111827;
}

.btn-yellow-main:hover:not(:disabled) {
  background-color: #f0ce2b;
}

.btn-yellow-main:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  background: none;
  border: none;
  padding: 0;
  color: #a81c1c;
  font-size: 13px;
  font-weight: bold;
  text-decoration: underline !important;
  cursor: pointer;
}

.report-link:hover {
  color: #801515;
}

.date-btn {
  background-color: white;
  border: 1px solid #cccccc;
  color: #333;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.date-btn:hover {
  border-color: #a0a0a0;
  background-color: #f9f9f9;
}

.date-btn-active {
  background-color: #fcdb39;
  border-color: #d4a218;
  color: #111827;
}

.time-btn {
  background-color: white;
  border: 1px solid #cccccc;
  color: #333;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.time-btn:hover {
  border-color: #a0a0a0;
  background-color: #f9f9f9;
}

.time-btn-active {
  background-color: #111827;
  border-color: #111827;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(247, 244, 237, 0.85);
  z-index: 1050;
  backdrop-filter: blur(3px);
}

.custom-modal {
  border: 1px solid #e0dcd5;
  width: 90%;
  max-width: 400px;
}

.btn-modal-yellow {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background-color: #d4a218;
  color: white;
  font-weight: bold;
  font-size: 16px;
  border: none;
}

.btn-modal-red {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background-color: #dc3545;
  color: white;
  font-weight: bold;
  font-size: 16px;
  border: none;
}

.btn-modal-outline {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background-color: transparent;
  border: 1px solid #424242;
  color: #111827;
  font-weight: bold;
  font-size: 16px;
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
