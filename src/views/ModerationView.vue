<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { useToast } from '../composables/useToast.js';
import { useFormats } from '../composables/useFormats.js';

const router = useRouter();
const { getAccessTokenSilently } = useAuth0();
const { success, error } = useToast();
const { getFormatLabel } = useFormats();

const userRole = ref('');
const activeSection = ref('REPORTS');
const statusFilter = ref('OPEN');
const isLoading = ref(false);

const showActionMenu = ref(false);
const showBanMenu = ref(false);
const selectedTarget = ref(null);

const showRoleMenu = ref(false);
const selectedRoleUser = ref(null);

const banMode = ref('PERMANENT');
const banUntilDate = ref('');
const banReason = ref('');

const reports = ref([]);
const usersList = ref([]);
const offersList = ref([]);
const bookingsList = ref([]);
const suspensionsList = ref([]);
const reviewsList = ref([]);

const filteredReports = computed(() =>
    reports.value.filter(r => (r.status || 'OPEN').toLowerCase() === statusFilter.value.toLowerCase())
);

const userSearch = ref('');
const filteredUsers = computed(() => {
    if (!userSearch.value.trim()) return usersList.value;
    const q = userSearch.value.toLowerCase();
    return usersList.value.filter(u =>
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
});

const suspensionSearch = ref('');
const filteredSuspensions = computed(() => {
    if (!suspensionSearch.value.trim()) return suspensionsList.value;
    const q = suspensionSearch.value.toLowerCase();
    return suspensionsList.value.filter(s =>
        ((s.user?.firstName || '') + ' ' + (s.user?.lastName || '')).toLowerCase().includes(q) ||
        (s.user?.email || '').toLowerCase().includes(q)
    );
});

const offerSearch = ref('');
const filteredOffers = computed(() => {
    if (!offerSearch.value.trim()) return offersList.value;
    const q = offerSearch.value.toLowerCase();
    return offersList.value.filter(o =>
        (o.module || '').toLowerCase().includes(q) ||
        (o.ownerName || '').toLowerCase().includes(q)
    );
});

const reviewSearch = ref('');
const filteredReviews = computed(() => {
    if (!reviewSearch.value.trim()) return reviewsList.value;
    const q = reviewSearch.value.toLowerCase();
    return reviewsList.value.filter(rv =>
        (rv.offerModule || '').toLowerCase().includes(q) ||
        (rv.offerOwnerName || '').toLowerCase().includes(q) ||
        (rv.ratingComment || '').toLowerCase().includes(q)
    );
});

const bookingSearch = ref('');
const filteredBookings = computed(() => {
    if (!bookingSearch.value.trim()) return bookingsList.value;
    const q = bookingSearch.value.toLowerCase();
    return bookingsList.value.filter(b =>
        (b.studentName || '').toLowerCase().includes(q) ||
        (b.tutorName || '').toLowerCase().includes(q) ||
        (b.offer?.module || '').toLowerCase().includes(q)
    );
});

const openReportsCount = computed(() => reports.value.filter(r => r.status === 'OPEN').length);

const todayStr = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
});

onMounted(async () => {
    await initDashboard();
});

function getStatusLabel(status) {
    switch (status) {
        case 'UNPAID': return 'Offen / Unbezahlt';
        case 'PAID': return 'Bezahlt';
        case 'RATED': return 'Bewertet';
        case 'CANCELED': return 'Storniert';
        default: return status;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    let d;
    if (Array.isArray(dateStr)) {
        d = new Date(Date.UTC(dateStr[0], dateStr[1] - 1, dateStr[2], dateStr[3] || 0, dateStr[4] || 0, dateStr[5] || 0));
    } else {
        const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(dateStr);
        d = new Date(hasTimezone ? dateStr : dateStr + 'Z');
    }
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('de-DE');
}

async function initDashboard() {
    isLoading.value = true;
    try {
        const token = await getAccessTokenSilently();

        const profileRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (profileRes.ok) {
            const profile = await profileRes.json();
            userRole.value = profile.role;
        }

        const [reportsRes, offersRes, usersRes, suspensionsRes, bookingsRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/reports`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/offer`),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/users`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/suspensions`, { headers: { Authorization: `Bearer ${token}` } }),
            userRole.value === 'ADMIN' ? fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/bookings`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ ok: false })
        ]);

        const rawReports = reportsRes.ok ? await reportsRes.json() : [];
        offersList.value = offersRes.ok ? await offersRes.json() : [];
        usersList.value = usersRes.ok ? await usersRes.json() : [];
        suspensionsList.value = suspensionsRes.ok ? await suspensionsRes.json() : [];
        bookingsList.value = bookingsRes.ok ? await bookingsRes.json() : [];

        if (userRole.value === 'ADMIN') {
            await loadAllReviews(token);
        }

        const grouped = {};
        rawReports.forEach(r => {
            const key = `${r.targetType}_${r.targetId}`;
            if (!grouped[key]) {
                let name = `ID: ${r.targetId}`;
                let ownerName = '';
                let activeSuspension = null;
                let isUserDeleted = false;

                if (r.targetType === 'OFFER') {
                    const offer = offersList.value.find(o => String(o.id) === String(r.targetId));
                    if (offer) {
                        name = offer.module || offer.course || 'Angebot';
                        ownerName = offer.ownerName || 'Unbekannter Tutor';
                    } else {
                        name = `Gelöschtes Angebot (${r.targetId})`;
                    }
                } else if (r.targetType === 'USER') {
                    const u = usersList.value.find(user => String(user.id) === String(r.targetId));
                    if (u) {
                        name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || u.email;
                        isUserDeleted = u.isDeleted === true;
                    }
                    activeSuspension = suspensionsList.value.find(s => s.user && String(s.user.id) === String(r.targetId));
                }

                grouped[key] = {
                    id: r.id,
                    targetType: r.targetType,
                    targetId: r.targetId,
                    title: name,
                    owner: ownerName,
                    count: 0,
                    status: r.status || 'OPEN',
                    suspension: activeSuspension,
                    isDeleted: isUserDeleted,
                    reasons: []
                };
            }
            if (r.reason) grouped[key].reasons.push(r.reason);
            grouped[key].count++;
        });

        reports.value = Object.values(grouped);
    } catch (e) {
        error("Fehler beim Laden des Dashboards.");
    } finally {
        isLoading.value = false;
    }
}

async function loadAllReviews(token) {
    const allReviews = [];
    for (const offer of offersList.value) {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/offer/${offer.id}/reviews`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                data.forEach(rv => allReviews.push({ ...rv, offerId: offer.id, offerModule: offer.module, offerOwnerOauthId: offer.ownerOauthId, offerOwnerName: offer.ownerName }));
            }
        } catch (_) { }
    }
    reviewsList.value = allReviews;
}

function viewTarget(item) {
    if (item.targetType === 'OFFER') router.push(`/offer/${item.targetId}`);
    if (item.targetType === 'USER') {
        const targetUser = usersList.value.find(u => String(u.id) === String(item.targetId));
        if (targetUser && targetUser.oauthId) {
            router.push(`/user/${targetUser.oauthId}`);
        }
    }
}

function openActionMenu(item) {
    selectedTarget.value = item;
    showActionMenu.value = true;
}

function openUserAction(user) {
    selectedTarget.value = { targetType: 'USER', targetId: user.id, isDeleted: user.isDeleted };
    showActionMenu.value = true;
}

function openSuspensionAction(suspension) {
    const u = suspension.user;
    selectedTarget.value = { targetType: 'USER', targetId: u.id, isDeleted: u.isDeleted, suspensionId: suspension.id };
    showActionMenu.value = true;
}

function openOfferAction(offer) {
    selectedTarget.value = { targetType: 'OFFER', targetId: offer.id };
    showActionMenu.value = true;
}

function closeModals() {
    showActionMenu.value = false;
    showBanMenu.value = false;
    banMode.value = 'PERMANENT';
    banUntilDate.value = '';
    banReason.value = '';
}

async function executeToggleStatus(newStatus) {
    if (!selectedTarget.value) return;
    try {
        const token = await getAccessTokenSilently();
        const endpoint = newStatus === 'CLOSED' ? 'close' : 'open';
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/reports/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ targetType: selectedTarget.value.targetType, targetId: selectedTarget.value.targetId })
        });
        success(`Meldung ${newStatus === 'CLOSED' ? 'abgeschlossen' : 'geöffnet'}.`);
        await initDashboard();
        closeModals();
    } catch (e) {
        error("Aktion fehlgeschlagen.");
    }
}

async function executeDelete() {
    if (!selectedTarget.value) return;
    try {
        const token = await getAccessTokenSilently();
        const isUser = selectedTarget.value.targetType === 'USER';
        const url = isUser
            ? `${import.meta.env.VITE_API_BASE_URL}/api/moderation/user/${selectedTarget.value.targetId}/delete`
            : `${import.meta.env.VITE_API_BASE_URL}/api/moderation/offer/${selectedTarget.value.targetId}`;
        await fetch(url, { method: isUser ? 'POST' : 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        success(`${isUser ? 'Nutzer' : 'Angebot'} erfolgreich gelöscht.`);
        await initDashboard();
        closeModals();
    } catch (e) {
        error("Löschen fehlgeschlagen.");
    }
}

async function executeRestore() {
    if (!selectedTarget.value || selectedTarget.value.targetType !== 'USER') return;
    try {
        const token = await getAccessTokenSilently();
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/user/${selectedTarget.value.targetId}/restore`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` }
        });
        success('Nutzerprofil wiederhergestellt.');
        await initDashboard();
        closeModals();
    } catch (e) {
        error("Wiederherstellen fehlgeschlagen.");
    }
}

async function executeUnban() {
    if (!selectedTarget.value) return;
    try {
        const token = await getAccessTokenSilently();
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/user/${selectedTarget.value.targetId}/unban`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` }
        });
        success('Sperre aufgehoben.');
        await initDashboard();
        closeModals();
    } catch (e) {
        error("Entsperren fehlgeschlagen.");
    }
}

async function executeBan() {
    if (!banReason.value) return;

    if (banMode.value === 'TEMPORARY') {
        if (!banUntilDate.value) {
            error('Bitte ein Datum für die temporäre Sperre angeben.');
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(banUntilDate.value);
        if (isNaN(selected) || selected < today) {
            error('Das Sperrdatum muss in der Zukunft liegen.');
            return;
        }
    }

    try {
        const token = await getAccessTokenSilently();
        const payload = {
            type: banMode.value,
            reason: banReason.value,
            ...(banMode.value === 'TEMPORARY' && banUntilDate.value ? { until: banUntilDate.value } : {})
        };
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/user/${selectedTarget.value.targetId}/ban`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        success('Nutzer erfolgreich gesperrt.');
        await initDashboard();
        closeModals();
    } catch (e) {
        error("Sperren fehlgeschlagen.");
    }
}

function openRoleMenu(user) {
    selectedRoleUser.value = user;
    showRoleMenu.value = true;
}

function closeRoleMenu() {
    showRoleMenu.value = false;
    selectedRoleUser.value = null;
}

async function changeUserRole(newRole) {
    if (!selectedRoleUser.value) return;
    try {
        const token = await getAccessTokenSilently();
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/user/${selectedRoleUser.value.id}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ role: newRole })
        });
        success(`Rolle zu ${newRole} geändert.`);
        await initDashboard();
        closeRoleMenu();
    } catch (e) {
        error("Rollenänderung fehlgeschlagen.");
    }
}

async function deleteReview(review) {
    try {
        const token = await getAccessTokenSilently();
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/review/${review.id}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
        success('Bewertung gelöscht.');
        reviewsList.value = reviewsList.value.filter(r => r.id !== review.id);
    } catch (e) {
        error("Löschen fehlgeschlagen.");
    }
}
</script>

<template>
    <div class="moderation-page-wrapper">
        <div class="container content-wrapper-desktop">
            <div class="mobile-card desktop-card position-relative text-start">

                <div class="d-flex flex-wrap gap-2 mb-4 border-bottom pb-3">
                    <button @click="activeSection = 'REPORTS'" class="tab-btn"
                        :class="{ 'active': activeSection === 'REPORTS' }">Meldungen ({{ openReportsCount }})</button>

                    <template v-if="userRole === 'ADMIN'">
                        <button @click="activeSection = 'USERS'" class="tab-btn"
                            :class="{ 'active': activeSection === 'USERS' }">Alle Nutzer ({{ usersList.length
                            }})</button>
                        <button @click="activeSection = 'SUSPENSIONS'" class="tab-btn"
                            :class="{ 'active': activeSection === 'SUSPENSIONS' }">Gesperrt ({{ suspensionsList.length
                            }})</button>
                        <button @click="activeSection = 'OFFERS'" class="tab-btn"
                            :class="{ 'active': activeSection === 'OFFERS' }">Alle Angebote ({{ offersList.length
                            }})</button>
                        <button @click="activeSection = 'REVIEWS'" class="tab-btn"
                            :class="{ 'active': activeSection === 'REVIEWS' }">Bewertungen ({{ reviewsList.length
                            }})</button>
                        <button @click="activeSection = 'BOOKINGS'" class="tab-btn"
                            :class="{ 'active': activeSection === 'BOOKINGS' }">Vorgänge / Buchungen</button>
                    </template>
                </div>

                <div v-if="isLoading" class="text-center py-5">
                    <div class="spinner-border text-warning" role="status"></div>
                </div>

                <div v-else>
                    <div v-if="activeSection === 'REPORTS'">
                        <div class="d-flex gap-3 mb-4 filter-row">
                            <button @click="statusFilter = 'OPEN'" class="btn-subtab"
                                :class="{ 'active-subtab': statusFilter === 'OPEN' }">Offen</button>
                            <button @click="statusFilter = 'CLOSED'" class="btn-subtab"
                                :class="{ 'active-subtab': statusFilter === 'CLOSED' }">Abgeschlossen</button>
                        </div>
                        <div v-if="filteredReports.length === 0"
                            class="text-muted p-4 bg-light rounded text-center border">Keine
                            Meldungen vorhanden.</div>
                        <div class="d-flex flex-column gap-3">
                            <div v-for="item in filteredReports" :key="item.id"
                                class="bg-white rounded-4 shadow-sm border p-3">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <div class="fw-bold text-dark fs-5 lh-1 mb-1">{{ item.targetType === 'OFFER' ?
                                            'Angebot:' : 'Nutzer:' }} "{{ item.title }}"</div>
                                        <div v-if="item.owner" class="text-secondary small fw-bold mb-1">Tutor: {{
                                            item.owner }}</div>
                                        <div v-if="item.isDeleted" class="mb-2"><span class="badge bg-danger">Profil
                                                gelöscht</span>
                                        </div>
                                        <div v-if="item.reasons.length > 0" class="mt-2">
                                            <div class="text-muted small fw-bold mb-1">Meldungsgründe:</div>
                                            <ul class="mb-0 ps-3">
                                                <li v-for="(reason, idx) in item.reasons" :key="idx"
                                                    class="text-dark small">{{ reason
                                                    }}</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <span class="badge rounded-pill px-3 py-1 bg-warning text-dark">{{ item.count }}
                                        Meldungen</span>
                                </div>
                                <div class="d-flex gap-2 mt-3">
                                    <button @click="viewTarget(item)" class="btn-action-outline">Ansehen</button>
                                    <button @click="openActionMenu(item)" class="btn-action-red">Bearbeiten</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="activeSection === 'USERS'" class="table-responsive">
                        <input v-model="userSearch" type="text" class="search-input mb-3"
                            placeholder="Nach Name oder E-Mail suchen...">
                        <table class="table align-middle">
                            <thead class="table-light text-muted small fw-bold">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>E-Mail</th>
                                    <th>Rolle</th>
                                    <th>Status</th>
                                    <th class="text-end">Aktion</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="u in filteredUsers" :key="u.id">
                                    <td class="text-muted small">#{{ u.id }}</td>
                                    <td class="fw-bold">
                                        <router-link :to="`/user/${u.oauthId}`" class="table-link">
                                            {{ u.firstName }} {{ u.lastName }}
                                        </router-link>
                                    </td>
                                    <td>{{ u.email }}</td>
                                    <td>
                                        <span class="badge bg-dark">{{ u.role }}</span>
                                    </td>
                                    <td>
                                        <span v-if="u.isDeleted" class="badge bg-danger">Gelöscht</span>
                                        <span v-else class="badge bg-success">Aktiv</span>
                                    </td>
                                    <td class="text-end d-flex gap-2 justify-content-end">
                                        <button v-if="userRole === 'ADMIN'" @click="openRoleMenu(u)"
                                            class="btn btn-sm btn-outline-primary fw-bold">Rolle</button>
                                        <button @click="openUserAction(u)"
                                            class="btn btn-sm btn-outline-dark fw-bold">Verwalten</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-if="activeSection === 'SUSPENSIONS'">
                        <input v-model="suspensionSearch" type="text" class="search-input mb-3"
                            placeholder="Nach Name oder E-Mail suchen...">
                        <div v-if="filteredSuspensions.length === 0"
                            class="text-muted p-4 bg-light rounded text-center border">Keine
                            gesperrten Nutzer.</div>
                        <div v-else class="table-responsive">
                            <table class="table align-middle">
                                <thead class="table-light text-muted small fw-bold">
                                    <tr>
                                        <th>Nutzer</th>
                                        <th>E-Mail</th>
                                        <th>Typ</th>
                                        <th>Grund</th>
                                        <th>Gesperrt bis</th>
                                        <th class="text-end">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="s in filteredSuspensions" :key="s.id">
                                        <td class="fw-bold">
                                            <router-link v-if="s.user?.oauthId" :to="`/user/${s.user.oauthId}`"
                                                class="table-link">
                                                {{ s.user?.firstName }} {{ s.user?.lastName }}
                                            </router-link>
                                            <span v-else>{{ s.user?.firstName }} {{ s.user?.lastName }}</span>
                                        </td>
                                        <td>{{ s.user?.email }}</td>
                                        <td>
                                            <span class="badge"
                                                :class="s.type === 'PERMANENT' ? 'bg-danger' : 'bg-warning text-dark'">
                                                {{ s.type === 'PERMANENT' ? 'Permanent' : 'Temporär' }}
                                            </span>
                                        </td>
                                        <td class="text-muted small" style="max-width:220px">{{ s.reason || '—' }}</td>
                                        <td class="small">{{ s.untilDate ? formatDate(s.untilDate) : 'Unbegrenzt' }}</td>
                                        <td class="text-end">
                                            <button @click="openSuspensionAction(s)"
                                                class="btn btn-sm btn-outline-dark fw-bold">Verwalten</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div v-if="activeSection === 'OFFERS'" class="table-responsive">
                        <input v-model="offerSearch" type="text" class="search-input mb-3"
                            placeholder="Nach Modul oder Tutor suchen...">
                        <table class="table align-middle">
                            <thead class="table-light text-muted small fw-bold">
                                <tr>
                                    <th>ID</th>
                                    <th>Modul</th>
                                    <th>Tutor</th>
                                    <th>Format</th>
                                    <th>Preis</th>
                                    <th class="text-end">Aktion</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="o in filteredOffers" :key="o.id">
                                    <td class="text-muted small">#{{ o.id }}</td>
                                    <td class="fw-bold">
                                        <router-link :to="`/offer/${o.id}`" class="table-link">{{ o.module
                                            }}</router-link>
                                    </td>
                                    <td>
                                        <router-link :to="`/user/${o.ownerOauthId}`" class="table-link fw-normal">{{
                                            o.ownerName
                                            }}</router-link>
                                    </td>
                                    <td>{{ getFormatLabel(o.format) }}</td>
                                    <td class="fw-bold">{{ o.price }} €</td>
                                    <td class="text-end">
                                        <button @click="openOfferAction(o)"
                                            class="btn btn-sm btn-outline-danger fw-bold">Löschen</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-if="activeSection === 'REVIEWS'">
                        <input v-model="reviewSearch" type="text" class="search-input mb-3"
                            placeholder="Nach Angebot, Tutor oder Kommentar suchen...">
                        <div v-if="filteredReviews.length === 0" class="text-muted p-4 bg-light rounded text-center border">
                            Keine Bewertungen vorhanden.</div>
                        <div v-else class="table-responsive">
                            <table class="table align-middle">
                                <thead class="table-light text-muted small fw-bold">
                                    <tr>
                                        <th>Angebot</th>
                                        <th>Tutor</th>
                                        <th>Sterne</th>
                                        <th>Kommentar</th>
                                        <th class="text-end">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="rv in filteredReviews" :key="rv.id">
                                        <td class="fw-bold">
                                            <router-link :to="`/offer/${rv.offerId}`" class="table-link">{{
                                                rv.offerModule
                                                }}</router-link>
                                        </td>
                                        <td>
                                            <router-link v-if="rv.offerOwnerOauthId"
                                                :to="`/user/${rv.offerOwnerOauthId}`" class="table-link fw-normal">{{
                                                    rv.offerOwnerName }}</router-link>
                                        </td>
                                        <td>
                                            <span class="badge"
                                                :class="rv.ratingStars <= 2 ? 'bg-danger' : rv.ratingStars === 3 ? 'bg-warning text-dark' : 'bg-success'">
                                                {{ rv.ratingStars }} ★
                                            </span>
                                        </td>
                                        <td class="text-muted small" style="max-width:260px">{{ rv.ratingComment || '—'
                                            }}</td>
                                        <td class="text-end">
                                            <button @click="deleteReview(rv)"
                                                class="btn btn-sm btn-outline-danger fw-bold">Löschen</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div v-if="activeSection === 'BOOKINGS'" class="table-responsive">
                        <input v-model="bookingSearch" type="text" class="search-input mb-3"
                            placeholder="Nach Student, Tutor oder Angebot suchen...">
                        <table class="table align-middle">
                            <thead class="table-light text-muted small fw-bold">
                                <tr>
                                    <th>ID</th>
                                    <th>Student</th>
                                    <th>Tutor</th>
                                    <th>Angebot</th>
                                    <th>Datum</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="b in filteredBookings" :key="b.id">
                                    <td class="text-muted small">#{{ b.id }}</td>
                                    <td class="fw-bold">
                                        <router-link :to="`/user/${b.studentOauthId}`" class="table-link">{{
                                            b.studentName
                                            }}</router-link>
                                    </td>
                                    <td class="fw-bold">
                                        <router-link :to="`/user/${b.tutorOauthId}`" class="table-link">{{ b.tutorName
                                            }}</router-link>
                                    </td>
                                    <td>
                                        <router-link v-if="b.offer" :to="`/offer/${b.offer.id}`"
                                            class="table-link fw-normal">{{
                                                b.offer.module }}</router-link>
                                    </td>
                                    <td class="small text-muted">{{ b.availability?.date ?
                                        formatDate(b.availability.date) : '—' }}</td>
                                    <td>
                                        <span class="badge bg-light border border-secondary text-dark">{{
                                            getStatusLabel(b.status)
                                            }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showActionMenu && !showBanMenu"
            class="modal-overlay d-flex justify-content-center align-items-center">
            <div class="custom-modal bg-white p-4 rounded-4 shadow-lg text-center">
                <h3 class="fw-bold text-dark mb-4 fs-4">Aktion auswählen</h3>
                <div class="d-flex flex-column gap-3">
                    <template v-if="activeSection === 'REPORTS'">
                        <button v-if="selectedTarget?.status === 'OPEN'" @click="executeToggleStatus('CLOSED')"
                            class="btn-modal-outline">Meldung abschließen</button>
                        <button v-if="selectedTarget?.status === 'CLOSED'" @click="executeToggleStatus('OPEN')"
                            class="btn-modal-outline">Meldung wieder öffnen</button>
                    </template>

                    <template v-if="selectedTarget?.targetType === 'USER'">
                        <button @click="showBanMenu = true" class="btn-modal-yellow mt-2">Benutzer sperren</button>
                        <button @click="executeUnban" class="btn-modal-green">Sperre aufheben</button>
                        <button v-if="!selectedTarget.isDeleted" @click="executeDelete" class="btn-modal-red">Benutzer
                            löschen</button>
                        <button v-else @click="executeRestore" class="btn-modal-green">Profil wiederherstellen</button>
                    </template>

                    <template v-if="selectedTarget?.targetType === 'OFFER'">
                        <button @click="executeDelete" class="btn-modal-red mt-2">Angebot endgültig löschen</button>
                    </template>

                    <button @click="closeModals" class="btn-modal-outline border-0 text-muted mt-2">Abbrechen</button>
                </div>
            </div>
        </div>

        <div v-if="showRoleMenu" class="modal-overlay d-flex justify-content-center align-items-center">
            <div class="custom-modal bg-white p-4 rounded-4 shadow-lg text-center">
                <h3 class="fw-bold text-dark mb-1 fs-4">Rolle ändern</h3>
                <p class="text-muted small mb-4">{{ selectedRoleUser?.firstName }} {{ selectedRoleUser?.lastName }}</p>
                <div class="d-flex flex-column gap-3">
                    <button @click="changeUserRole('ADMIN')" class="btn-modal-role"
                        :class="{ 'active-role': selectedRoleUser?.role === 'ADMIN' }">ADMIN</button>
                    <button @click="changeUserRole('MODERATOR')" class="btn-modal-role"
                        :class="{ 'active-role': selectedRoleUser?.role === 'MODERATOR' }">MODERATOR</button>
                    <button @click="changeUserRole('STUDENT')" class="btn-modal-role"
                        :class="{ 'active-role': selectedRoleUser?.role === 'STUDENT' }">STUDENT</button>
                    <button @click="closeRoleMenu" class="btn-modal-outline border-0 text-muted mt-2">Abbrechen</button>
                </div>
            </div>
        </div>

        <div v-if="showBanMenu" class="modal-overlay d-flex justify-content-center align-items-center">
            <div class="custom-modal bg-white p-4 rounded-4 shadow-lg text-start">
                <h3 class="fw-bold text-dark mb-4 fs-4 text-center">Benutzer sperren</h3>
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
                    <label class="fw-bold text-dark mb-2 fs-6 d-block">Grund für die Sperre</label>
                    <textarea v-model="banReason" class="form-control" rows="3"
                        placeholder="Verstoß gegen die Richtlinien..."></textarea>
                </div>
                <div class="d-flex flex-column gap-2">
                    <button @click="executeBan" class="btn-modal-yellow"
                        :disabled="!banReason || (banMode === 'TEMPORARY' && !banUntilDate)">Sperre vollziehen</button>
                    <button @click="closeModals" class="btn-modal-outline border-0 text-muted">Abbrechen</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.moderation-page-wrapper {
    background-color: #f7f4ed;
    padding-top: 40px;
    padding-bottom: 80px;
}

.content-wrapper-desktop {
    margin: 0 auto;
    max-width: 1000px;
}

.desktop-card {
    background-color: #ffffff;
    border: 1px solid #f0f0f0;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.tab-btn {
    background-color: transparent;
    border: 1px solid #424242;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    color: #424242;
    font-weight: 600;
    transition: all 0.2s;
}

.tab-btn.active {
    background-color: #2b487b;
    border-color: #2b487b;
    color: #ffffff;
}

.btn-subtab {
    background: none;
    border: none;
    padding: 0;
    font-size: 15px;
    font-weight: 600;
    color: #6c757d;
    transition: color 0.2s;
}

.btn-subtab.active-subtab {
    color: #d4a218;
    border-bottom: 2px solid #d4a218;
    padding-bottom: 2px;
}

.btn-action-outline {
    background-color: transparent;
    border: 1px solid #424242;
    border-radius: 8px;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #424242;
}

.btn-action-red {
    background-color: #dc3545;
    border: 1px solid #c82333;
    border-radius: 8px;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 600;
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

.table-link {
    color: #111827;
    text-decoration: none;
    transition: opacity 0.2s, text-decoration 0.2s;
}

.table-link:hover {
    opacity: 0.7;
    text-decoration: underline;
}

.search-input {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    width: 100%;
    max-width: 360px;
    outline: none;
    box-shadow: none;
    display: block;
}

.search-input:focus {
    outline: none;
    box-shadow: none;
    border-color: #adb5bd;
}

.btn-modal-role {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background-color: #f8f9fa;
    color: #111827;
    font-weight: bold;
    border: 1px solid #dee2e6;
    transition: all 0.15s;
}

.btn-modal-role:hover {
    background-color: #e9ecef;
}

.btn-modal-role.active-role {
    background-color: #2b487b;
    color: white;
    border-color: #2b487b;
}
</style>