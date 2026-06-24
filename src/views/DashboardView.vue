<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRouter } from 'vue-router';
import { useFormats } from '../composables/useFormats.js';

const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
const router = useRouter();
const { getFormatLabel } = useFormats();
const searchQuery = ref('');
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const profileData = ref(null);
const myOffers = ref([]);
const upcomingAppointments = ref([]);

onMounted(() => {
    if (isAuthenticated.value) {
        loadProfile();
        fetchMyOffers();
        fetchUpcomingAppointments();
    }
});

watch(isAuthenticated, (newVal) => {
    if (newVal) {
        loadProfile();
        fetchMyOffers();
        fetchUpcomingAppointments();
    }
});

async function fetchUpcomingAppointments() {
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${baseUrl}/api/booking`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            const allBookings = await response.json();
            const now = new Date();

            upcomingAppointments.value = allBookings
                .filter(b => new Date(`${b.availability.date}T${b.availability.startTime}`) >= now)
                .map(b => {
                    const date = new Date(b.availability.date);
                    const isStudent = b.studentOauthId === user.value?.sub;
                    return {
                        id: b.id,
                        dateDay: date.toLocaleDateString('de-DE', { day: '2-digit' }),
                        dateMonth: date.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase(),
                        subject: b.offer.module,
                        person: isStudent ? (b.tutorName || 'Tutor') : (b.studentName || 'Student'),
                        status: isStudent ? 'GEBUCHT' : 'TUTOR',
                        time: b.availability.startTime.substring(0, 5),
                        format: getFormatLabel(b.offer.format)
                    };
                });
        }
    } catch (error) {
        console.error('Fehler beim Laden der Termine:', error);
    }
}

async function loadProfile() {
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${baseUrl}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            profileData.value = await response.json();
        }
    } catch (e) {
        console.error('Fehler beim Laden des Profils für das Dashboard:', e);
    }
}

async function fetchMyOffers() {
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${baseUrl}/api/offer`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            const allOffers = await response.json();
            myOffers.value = allOffers.filter(offer => offer.ownerOauthId === user.value?.sub);
        }
    } catch (error) {
        console.error('Fehler beim Laden der eigenen Angebote:', error);
    }
}

function getBookedCount(offer) {
    if (!offer.availabilities) return 0;
    return offer.availabilities.filter(avail => avail.booked).length;
}

function getFirstName() {
    if (!profileData.value) return '';
    if (profileData.value.firstName) return profileData.value.firstName;
    if (profileData.value.name) return profileData.value.name.split(' ')[0];
    return 'Student';
}

function editOffer(id) { router.push(`/offer/edit/${id}`); }
function createNewOffer() { router.push('/offer/new'); }
function searchOffers() {
    router.push({ path: '/offers', query: searchQuery.value ? { search: searchQuery.value } : {} });
}
</script>

<template>
    <div class="dashboard-wrapper">
        <div class="container py-4 py-lg-5 dashboard-container">

            <div class="mb-3 mt-2 mx-auto search-container-wrapper">
                <h1 class="fw-bold text-dark fs-2 mb-3 text-start">Guten Tag<span v-if="getFirstName()">, {{ getFirstName() }}</span></h1>

                <form @submit.prevent="searchOffers" class="search-container position-relative w-100">
                    <input v-model="searchQuery" type="text"
                        class="form-control custom-search-input py-3 px-4 shadow-sm"
                        placeholder="Nachhilfeangebot suchen">
                    <button type="submit" class="search-icon-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                            class="bi bi-search" viewBox="0 0 16 16">
                            <path
                                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                        </svg>
                    </button>
                </form>
            </div>

            <hr class="mb-4 border-secondary opacity-25">

            <div class="row g-5">

                <div class="col-lg-6 mb-4 mb-lg-0 pe-lg-4">
                    <h6 class="section-heading mb-3">NÄCHSTE TERMINE</h6>

                    <div class="d-flex flex-column gap-3">
                        <div v-if="upcomingAppointments.length === 0"
                            class="bg-white rounded-4 shadow-sm border p-4 text-center text-muted">
                            Du hast aktuell keine anstehenden Termine.
                        </div>

                        <div v-for="appointment in upcomingAppointments" :key="appointment.id"
                            class="appointment-card bg-white rounded-4 shadow-sm border d-flex overflow-hidden"
                            @click="router.push({ path: '/bookings', query: { tab: appointment.status === 'TUTOR' ? 'tutor' : 'student' } })">
                            <div
                                class="date-box d-flex flex-column justify-content-center align-items-center bg-white border-end px-3 py-3">
                                <span class="fs-4 fw-bold text-dark lh-1 mb-1">{{ appointment.dateDay }}</span>
                                <span class="fs-6 fw-bold text-dark lh-1">{{ appointment.dateMonth }}</span>
                            </div>

                            <div class="info-box p-3 w-100 position-relative d-flex flex-column justify-content-center">
                                <div class="fw-bold text-dark fs-6 mb-1 text-truncate pe-5 appointment-subject">
                                    {{ appointment.subject }} · {{ appointment.person }}
                                </div>
                                <div class="text-dark small appointment-time">
                                    <span v-if="appointment.status === 'TUTOR'">{{ appointment.person }} bucht · </span>
                                    {{ appointment.time }} · {{ appointment.format }}
                                </div>

                                <div class="status-badge position-absolute"
                                    :class="appointment.status === 'GEBUCHT' ? 'badge-green' : 'badge-blue'">
                                    {{ appointment.status }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6 ps-lg-4">
                    <h6 class="section-heading mb-3">MEINE ANGEBOTE</h6>

                    <div class="d-flex flex-column gap-3">
                        <div v-if="myOffers.length === 0"
                            class="bg-white rounded-4 shadow-sm border p-4 text-center text-muted mb-2">
                            Du hast noch keine eigenen Angebote erstellt.
                        </div>

                        <div v-for="offer in myOffers" :key="offer.id"
                            class="offer-card bg-white rounded-4 shadow-sm border p-3 d-flex justify-content-between align-items-center"
                            style="cursor: pointer;" @click="router.push(`/offer/${offer.id}`)">
                            <div class="pe-3">
                                <div class="fw-bold text-dark mb-1">{{ offer.module }}</div>
                                <div class="text-dark small offer-info">
                                    {{ offer.price }}€/Std. · {{ getBookedCount(offer) }} Buchungen
                                </div>
                            </div>
                            <button @click.stop="editOffer(offer.id)" class="btn-figma-yellow px-3 py-1 m-0">
                                Bearbeiten
                            </button>
                        </div>

                        <button @click="createNewOffer" class="create-offer-btn mt-2">
                            <div class="icon-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
                                        fill="none" />
                                    <path fill-rule="evenodd"
                                        d="M8 3.5a.75.75 0 0 1 .75.75v3h3a.75.75 0 0 1 0 1.5h-3v3a.75.75 0 0 1-1.5 0v-3h-3a.75.75 0 0 1 0-1.5h3v-3A.75.75 0 0 1 8 3.5z"
                                        fill="#111827" />
                                </svg>
                            </div>
                            <span class="btn-text">Neues Angebot erstellen</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-search-input {
    border-radius: 12px;
    border: 1px solid #dcdcdc;
    font-size: 1rem;
    background-color: #ffffff;
    transition: all 0.2s ease;
}

.custom-search-input:focus {
    border-color: #d4a218;
    box-shadow: 0 0 0 0.25rem rgba(212, 162, 24, 0.15);
    outline: none;
}

.search-icon-btn {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #111827;
    font-weight: bold;
    background: none;
    border: none;
    padding: 5px;
    cursor: pointer;
}

.section-heading {
    color: #d4a218;
    font-weight: 800;
    letter-spacing: 0.5px;
}

.dashboard-wrapper {
    padding-bottom: 80px;
}

.dashboard-container {
    max-width: 1100px;
}

.search-container-wrapper {
    max-width: 600px;
}

.appointment-card {
    border-color: #e0dcd5 !important;
    transition: transform 0.2s;
    cursor: pointer;
}

.appointment-subject {
    max-width: 90%;
}

.appointment-time {
    font-weight: 500;
}

.offer-info {
    font-weight: 500;
}

.appointment-card:hover {
    transform: translateY(-2px);
}

.date-box {
    min-width: 80px;
    border-color: #e0dcd5 !important;
}

.status-badge {
    bottom: 15px;
    right: 15px;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 12px;
    letter-spacing: 0.5px;
}

.badge-green {
    background-color: #5edb39;
    color: #111827;
    border: 1px solid #4cae2d;
}

.badge-blue {
    background-color: #1f4277;
    color: #ffffff;
}

.offer-card {
    border-color: #e0dcd5 !important;
}

.btn-figma-yellow {
    background-color: #fcdb39;
    color: #111827;
    border: 1px solid #424242;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    transition: opacity 0.2s;
    white-space: nowrap;
}

.btn-figma-yellow:hover {
    opacity: 0.85;
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
