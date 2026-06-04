<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import OfferCard from '../components/OfferCard.vue';

const route = useRoute();
const router = useRouter();
const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

const url = 'http://localhost:8081/api/offer';
const baseUrl = 'http://localhost:8081';
const offers = ref([]);
const isAdmin = ref(false);

const searchQuery = ref(route.query.search || '');
const selectedFormat = ref(route.query.format || '');

onMounted(() => {
  fetchOffers();
  checkAdminRole();
});

watch([searchQuery, selectedFormat], () => {
  const query = {};
  if (searchQuery.value) query.search = searchQuery.value;
  if (selectedFormat.value) query.format = selectedFormat.value;

  router.replace({ query });
  fetchOffers();
});

watch(isAuthenticated, () => {
  checkAdminRole();
});

async function checkAdminRole() {
  if (!isAuthenticated.value) return;

  try {
    const token = await getAccessTokenSilently();
    const response = await fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      isAdmin.value = data.role === 'ADMIN';
    }
  } catch (error) {
    console.error('Error checking admin role:', error);
  }
}

async function fetchOffers() {
  try {
    const params = new URLSearchParams();
    if (searchQuery.value.trim() !== '') params.append('search', searchQuery.value.trim());
    if (selectedFormat.value !== '') params.append('format', selectedFormat.value);

    const response = await fetch(`${url}?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    offers.value = await response.json();
  } catch (error) {
    console.error('Fehler beim Laden der Angebote:', error);
  }
}

function toggleSearch(term) {
  searchQuery.value = searchQuery.value === term ? '' : term;
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

        <div class="mb-4">
          <input type="text" class="form-control form-control-lg custom-search-input shadow-sm"
            placeholder="Nachhilfeangebote suchen z.B. Mathematik..." v-model="searchQuery" />
        </div>

        <div class="filter-section mb-5">
          <h6 class="fw-bold mb-3 filter-title">FILTER & QUICK-SEARCH</h6>
          <div class="d-flex flex-wrap gap-2 align-items-center">

            <span class="badge filter-pill clickable-pill"
              :class="searchQuery === 'HTWG Konstanz' ? 'active-pill' : 'outline-pill'"
              @click="toggleSearch('HTWG Konstanz')">HTWG Konstanz</span>
            <span class="badge filter-pill clickable-pill"
              :class="searchQuery === 'Wirtschaftsinformatik' ? 'active-pill' : 'outline-pill'"
              @click="toggleSearch('Wirtschaftsinformatik')">Wirtschaftsinformatik</span>

            <select v-model="selectedFormat" class="filter-dropdown-pill shadow-sm"
              :class="selectedFormat !== '' ? 'active-dropdown-pill' : ''">
              <option value="">Format: Alle</option>
              <option value="ONLINE">Online</option>
              <option value="PRAESENZ">Präsenz</option>
              <option value="HYBRID">Online & Präsenz</option>
            </select>

          </div>
        </div>
      </div>

      <div v-if="offers.length === 0 && !searchQuery && !selectedFormat" class="text-center py-5">
        <p class="text-muted">Angebote werden geladen...</p>
      </div>
      <div v-else-if="offers.length === 0 && (searchQuery || selectedFormat)" class="text-center py-5">
        <p class="text-muted fs-5">Leider keine Angebote gefunden.</p>
      </div>

      <div class="row offers-grid px-1">
        <div v-for="offer in offers" :key="offer.id" class="col-lg-4 col-md-6 mb-3">
          <OfferCard :offer="offer"
            :show-edit-button="isAuthenticated && (isAdmin || (user && offer.ownerOauthId === user.sub))" />
        </div>
      </div>

      <div class="row px-1 mt-2 mb-5" v-if="isAuthenticated">
        <div class="col-12">
          <router-link to="/offer/new" class="create-offer-btn text-decoration-none">
            <div class="icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" fill="none" />
                <path fill-rule="evenodd"
                  d="M8 3.5a.75.75 0 0 1 .75.75v3h3a.75.75 0 0 1 0 1.5h-3v3a.75.75 0 0 1-1.5 0v-3h-3a.75.75 0 0 1 0-1.5h3v-3A.75.75 0 0 1 8 3.5z"
                  fill="#111827" />
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

.custom-search-input {
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  padding: 14px 18px;
  font-size: 1.05rem;
  color: #333;
}

.custom-search-input:focus {
  border-color: #d4a218;
  box-shadow: 0 0 0 0.25rem rgba(212, 162, 24, 0.25);
  outline: none;
}

.custom-search-input::placeholder {
  color: #888;
}

.filter-title {
  color: #d4a218;
  letter-spacing: 0.5px;
}

.filter-pill {
  font-size: 0.95rem;
  font-weight: 400;
  padding: 8px 18px;
  border-radius: 50px;
  border: 1px solid #e0e0e0;
  color: #333;
}

.clickable-pill {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-pill:hover {
  border-color: #d4a218;
}

.active-pill {
  background-color: #f2f4f6;
  border-color: #dcdcdc;
  font-weight: 600;
}

.outline-pill {
  background-color: #ffffff;
}

.filter-dropdown-pill {
  font-size: 0.95rem;
  font-weight: 400;
  padding: 6px 32px 6px 18px;
  border-radius: 50px;
  border: 1px solid #e0e0e0;
  color: #333;
  background-color: #ffffff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23333' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 10px;
  transition: all 0.2s ease;
}

.filter-dropdown-pill:hover {
  border-color: #d4a218;
}

.filter-dropdown-pill:focus {
  outline: none;
}

.active-dropdown-pill {
  background-color: #f2f4f6;
  border-color: #dcdcdc;
  font-weight: 600;
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
