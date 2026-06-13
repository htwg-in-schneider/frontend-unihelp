<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const router = useRouter();
const { getAccessTokenSilently } = useAuth0();

const activeTab = ref('reports');
const statusFilter = ref('OPEN');
const isLoading = ref(true);

const showActionMenu = ref(false);
const showBanMenu = ref(false);
const selectedTarget = ref(null);

const banMode = ref('PERMANENT');
const banUntilDate = ref('');
const banHours = ref(24);
const banMinutes = ref(1);
const banReason = ref('');

const reports = ref([]);

const filteredReports = computed(() => {
    return reports.value.filter(r =>
        (r.status || 'OPEN').toLowerCase() === statusFilter.value.toLowerCase()
    ).filter(r => {
        if (activeTab.value === 'offers') return r.targetType === 'OFFER';
        if (activeTab.value === 'users') return r.targetType === 'USER';
        return true;
    });
});

onMounted(async () => {
    await loadReports();
});

function parseDate(createdAt) {
    if (!createdAt) return 'Heute';
    let d;
    if (Array.isArray(createdAt)) {
        d = new Date(createdAt[0], createdAt[1] - 1, createdAt[2], createdAt[3] || 0, createdAt[4] || 0);
    } else {
        d = new Date(createdAt);
    }
    return isNaN(d) ? 'Heute' : d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    let d;
    if (Array.isArray(dateStr)) {
        d = new Date(dateStr[0], dateStr[1] - 1, dateStr[2], dateStr[3] || 0, dateStr[4] || 0);
    } else {
        d = new Date(dateStr);
    }
    return isNaN(d) ? '' : d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}

async function loadReports() {
    try {
        const token = await getAccessTokenSilently();

        const [reportsRes, offersRes, usersRes, suspensionsRes] = await Promise.all([
            fetch('http://localhost:8081/api/moderation/reports', { headers: { Authorization: `Bearer ${token}` } }),
            fetch('http://localhost:8081/api/offer'),
            fetch('http://localhost:8081/api/moderation/users', { headers: { Authorization: `Bearer ${token}` } }),
            fetch('http://localhost:8081/api/moderation/suspensions', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const rawReports = reportsRes.ok ? await reportsRes.json() : [];
        const offers = offersRes.ok ? await offersRes.json() : [];
        const users = usersRes.ok ? await usersRes.json() : [];
        const suspensions = suspensionsRes.ok ? await suspensionsRes.json() : [];

        const grouped = {};
        rawReports.forEach(r => {
            const key = `${r.targetType}_${r.targetId}`;
            if (!grouped[key]) {
                let name = `ID: ${r.targetId}`;
                let ownerName = '';
                let activeSuspension = null;
                let isUserDeleted = false;

                if (r.targetType === 'OFFER') {
                    const offer = offers.find(o => String(o.id) === String(r.targetId));
                    if (offer) {
                        name = offer.module || offer.course || 'Angebot';
                        ownerName = offer.ownerName || 'Unbekannter Tutor';
                    } else {
                        name = `Gelöschtes Angebot (${r.targetId})`;
                    }
                } else if (r.targetType === 'USER') {
                    const u = users.find(user => String(user.id) === String(r.targetId));
                    if (u) {
                        let fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
                        name = fullName || u.username || u.email || `Nutzer ${u.id}`;
                        isUserDeleted = u.isDeleted === true;
                    } else {
                        name = `Nutzer ID: ${r.targetId}`;
                    }

                    activeSuspension = suspensions.find(s => s.user && String(s.user.id) === String(r.targetId));
                }

                grouped[key] = {
                    id: r.id,
                    targetType: r.targetType,
                    targetId: r.targetId,
                    title: name,
                    owner: ownerName,
                    count: 0,
                    status: r.status || 'OPEN',
                    time: parseDate(r.createdAt),
                    suspension: activeSuspension,
                    isDeleted: isUserDeleted
                };
            }
            grouped[key].count++;
        });

        reports.value = Object.values(grouped);
    } catch (error) {
    } finally {
        isLoading.value = false;
    }
}

function viewTarget(item) {
    if (item.targetType === 'OFFER') {
        router.push(`/offer/${item.targetId}`);
    }
}

function openActionMenu(item) {
    selectedTarget.value = item;
    showActionMenu.value = true;
}

function closeModals() {
    showActionMenu.value = false;
    showBanMenu.value = false;
    banMode.value = 'PERMANENT';
    banReason.value = '';
    banUntilDate.value = '';
    banHours.value = 24;
    banMinutes.value = 1;
}

async function executeToggleStatus(newStatus) {
    if (!selectedTarget.value) return;
    try {
        const token = await getAccessTokenSilently();
        const endpoint = newStatus === 'CLOSED' ? 'close' : 'open';

        await fetch(`http://localhost:8081/api/moderation/reports/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                targetType: selectedTarget.value.targetType,
                targetId: selectedTarget.value.targetId
            })
        });

        await loadReports();
        closeModals();
    } catch (e) {
    }
}

async function executeDelete() {
    if (!selectedTarget.value) return;
    try {
        const token = await getAccessTokenSilently();
        const isUser = selectedTarget.value.targetType === 'USER';
        const url = isUser
            ? `http://localhost:8081/api/moderation/user/${selectedTarget.value.targetId}/delete`
            : `http://localhost:8081/api/moderation/offer/${selectedTarget.value.targetId}`;

        await fetch(url, {
            method: isUser ? 'POST' : 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        await loadReports();
        closeModals();
    } catch (e) {
    }
}

async function executeRestore() {
    if (!selectedTarget.value || selectedTarget.value.targetType !== 'USER') return;
    try {
        const token = await getAccessTokenSilently();
        await fetch(`http://localhost:8081/api/moderation/user/${selectedTarget.value.targetId}/restore`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });

        await loadReports();
        closeModals();
    } catch (e) {
    }
}

async function executeBan() {
    if (!banReason.value) return;

    try {
        const token = await getAccessTokenSilently();

        let finalUntilDate = null;
        if (banMode.value === 'DATE') {
            finalUntilDate = banUntilDate.value;
        } else if (banMode.value === 'HOURS') {
            const tzoffset = (new Date()).getTimezoneOffset() * 60000;
            finalUntilDate = new Date(Date.now() - tzoffset + (banHours.value * 3600000)).toISOString().slice(0, 16);
        } else if (banMode.value === 'MINUTES') {
            const tzoffset = (new Date()).getTimezoneOffset() * 60000;
            finalUntilDate = new Date(Date.now() - tzoffset + (banMinutes.value * 60000)).toISOString().slice(0, 16);
        }

        const payload = {
            type: banMode.value === 'PERMANENT' ? 'PERMANENT' : 'TEMPORARY',
            reason: banReason.value,
            untilDate: finalUntilDate
        };

        await fetch(`http://localhost:8081/api/moderation/user/${selectedTarget.value.targetId}/ban`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        await loadReports();
        closeModals();
    } catch (e) {
    }
}

async function executeUnban() {
    if (!selectedTarget.value || selectedTarget.value.targetType !== 'USER') return;
    try {
        const token = await getAccessTokenSilently();
        await fetch(`http://localhost:8081/api/moderation/user/${selectedTarget.value.targetId}/unban`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });

        await loadReports();
        closeModals();
    } catch (e) {
    }
}
</script>

<template>
    <div class="moderation-page-wrapper">
        <div class="container content-wrapper-desktop">
            <div class="mobile-card desktop-card position-relative text-start">
                <div class="d-flex gap-2 mb-3 justify-content-center justify-content-md-start">
                    <button @click="activeTab = 'reports'" class="tab-btn"
                        :class="{ 'active': activeTab === 'reports' }">Alle</button>
                    <button @click="activeTab = 'offers'" class="tab-btn"
                        :class="{ 'active': activeTab === 'offers' }">Angebote</button>
                    <button @click="activeTab = 'users'" class="tab-btn"
                        :class="{ 'active': activeTab === 'users' }">Nutzer</button>
                </div>

                <div class="d-flex gap-3 mb-4 border-bottom pb-3 filter-row">
                    <button @click="statusFilter = 'OPEN'" class="btn-subtab"
                        :class="{ 'active-subtab': statusFilter === 'OPEN' }">Offene Meldungen</button>
                    <button @click="statusFilter = 'CLOSED'" class="btn-subtab"
                        :class="{ 'active-subtab': statusFilter === 'CLOSED' }">Abgeschlossen</button>
                </div>

                <p class="text-muted fw-bold mb-3 px-1">{{ filteredReports.length }} {{ statusFilter === 'OPEN' ?
                    'offene' : 'abgeschlossene' }} Einträge</p>

                <div v-if="isLoading" class="text-center py-5">
                    <div class="spinner-border text-warning" role="status"></div>
                </div>

                <div v-else class="d-flex flex-column gap-3">
                    <div v-for="item in filteredReports" :key="item.id"
                        class="report-card bg-white rounded-4 shadow-sm border p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <div class="fw-bold text-dark fs-5 lh-1 mb-1">
                                    {{ item.targetType === 'OFFER' ? 'Angebot:' : 'Nutzer:' }} "{{ item.title }}"
                                </div>
                                <div v-if="item.owner" class="text-secondary small fw-bold mb-1">
                                    von {{ item.owner }}
                                </div>
                                <div class="text-muted small mb-2">
                                    {{ item.targetType === 'OFFER' ? 'Gemeldet von' : '' }} {{ item.count }} {{
                                        item.targetType === 'OFFER' ? (item.count === 1 ? 'Nutzer' : 'Nutzern') :
                                            (item.count === 1 ? 'Aktivität' : 'Aktivitäten') }} · {{ item.time }}
                                </div>
                                <div v-if="item.suspension" class="mb-2">
                                    <span v-if="item.suspension.type === 'PERMANENT'" class="badge bg-dark">Permanent
                                        gesperrt</span>
                                    <span v-else class="badge bg-secondary">Gesperrt bis {{
                                        formatDateTime(item.suspension.untilDate) }}</span>
                                </div>
                                <div v-if="item.isDeleted" class="mb-2">
                                    <span class="badge bg-danger">Profil gelöscht</span>
                                </div>
                            </div>
                            <span class="badge rounded-pill px-3 py-1"
                                :class="item.targetType === 'OFFER' ? 'bg-danger' : 'bg-warning text-dark'">
                                {{ item.count }} {{ item.targetType === 'OFFER' ? (item.count === 1 ? 'Meldung' :
                                    'Meldungen') : 'Spam' }}
                            </span>
                        </div>
                        <div class="d-flex gap-2 mt-3">
                            <button v-if="item.targetType === 'OFFER'" @click="viewTarget(item)"
                                class="btn-action-outline">Ansehen</button>
                            <button @click="openActionMenu(item)" class="btn-action-red">Aktion</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showActionMenu && !showBanMenu"
            class="modal-overlay d-flex justify-content-center align-items-center">
            <div class="custom-modal bg-white p-4 rounded-4 shadow-lg text-center">
                <h3 class="fw-bold text-dark mb-4 fs-4">Aktion auswählen</h3>
                <div class="d-flex flex-column gap-3">
                    <button v-if="selectedTarget?.status === 'OPEN'" @click="executeToggleStatus('CLOSED')"
                        class="btn-modal-outline">Meldung abschließen</button>
                    <button v-if="selectedTarget?.status === 'CLOSED'" @click="executeToggleStatus('OPEN')"
                        class="btn-modal-outline">Meldung wieder öffnen</button>

                    <template v-if="selectedTarget?.targetType === 'USER'">
                        <button v-if="!selectedTarget.suspension" @click="showBanMenu = true"
                            class="btn-modal-yellow mt-2">Benutzer sperren</button>
                        <button v-else @click="executeUnban" class="btn-modal-green mt-2">Sperre aufheben</button>

                        <button v-if="!selectedTarget.isDeleted" @click="executeDelete" class="btn-modal-red">Benutzer
                            löschen</button>
                        <button v-else @click="executeRestore" class="btn-modal-green">Profil wiederherstellen</button>
                    </template>

                    <template v-if="selectedTarget?.targetType === 'OFFER'">
                        <button @click="executeDelete" class="btn-modal-red mt-2">Angebot löschen</button>
                    </template>

                    <button @click="closeModals" class="btn-modal-outline border-0 text-muted mt-2">Abbrechen</button>
                </div>
            </div>
        </div>

        <div v-if="showBanMenu" class="modal-overlay d-flex justify-content-center align-items-center">
            <div class="custom-modal bg-white p-4 rounded-4 shadow-lg text-start">
                <h3 class="fw-bold text-dark mb-4 fs-4 text-center">Dauer der Sperre</h3>

                <div class="mb-3">
                    <select v-model="banMode" class="form-select form-select-lg border-secondary mb-3">
                        <option value="PERMANENT">Permanent sperren</option>
                        <option value="DATE">Bis Datum/Uhrzeit sperren</option>
                        <option value="HOURS">Für Stunden sperren</option>
                        <option value="MINUTES">Für Minuten sperren</option>
                    </select>
                </div>

                <div v-if="banMode === 'DATE'" class="mb-3">
                    <input type="datetime-local" v-model="banUntilDate"
                        class="form-control form-control-lg border-secondary">
                </div>

                <div v-if="banMode === 'HOURS'" class="mb-3">
                    <input type="number" v-model="banHours" min="1"
                        class="form-control form-control-lg border-secondary" placeholder="Anzahl Stunden">
                </div>

                <div v-if="banMode === 'MINUTES'" class="mb-3">
                    <input type="number" v-model="banMinutes" min="1"
                        class="form-control form-control-lg border-secondary" placeholder="Anzahl Minuten">
                </div>

                <div class="mb-4">
                    <label class="fw-bold text-dark mb-2 fs-6">Grund</label>
                    <textarea v-model="banReason" class="form-control textarea-custom" rows="3"
                        placeholder="Falsche Versprechen..."></textarea>
                </div>
                <div class="d-flex flex-column gap-2">
                    <button @click="executeBan" class="btn-modal-yellow"
                        :disabled="!banReason || (banMode === 'DATE' && !banUntilDate) || (banMode === 'HOURS' && !banHours) || (banMode === 'MINUTES' && !banMinutes)">Benutzer
                        sperren</button>
                    <button @click="closeModals" class="btn-modal-outline border-0 text-muted">Abbrechen</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.moderation-page-wrapper {
    background-color: #f7f4ed;
    min-height: 100vh;
    padding-top: 60px;
    padding-bottom: 80px;
}

.content-wrapper-desktop {
    margin: 0 auto;
    max-width: 800px;
}

@media (max-width: 767px) {
    .content-wrapper-desktop {
        max-width: 500px;
    }
}

@media (min-width: 768px) {
    .moderation-page-wrapper {
        padding-top: 80px;
    }

    .content-wrapper-desktop {
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
    background-color: #f2f4f6;
    border-color: #111827;
    color: #111827;
}

.filter-row {
    padding-left: 5px;
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

.btn-subtab:hover {
    color: #111827;
}

.btn-subtab.active-subtab {
    color: #d4a218;
    border-bottom: 2px solid #d4a218;
    padding-bottom: 2px;
}

.report-card {
    border-color: #e0dcd5 !important;
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

.textarea-custom {
    border-color: #cccccc;
    resize: none;
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

.btn-modal-green {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background-color: #28a745;
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

.btn-modal-yellow:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
