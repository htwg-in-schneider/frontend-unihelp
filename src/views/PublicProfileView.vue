<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const route = useRoute();
const router = useRouter();
const { isAuthenticated, loginWithRedirect } = useAuth0();
const baseUrl = 'http://localhost:8081';

const publicProfile = ref(null);
const isLoading = ref(true);

onMounted(async () => {
    await fetchPublicProfile();
});

async function fetchPublicProfile() {
    try {
        const response = await fetch(`${baseUrl}/api/user/${route.params.id}`);
        if (response.ok) {
            publicProfile.value = await response.json();
        }
    } catch (error) {
        console.error('Fehler beim Laden des Profils:', error);
    } finally {
        isLoading.value = false;
    }
}

const userInitials = computed(() => {
    if (publicProfile.value?.firstName && publicProfile.value?.lastName) {
        return publicProfile.value.firstName.charAt(0) + publicProfile.value.lastName.charAt(0);
    }
    return 'U';
});

function handleMessage() {
    if (!isAuthenticated.value) {
        loginWithRedirect({ appState: { targetUrl: `/chat/${publicProfile.value.oauthId}` } });
        return;
    }
    router.push({
        path: `/chat/${publicProfile.value.oauthId}`,
        query: { name: `${publicProfile.value.firstName} ${publicProfile.value.lastName}` }
    });
}
</script>

<template>
    <div class="public-profile-wrapper">

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
        </div>

        <div v-else-if="publicProfile" class="container py-4 content-wrapper-desktop">
            <div class="row">

                <div class="col-lg-4 mb-4 mb-lg-0">
                    <div class="bg-white p-4 p-lg-5 rounded-4 shadow-sm border text-center profile-card-border">
                        <div class="avatar-circle mx-auto mb-3">{{ userInitials }}</div>
                        <h3 class="fw-bold text-dark mb-1 fs-4">{{ publicProfile.firstName }} {{ publicProfile.lastName
                            }}</h3>
                        <p class="text-muted mb-1 small fw-bold">{{ publicProfile.email }}</p>
                        <p class="text-muted mb-4 small fw-bold">{{ publicProfile.university }} - {{
                            publicProfile.course }}</p>

                        <div class="stats-row d-flex justify-content-between">
                            <div class="stat-box">
                                <span class="stat-number">{{ publicProfile.offers.length }}</span>
                                <span class="stat-label">Angebote</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-number">{{ publicProfile.reviewCount }}</span>
                                <span class="stat-label">Bewertungen</span>
                            </div>
                            <div class="stat-box border-0">
                                <span class="stat-number">{{ publicProfile.averageRating > 0 ?
                                    publicProfile.averageRating.toString().replace('.', ',') : '-' }} ★</span>
                                <span class="stat-label">ø Bewertung</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-8">
                    <h6 class="text-warning fw-bold mb-3 text-uppercase activities-heading">ANGEBOTE VON {{
                        publicProfile.firstName }}</h6>

                    <div v-if="publicProfile.offers.length === 0"
                        class="text-muted text-center py-5 bg-white border rounded-4 shadow-sm offer-card-border">
                        Dieser Nutzer hat aktuell keine Angebote.
                    </div>

                    <div class="d-flex flex-column gap-3">
                        <div v-for="offer in publicProfile.offers" :key="offer.id"
                            class="bg-white p-4 rounded-4 shadow-sm border offer-card-border">
                            <h5 class="fw-bold text-dark mb-1">{{ offer.module }}</h5>
                            <p class="fw-bold text-dark fs-4 mb-3">{{ offer.price }} €<span
                                    class="fs-6 fw-normal text-muted">/Std.</span></p>

                            <div class="d-flex flex-column flex-sm-row gap-2">
                                <router-link :to="`/offer/${offer.id}`"
                                    class="btn btn-profile-yellow w-100 fw-bold text-decoration-none text-center">Angebot
                                    ansehen</router-link>
                                <button @click="handleMessage" class="btn btn-blue-dark w-100 fw-bold">Nachricht
                                    senden</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div v-else class="text-center py-5">
            <h3 class="fw-bold">Nutzer nicht gefunden</h3>
            <router-link to="/offers" class="btn btn-outline-dark mt-3 fw-bold">Zurück zur Suche</router-link>
        </div>
    </div>
</template>

<style scoped>
.public-profile-wrapper {
    padding-bottom: 60px;
}

.content-wrapper-desktop {
    max-width: 1100px;
    margin: 0 auto;
}

.profile-card-border,
.offer-card-border {
    border-color: #e0dcd5 !important;
}

.avatar-circle {
    width: 90px;
    height: 90px;
    background-color: #dcdcdc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: #333;
}

.stats-row {
    background-color: #fafafa;
    border: 1px solid #e0dcd5;
    border-radius: 12px;
    padding: 15px 0;
}

.stat-box {
    flex: 1;
    text-align: center;
    border-right: 1px solid #e0dcd5;
    display: flex;
    flex-direction: column;
}

.stat-box:last-child {
    border-right: none;
}

.stat-number {
    font-size: 22px;
    font-weight: 800;
    color: #111827;
}

.stat-label {
    font-size: 13px;
    color: #6b7280;
    font-weight: 600;
}

.activities-heading {
    letter-spacing: 0.5px;
    color: #d4a218 !important;
}

.btn-profile-yellow {
    background-color: #d4a218;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 12px 0;
    transition: background-color 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
}

.btn-profile-yellow:hover {
    background-color: #b88d15;
    color: #ffffff;
}

.btn-blue-dark {
    background-color: #1f4277;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 0;
    transition: background-color 0.2s;
}

.btn-blue-dark:hover {
    background-color: #153059;
    color: white;
}
</style>
