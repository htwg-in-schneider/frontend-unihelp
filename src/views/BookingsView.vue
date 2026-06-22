<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { useToast } from '../composables/useToast.js';

const router = useRouter();
const { success, error } = useToast();
const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

const activeTab = ref('student');
const isLoading = ref(true);
const cancelConfirmId = ref(null);

const studentBookings = ref({ upcoming: [], past: [] });
const tutorBookings = ref({ upcoming: [], past: [] });

const showReportModal = ref(false);
const reportTarget = ref(null);
const reportReason = ref('');

onMounted(async () => {
    if (isAuthenticated.value) {
        await loadBookings();
    } else {
        isLoading.value = false;
    }
});

async function loadBookings() {
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booking`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Fehler beim Laden der Buchungen');

        const allBookings = await response.json();
        const now = new Date();

        studentBookings.value = { upcoming: [], past: [] };
        tutorBookings.value = { upcoming: [], past: [] };

        allBookings.forEach(b => {
            const bookingDate = new Date(`${b.availability.date}T${b.availability.startTime}`);
            const isPast = bookingDate < now;
            const isStudent = b.studentOauthId === user.value?.sub;
            const isTutor = b.tutorOauthId === user.value?.sub;

            const tName = b.tutorName || 'Tutor';
            const sName = b.studentName || 'Student';

            const formattedBooking = {
                id: b.id,
                status: b.status,
                date: bookingDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: b.availability.startTime.substring(0, 5),
                subject: b.offer.module,
                uni: b.offer.university,
                tutorName: tName,
                studentName: sName,
                tutorOauthId: b.tutorOauthId,
                studentOauthId: b.studentOauthId,
                initials: isStudent ? getInitials(tName) : getInitials(sName),
                message: b.messageToTutor
            };

            if (isStudent) {
                isPast ? studentBookings.value.past.push(formattedBooking) : studentBookings.value.upcoming.push(formattedBooking);
            }
            if (isTutor) {
                isPast ? tutorBookings.value.past.push(formattedBooking) : tutorBookings.value.upcoming.push(formattedBooking);
            }
        });
    } catch (error) {
    } finally {
        isLoading.value = false;
    }
}

function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

function setTab(tab) { activeTab.value = tab; }
function payBooking(id) { router.push(`/payment/${id}`); }
function rateBooking(id) { router.push(`/rate/${id}`); }

async function cancelBooking(id) {
    if (cancelConfirmId.value !== id) {
        cancelConfirmId.value = id;
        return;
    }
    try {
        const token = await getAccessTokenSilently();
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booking/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        cancelConfirmId.value = null;
        await loadBookings();
        success('Buchung erfolgreich storniert.');
    } catch (e) {
        error('Stornierung fehlgeschlagen. Bitte versuche es erneut.');
    }
}

function chatWithUser(partnerId, partnerName) {
    router.push({ path: `/chat/${partnerId}`, query: { name: partnerName } });
}

function openReportModal(oauthId, name) {
    reportTarget.value = { oauthId, name };
    reportReason.value = '';
    showReportModal.value = true;
}

async function submitReport() {
    if (!reportTarget.value || !reportReason.value.trim()) return;
    try {
        const token = await getAccessTokenSilently();
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/moderation/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                targetType: 'USER',
                targetOauthId: reportTarget.value.oauthId,
                reason: reportReason.value.trim()
            })
        });
        showReportModal.value = false;
        reportTarget.value = null;
        reportReason.value = '';
        success('Nutzer wurde gemeldet.');
    } catch (e) {
        error('Melden fehlgeschlagen. Bitte versuche es erneut.');
    }
}
</script>

<template>
    <div class="bookings-wrapper">
        <div class="container py-4 py-lg-5 bookings-container">

            <div class="d-flex gap-2 mb-4 justify-content-center justify-content-md-start px-2 mt-tab-btn">
                <button @click="setTab('student')" class="tab-btn" :class="activeTab === 'student' ? 'active' : ''">Als
                    Student</button>
                <button @click="setTab('tutor')" class="tab-btn" :class="activeTab === 'tutor' ? 'active' : ''">Als
                    Tutor</button>
            </div>

            <hr class="mb-4 border-secondary opacity-25">

            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-warning" role="status"></div>
            </div>

            <div v-else>
                <div v-if="activeTab === 'student'">
                    <h6 class="section-heading mb-3 px-2">ANSTEHEND</h6>
                    <div class="d-flex flex-column gap-3 mb-5 px-2">
                        <div v-if="studentBookings.upcoming.length === 0"
                            class="bg-white rounded-4 shadow-sm border p-4 text-center text-muted">
                            Keine anstehenden Buchungen.
                        </div>
                        <div v-for="booking in studentBookings.upcoming" :key="booking.id"
                            class="booking-card bg-white rounded-4 shadow-sm border p-3 d-flex justify-content-between align-items-center">

                            <router-link :to="`/user/${booking.tutorOauthId}`"
                                class="text-decoration-none d-flex align-items-start gap-3 profile-link">
                                <div class="avatar-circle text-dark mt-1">{{ booking.initials }}</div>
                                <div>
                                    <div class="fw-bold text-dark mb-0 lh-1 hover-underline">{{ booking.tutorName }}
                                    </div>
                                    <div class="text-dark small mt-1 lh-sm mb-2">{{ booking.subject }} · {{ booking.uni
                                    }}<br>{{ booking.date }} · {{ booking.time }} Uhr</div>

                                    <div v-if="booking.message" class="booking-msg-box p-2 rounded">
                                        "{{ booking.message }}"
                                    </div>
                                </div>
                            </router-link>

                            <div class="d-flex flex-column align-items-end gap-2">
                                <button v-if="booking.status === 'PAID'" class="btn-paid" disabled>BEZAHLT</button>
                                <button v-else-if="booking.status === 'RATED'" class="btn-paid"
                                    disabled>BEWERTET</button>
                                <button v-else class="btn-pay-disabled" disabled>BEZAHLEN</button>

                                <div class="d-flex gap-2">
                                    <button @click="chatWithUser(booking.tutorOauthId, booking.tutorName)"
                                        class="btn-chat">Chatten</button>

                                    <div v-if="cancelConfirmId === booking.id" class="d-flex gap-1">
                                        <button @click="cancelBooking(booking.id)" class="btn-confirm-yes">Ja?</button>
                                        <button @click="cancelConfirmId = null" class="btn-confirm-no">Nein</button>
                                    </div>
                                    <button v-else @click="cancelBooking(booking.id)"
                                        class="btn-cancel">Stornieren</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h6 class="section-heading mt-4 mb-3 px-2">VERGANGEN</h6>
                    <div class="d-flex flex-column gap-3 px-2">
                        <div v-if="studentBookings.past.length === 0"
                            class="bg-white rounded-4 shadow-sm border p-4 text-center text-muted">
                            Keine vergangenen Buchungen.
                        </div>
                        <div v-for="booking in studentBookings.past" :key="booking.id"
                            class="booking-card bg-white rounded-4 shadow-sm border p-3 d-flex justify-content-between align-items-center">

                            <router-link :to="`/user/${booking.tutorOauthId}`"
                                class="text-decoration-none d-flex align-items-start gap-3 profile-link">
                                <div class="avatar-circle text-dark mt-1">{{ booking.initials }}</div>
                                <div>
                                    <div class="fw-bold text-dark mb-0 lh-1 hover-underline">{{ booking.tutorName }}
                                    </div>
                                    <div class="text-dark small mt-1 lh-sm mb-2">{{ booking.subject }} · {{ booking.uni
                                    }}<br>{{ booking.date }} · {{ booking.time }} Uhr</div>

                                    <div v-if="booking.message" class="booking-msg-box p-2 rounded">
                                        "{{ booking.message }}"
                                    </div>
                                </div>
                            </router-link>

                            <div class="d-flex flex-column align-items-end gap-2">
                                <button v-if="booking.status === 'PAID'" @click="rateBooking(booking.id)"
                                    class="btn-pay btn-pay-rate">BEWERTEN</button>
                                <button v-else-if="booking.status === 'RATED'" class="btn-paid"
                                    disabled>BEWERTET</button>
                                <button v-else @click="payBooking(booking.id)" class="btn-pay">BEZAHLEN</button>
                                <div class="d-flex gap-2 align-items-center">
                                    <button @click="chatWithUser(booking.tutorOauthId, booking.tutorName)"
                                        class="btn-chat">Chatten</button>
                                    <button @click="openReportModal(booking.tutorOauthId, booking.tutorName)"
                                        class="btn-report">Melden</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else>
                    <h6 class="section-heading mb-3 px-2">ANSTEHEND</h6>
                    <div class="d-flex flex-column gap-3 mb-5 px-2">
                        <div v-if="tutorBookings.upcoming.length === 0"
                            class="bg-white rounded-4 shadow-sm border p-4 text-center text-muted">
                            Du hast keine anstehenden Termine als Tutor.
                        </div>
                        <div v-for="booking in tutorBookings.upcoming" :key="booking.id"
                            class="booking-card bg-white rounded-4 shadow-sm border p-3 d-flex justify-content-between align-items-center">

                            <router-link :to="`/user/${booking.studentOauthId}`"
                                class="text-decoration-none d-flex align-items-start gap-3 profile-link">
                                <div class="avatar-circle text-dark mt-1">{{ booking.initials }}</div>
                                <div>
                                    <div class="fw-bold text-dark mb-0 lh-1 hover-underline">{{ booking.studentName }}
                                    </div>
                                    <div class="text-dark small mt-1 lh-sm mb-2">{{ booking.subject }} · {{ booking.uni
                                    }}<br>{{ booking.date }} · {{ booking.time }} Uhr</div>

                                    <div v-if="booking.message" class="booking-msg-box p-2 rounded">
                                        "{{ booking.message }}"
                                    </div>
                                </div>
                            </router-link>

                            <div class="d-flex flex-column align-items-end gap-2">
                                <button v-if="booking.status === 'PAID' || booking.status === 'RATED'"
                                    class="btn-paid btn-paid-tutor" disabled>BEZAHLT</button>
                                <button v-else class="btn-cancel btn-cancel-open" disabled>OFFEN</button>

                                <div class="d-flex gap-2 mt-auto">
                                    <button @click="chatWithUser(booking.studentOauthId, booking.studentName)"
                                        class="btn-chat">Chatten</button>
                                    <div v-if="cancelConfirmId === booking.id" class="d-flex gap-1">
                                        <button @click="cancelBooking(booking.id)" class="btn-confirm-yes">Ja?</button>
                                        <button @click="cancelConfirmId = null" class="btn-confirm-no">Nein</button>
                                    </div>
                                    <button v-else @click="cancelBooking(booking.id)"
                                        class="btn-cancel">Stornieren</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h6 class="section-heading mt-4 mb-3 px-2">VERGANGEN</h6>
                    <div class="d-flex flex-column gap-3 px-2">
                        <div v-if="tutorBookings.past.length === 0"
                            class="bg-white rounded-4 shadow-sm border p-4 text-center text-muted">
                            Keine vergangenen Termine.
                        </div>
                        <div v-for="booking in tutorBookings.past" :key="booking.id"
                            class="booking-card bg-white rounded-4 shadow-sm border p-3 d-flex justify-content-between align-items-center">

                            <router-link :to="`/user/${booking.studentOauthId}`"
                                class="text-decoration-none d-flex align-items-start gap-3 profile-link">
                                <div class="avatar-circle text-dark mt-1">{{ booking.initials }}</div>
                                <div>
                                    <div class="fw-bold text-dark mb-0 lh-1 hover-underline">{{ booking.studentName }}
                                    </div>
                                    <div class="text-dark small mt-1 lh-sm mb-2">{{ booking.subject }} · {{ booking.uni
                                    }}<br>{{ booking.date }} · {{ booking.time }} Uhr</div>

                                    <div v-if="booking.message" class="booking-msg-box p-2 rounded">
                                        "{{ booking.message }}"
                                    </div>
                                </div>
                            </router-link>

                            <div class="d-flex flex-column align-items-end gap-2">
                                <button v-if="booking.status === 'PAID' || booking.status === 'RATED'" class="btn-paid"
                                    disabled>BEZAHLT</button>
                                <div class="d-flex gap-2 mt-auto align-items-center">
                                    <button @click="chatWithUser(booking.studentOauthId, booking.studentName)"
                                        class="btn-chat">Chatten</button>
                                    <button @click="openReportModal(booking.studentOauthId, booking.studentName)"
                                        class="btn-report">Melden</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showReportModal" class="modal-overlay d-flex justify-content-center align-items-center">
            <div class="custom-modal bg-white p-4 rounded-4 shadow-lg text-start">
                <h3 class="fw-bold text-dark mb-1 fs-4 text-center">Nutzer melden</h3>
                <p class="text-muted small text-center mb-4">{{ reportTarget?.name }}</p>
                <div class="mb-4">
                    <textarea v-model="reportReason" class="form-control" rows="3"
                        placeholder="z.B. Unangemessenes Verhalten, Betrug..."></textarea>
                </div>
                <div class="d-flex flex-column gap-2">
                    <button @click="submitReport" class="btn-report-submit"
                        :disabled="!reportReason.trim()">Melden</button>
                    <button @click="showReportModal = false" class="btn-report-cancel">Abbrechen</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.section-heading {
    color: #d4a218;
    font-weight: 800;
    letter-spacing: 0.5px;
    font-size: 15px;
}

.mt-tab-btn {
    margin-top: 50px;
}

.tab-btn {
    background-color: transparent;
    border: 1px solid #424242;
    border-radius: 8px;
    padding: 6px 16px;
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

.booking-card {
    border-color: #e0dcd5 !important;
}

.booking-msg-box {
    background-color: #f2f4f6;
    border: 1px solid #e0dcd5;
    color: #424242;
    font-size: 12px;
    line-height: 1.4;
    max-width: 250px;
}

.avatar-circle {
    width: 45px;
    height: 45px;
    background-color: #e0e0e0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: #333;
    flex-shrink: 0;
}

.btn-pay {
    background-color: #fcdb39;
    color: #111827;
    border: 1px solid #424242;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
    padding: 6px 18px;
    cursor: pointer;
    transition: opacity 0.2s;
}

.btn-pay:hover {
    opacity: 0.85;
}

.btn-pay-disabled {
    background-color: #e0e0e0;
    color: #888888;
    border: 1px solid #cccccc;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
    padding: 6px 18px;
    cursor: not-allowed;
    opacity: 0.7;
}

.btn-paid {
    background-color: #5edb39;
    color: #111827;
    border: 1px solid #4cae2d;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
    padding: 6px 18px;
    cursor: default;
}

.btn-paid-tutor {
    background-color: #5edb39;
    border-color: #4cae2d;
}

.btn-pay-rate {
    background-color: #fcdb39;
}

.btn-cancel-open {
    border-color: #dcdcdc;
    color: #a0a0a0;
    cursor: default;
}

.btn-chat {
    background-color: transparent;
    color: #424242;
    border: 1px solid #a0a0a0;
    border-radius: 14px;
    font-size: 12px;
    padding: 4px 12px;
    cursor: pointer;
}

.btn-chat:hover {
    background-color: #f0f0f0;
}

.btn-cancel {
    background-color: transparent;
    color: #6c757d;
    border: 1px solid #ced4da;
    border-radius: 14px;
    font-size: 12px;
    padding: 4px 12px;
    cursor: pointer;
}

.btn-confirm-yes {
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 11px;
    padding: 4px 8px;
    font-weight: bold;
}

.btn-confirm-no {
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 11px;
    padding: 4px 8px;
    font-weight: bold;
}

.btn-report {
    background-color: #e32828;
    color: #ffffff;
    border: 1px solid #c41e1e;
    border-radius: 14px;
    font-size: 12px;
    padding: 4px 12px;
    cursor: pointer;
}

.bookings-wrapper {
    padding-bottom: 80px;
    background-color: #f7f4ed;
    min-height: 100vh;
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

.btn-report-submit {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background-color: #dc3545;
    color: white;
    font-weight: bold;
    border: none;
}

.btn-report-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-report-cancel {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background-color: transparent;
    border: 1px solid #424242;
    font-weight: bold;
    color: #6c757d;
}

.bookings-container {
    max-width: 800px;
}

.profile-link {
    transition: opacity 0.2s ease;
}

.profile-link:hover {
    opacity: 0.85;
}

.hover-underline {
    position: relative;
    display: inline-block;
}

.profile-link:hover .hover-underline::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #111827;
}

@media (max-width: 400px) {
    .avatar-circle {
        display: none;
    }
}
</style>
