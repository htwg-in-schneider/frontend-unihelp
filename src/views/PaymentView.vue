<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { useToast } from '../composables/useToast.js';

const router = useRouter();
const route = useRoute();
const { getAccessTokenSilently } = useAuth0();
const { success, error: showError } = useToast();

const selectedMethod = ref('paypal');
const isProcessing = ref(false);
const isLoading = ref(true);

const bookingDetails = ref({
    price: 0,
    tutorName: '',
    subject: '',
    date: '',
    initials: ''
});

onMounted(async () => {
    await loadBookingData();
});

async function loadBookingData() {
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booking`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Fehler beim Laden der Buchung');

        const allBookings = await response.json();
        const bookingId = parseInt(route.params.id);
        const booking = allBookings.find(b => b.id === bookingId);

        if (booking) {
            const bDate = new Date(booking.availability.date);
            const tName = booking.tutorName || 'Tutor';

            bookingDetails.value = {
                price: booking.offer.price || 0,
                tutorName: tName,
                subject: booking.offer.module,
                date: bDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }),
                initials: getInitials(tName)
            };
        } else {
            router.push('/bookings');
        }
    } catch (error) {
        console.error('Fehler:', error);
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

async function processPayment() {
    isProcessing.value = true;

    try {
        const token = await getAccessTokenSilently();
        const bookingId = route.params.id;

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booking/${bookingId}/pay`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ paymentMethod: selectedMethod.value })
        });

        if (!response.ok) throw new Error('Zahlung fehlgeschlagen');

        success('Zahlung erfolgreich abgeschlossen.');
        router.push('/bookings');
    } catch (e) {
        console.error('Fehler:', e);
        showError('Zahlung fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
        isProcessing.value = false;
    }
}
</script>

<template>
    <div class="container py-4 content-wrapper-desktop">
        <div class="text-start mobile-card desktop-card">

            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-warning" role="status"></div>
            </div>

            <div v-else>
                <div class="mb-4">
                    <div class="yellow-label mb-2">ZU BEZAHLEN</div>
                    <div class="bg-white rounded-3 border py-4 d-flex flex-column align-items-center payment-summary-box">

                        <div class="d-flex align-items-baseline mb-4">
                            <span class="fw-bold text-dark me-1 price-currency">€</span>
                            <span class="fw-bold text-dark lh-1 price-amount">{{
                                bookingDetails.price.toFixed(2).replace('.', ',') }}</span>
                            <span class="text-muted ms-2 fw-bold price-label">/ einmalig</span>
                        </div>

                        <div class="d-flex align-items-center gap-3">
                            <div class="avatar-circle">{{ bookingDetails.initials }}</div>
                            <div class="text-start">
                                <div class="fw-bold text-dark mb-0 tutor-name">{{
                                    bookingDetails.tutorName }}</div>
                                <div class="text-muted fw-bold booking-details">{{ bookingDetails.subject }}
                                    -
                                    {{ bookingDetails.date }}</div>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="mb-4">
                    <div class="yellow-label mb-2">ZAHLUNGSMETHODE</div>

                    <div class="d-flex flex-column gap-2">

                        <label
                            class="payment-method-card bg-white rounded-3 border p-3 d-flex justify-content-between align-items-center"
                            :class="{ 'selected-method': selectedMethod === 'paypal' }">
                            <div class="d-flex align-items-center gap-3">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                                    alt="PayPal Logo" class="method-logo">
                                <span class="fw-bold fs-5 text-dark">PayPal</span>
                            </div>
                            <input type="radio" value="paypal" v-model="selectedMethod" name="payment"
                                class="custom-radio">
                        </label>

                        <label
                            class="payment-method-card bg-white rounded-3 border p-3 d-flex justify-content-between align-items-center"
                            :class="{ 'selected-method': selectedMethod === 'bitcoin' }">
                            <div class="d-flex align-items-center gap-3">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg"
                                    alt="Bitcoin Logo" class="method-logo">
                                <span class="fw-bold fs-5 text-dark">BitCoin</span>
                            </div>
                            <input type="radio" value="bitcoin" v-model="selectedMethod" name="payment"
                                class="custom-radio">
                        </label>

                        <label
                            class="payment-method-card bg-white rounded-3 border p-3 d-flex justify-content-between align-items-center"
                            :class="{ 'selected-method': selectedMethod === 'sepa' }">
                            <div class="d-flex align-items-center gap-3">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Single_Euro_Payments_Area_logo.svg"
                                    alt="SEPA Logo" class="method-logo">
                                <span class="fw-bold fs-5 text-dark">SEPA</span>
                            </div>
                            <input type="radio" value="sepa" v-model="selectedMethod" name="payment"
                                class="custom-radio">
                        </label>

                        <label
                            class="payment-method-card bg-white rounded-3 border p-3 d-flex justify-content-between align-items-center"
                            :class="{ 'selected-method': selectedMethod === 'applepay' }">
                            <div class="d-flex align-items-center gap-3">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg"
                                    alt="Apple Pay Logo" class="method-logo">
                                <span class="fw-bold fs-5 text-dark">ApplePay</span>
                            </div>
                            <input type="radio" value="applepay" v-model="selectedMethod" name="payment"
                                class="custom-radio">
                        </label>

                        <label
                            class="payment-method-card bg-white rounded-3 border p-3 d-flex justify-content-between align-items-center"
                            :class="{ 'selected-method': selectedMethod === 'googlepay' }">
                            <div class="d-flex align-items-center gap-3">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg"
                                    alt="Google Pay Logo" class="method-logo method-logo-gpay">
                                <span class="fw-bold fs-5 text-dark">GooglePay</span>
                            </div>
                            <input type="radio" value="googlepay" v-model="selectedMethod" name="payment"
                                class="custom-radio">
                        </label>

                    </div>
                </div>

                <button @click="processPayment" class="btn-yellow-main w-100 mt-2" :disabled="isProcessing">
                    <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2" role="status"
                        aria-hidden="true"></span>
                    {{ isProcessing ? 'Verarbeite Zahlung...' : `Jetzt bezahlen ·
                    ${bookingDetails.price.toFixed(2).replace('.', ',')} €` }}
                </button>
            </div>

        </div>
    </div>
</template>

<style scoped>
.content-wrapper-desktop {
    margin: 0 auto;
}

.payment-summary-box {
    border-color: #cccccc !important;
}

.price-currency {
    font-size: 1.5rem;
}

.price-amount {
    font-size: 4rem;
    letter-spacing: -1px;
}

.price-label {
    font-size: 15px;
}

.tutor-name {
    font-size: 1.15rem;
}

.booking-details {
    font-size: 0.95rem;
}

.method-logo-gpay {
    height: 18px;
}

.yellow-label {
    color: #d4a218;
    font-weight: 800;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.avatar-circle {
    width: 50px;
    height: 50px;
    background-color: #dcdcdc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    color: #333;
    flex-shrink: 0;
}

.payment-method-card {
    border-color: #cccccc;
    transition: all 0.2s;
    cursor: pointer;
}

.payment-method-card:hover {
    border-color: #a0a0a0;
    background-color: #f9f9f9;
}

.selected-method {
    border-color: #d4a218 !important;
    background-color: #fffaf0 !important;
}

.method-logo {
    width: 45px;
    height: 22px;
    object-fit: contain;
    object-position: left center;
}

.custom-radio {
    width: 20px;
    height: 20px;
    accent-color: #d4a218;
    cursor: pointer;
}

.btn-yellow-main {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-weight: 700;
    font-size: 18px;
    background-color: #fcdb39;
    border: 1px solid #d4b82d;
    transition: background-color 0.2s;
    color: #111827;
}

.btn-yellow-main:hover:not(:disabled) {
    background-color: #f0ce2b;
}

.btn-yellow-main:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
