<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { useToast } from '../composables/useToast.js';

const route = useRoute();
const router = useRouter();
const { user: authUser, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
const { success, error } = useToast();
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const publicProfile = ref(null);
const isLoading = ref(true);
const isModerator = ref(false);
const profileUserId = ref(null);
const isSuspended = ref(false);

const showModModal = ref(false);
const showBanModal = ref(false);
const banMode = ref('PERMANENT');
const banUntilDate = ref('');
const banReason = ref('');

const todayStr = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
});

const isOwnProfile = computed(() => {
    return authUser.value?.sub && publicProfile.value && authUser.value.sub === publicProfile.value.oauthId;
});

onMounted(async () => {
    await fetchPublicProfile();
    if (isAuthenticated.value) {
        await checkModRole();
    }
});

async function fetchPublicProfile() {
    try {
        const response = await fetch(`${baseUrl}/api/user/${route.params.id}`);
        if (response.ok) {
            publicProfile.value = await response.json();
        }
    } catch (e) {
        console.error('Fehler beim Laden des Profils:', e);
    } finally {
        isLoading.value = false;
    }
}

async function checkModRole() {
    try {
        const token = await getAccessTokenSilently();
        const [profileRes, suspensionsRes] = await Promise.all([
            fetch(`${baseUrl}/api/profile`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${baseUrl}/api/moderation/suspensions`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (profileRes.ok) {
            const profile = await profileRes.json();
            if (profile.role === 'MODERATOR' || profile.role === 'ADMIN') {
                isModerator.value = true;
            }
        }
        if (suspensionsRes.ok) {
            const suspensions = await suspensionsRes.json();
            isSuspended.value = suspensions.some(s => s.user?.oauthId === route.params.id);
            const match = suspensions.find(s => s.user?.oauthId === route.params.id);
            if (match) profileUserId.value = match.user.id;
        }
        if (!profileUserId.value && publicProfile.value) {
            const usersRes = await fetch(`${baseUrl}/api/moderation/users`, { headers: { Authorization: `Bearer ${token}` } });
            if (usersRes.ok) {
                const users = await usersRes.json();
                const u = users.find(u => u.oauthId === route.params.id);
                if (u) profileUserId.value = u.id;
            }
        }
    } catch (_) { }
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

function closeModals() {
    showModModal.value = false;
    showBanModal.value = false;
    banMode.value = 'PERMANENT';
    banUntilDate.value = '';
    banReason.value = '';
}

async function modDeleteUser() {
    if (!profileUserId.value) return;
    try {
        const token = await getAccessTokenSilently();
        await fetch(`${baseUrl}/api/moderation/user/${profileUserId.value}/delete`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` }
        });
        success('Nutzer gelöscht.');
        closeModals();
        await fetchPublicProfile();
    } catch (_) { error('Aktion fehlgeschlagen.'); }
}

async function modRestoreUser() {
    if (!profileUserId.value) return;
    try {
        const token = await getAccessTokenSilently();
        await fetch(`${baseUrl}/api/moderation/user/${profileUserId.value}/restore`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` }
        });
        success('Profil wiederhergestellt.');
        closeModals();
        await fetchPublicProfile();
    } catch (_) { error('Aktion fehlgeschlagen.'); }
}

async function modUnban() {
    if (!profileUserId.value) return;
    try {
        const token = await getAccessTokenSilently();
        await fetch(`${baseUrl}/api/moderation/user/${profileUserId.value}/unban`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` }
        });
        isSuspended.value = false;
        success('Sperre aufgehoben.');
        closeModals();
    } catch (_) { error('Aktion fehlgeschlagen.'); }
}

async function modBan() {
    if (!banReason.value || !profileUserId.value) return;
    try {
        const token = await getAccessTokenSilently();
        const payload = {
            type: banMode.value,
            reason: banReason.value,
            ...(banMode.value === 'TEMPORARY' && banUntilDate.value ? { until: banUntilDate.value } : {})
        };
        await fetch(`${baseUrl}/api/moderation/user/${profileUserId.value}/ban`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        isSuspended.value = true;
        success('Nutzer gesperrt.');
        closeModals();
    } catch (_) { error('Aktion fehlgeschlagen.'); }
}
</script>

<template>
    <div class="public-profile-wrapper">

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
        </div>

        <div v-else-if="publicProfile" class="container py-4 content-wrapper-desktop">
            <div class="row">

                <div class="col-lg-5 mb-4 mb-lg-0">
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

                        <div v-if="isModerator && !isOwnProfile" class="mt-3">
                            <button @click="showModModal = true" class="btn-mod-red w-100 fw-bold">Profil
                                moderieren</button>
                        </div>
                    </div>
                </div>

                <div class="col-lg-7">
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

        <div v-if="showModModal && !showBanModal"
            class="modal-overlay d-flex justify-content-center align-items-center">
            <div class="custom-modal bg-white p-4 rounded-4 shadow-lg text-center">
                <h3 class="fw-bold text-dark mb-1 fs-4">Profil moderieren</h3>
                <p class="text-muted small mb-4">{{ publicProfile?.firstName }} {{ publicProfile?.lastName }}</p>
                <div class="d-flex flex-column gap-3">
                    <button v-if="!isSuspended" @click="showBanModal = true" class="btn-modal-yellow">Nutzer
                        sperren</button>
                    <button v-if="isSuspended" @click="modUnban" class="btn-modal-green">Sperre aufheben</button>
                    <button v-if="!publicProfile?.isDeleted" @click="modDeleteUser" class="btn-modal-red">Nutzer
                        löschen</button>
                    <button v-else @click="modRestoreUser" class="btn-modal-green">Profil wiederherstellen</button>
                    <button @click="closeModals" class="btn-modal-outline border-0 text-muted mt-1">Abbrechen</button>
                </div>
            </div>
        </div>

        <div v-if="showBanModal" class="modal-overlay d-flex justify-content-center align-items-center">
            <div class="custom-modal bg-white p-4 rounded-4 shadow-lg text-start">
                <h3 class="fw-bold text-dark mb-4 fs-4 text-center">Nutzer sperren</h3>
                <div class="mb-3">
                    <label class="fw-bold text-dark mb-2 fs-6 d-block">Sperr-Typ</label>
                    <select v-model="banMode" class="form-select border-secondary">
                        <option value="PERMANENT">Permanent</option>
                        <option value="TEMPORARY">Temporär</option>
                    </select>
                </div>
                <div v-if="banMode === 'TEMPORARY'" class="mb-3">
                    <label class="fw-bold text-dark mb-2 fs-6 d-block">Gesperrt bis</label>
                    <input type="date" v-model="banUntilDate" :min="todayStr" class="form-control border-secondary" />
                </div>
                <div class="mb-4">
                    <label class="fw-bold text-dark mb-2 fs-6 d-block">Grund</label>
                    <textarea v-model="banReason" class="form-control" rows="3"
                        placeholder="Verstoß gegen die Richtlinien..."></textarea>
                </div>
                <div class="d-flex flex-column gap-2">
                    <button @click="modBan" class="btn-modal-yellow"
                        :disabled="!banReason || (banMode === 'TEMPORARY' && !banUntilDate)">Sperre vollziehen</button>
                    <button @click="closeModals" class="btn-modal-outline border-0 text-muted">Abbrechen</button>
                </div>
            </div>
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

.btn-mod-red {
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 0;
    font-size: 15px;
    transition: background-color 0.2s;
}

.btn-mod-red:hover {
    background-color: #c82333;
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
    border: none;
}

.btn-modal-yellow:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-modal-red {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background-color: #dc3545;
    color: white;
    font-weight: bold;
    border: none;
}

.btn-modal-green {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background-color: #28a745;
    color: white;
    font-weight: bold;
    border: none;
}

.btn-modal-outline {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background-color: transparent;
    border: 1px solid #424242;
    font-weight: bold;
}
</style>
