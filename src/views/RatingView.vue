<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const router = useRouter();
const route = useRoute();
const { getAccessTokenSilently, user } = useAuth0();

const rating = ref(0);
const hoverRating = ref(0);
const comment = ref('');
const isSubmitting = ref(false);
const isLoading = ref(true);
const errorMessage = ref('');

const bookingDetails = ref({
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
        const response = await fetch('http://localhost:8081/api/booking', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Fehler beim Laden der Buchung');

        const allBookings = await response.json();
        const bookingId = parseInt(route.params.id);
        const booking = allBookings.find(b => b.id === bookingId);

        if (booking) {
            const bDate = new Date(booking.availability.date);

            const isStudent = booking.studentOauthId === user.value?.sub;
            const targetName = isStudent ? (booking.tutorName || 'Tutor') : (booking.studentName || 'Student');

            bookingDetails.value = {
                tutorName: targetName,
                initials: getInitials(targetName),
                subject: booking.offer.module,
                date: bDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
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

function setRating(star) {
    rating.value = star;
    errorMessage.value = '';
}

async function submitRating() {
    if (rating.value === 0) {
        errorMessage.value = 'Bitte wähle mindestens einen Stern aus.';
        return;
    }

    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        const token = await getAccessTokenSilently();
        const bookingId = route.params.id;

        const response = await fetch(`http://localhost:8081/api/booking/${bookingId}/rate`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ratingStars: rating.value,
                ratingComment: comment.value
            })
        });

        if (!response.ok) throw new Error('Bewertung fehlgeschlagen');

        router.push('/bookings');

    } catch (error) {
        console.error('Fehler:', error);
        errorMessage.value = 'Fehler beim Senden der Bewertung. Bitte versuche es später.';
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div class="container py-4 content-wrapper-desktop">
        <div class="text-start mobile-card desktop-card">

            <h2 class="h3 fw-bold text-dark mb-4 text-center d-none d-md-block">Bewertung abgeben</h2>

            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-warning" role="status"></div>
            </div>

            <div v-else>
                <div class="d-flex align-items-center gap-3 mb-4">
                    <div class="avatar-circle-large">{{ bookingDetails.initials }}</div>
                    <div>
                        <h3 class="fw-bold text-dark mb-0 fs-4">{{ bookingDetails.tutorName }}</h3>
                        <div class="text-muted fw-bold booking-info">
                            {{ bookingDetails.subject }} - {{ bookingDetails.date }}
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="yellow-label mb-2">DEINE BEWERTUNG</div>
                    <div class="d-flex gap-2">

                        <div v-for="star in 5" :key="star" @click="setRating(star)" @mouseover="hoverRating = star"
                            @mouseleave="hoverRating = 0" class="cursor-pointer">
                            <svg v-if="(hoverRating ? star <= hoverRating : star <= rating)"
                                xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#111827"
                                viewBox="0 0 16 16">
                                <path
                                    d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                            </svg>

                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#111827"
                                viewBox="0 0 16 16">
                                <path
                                    d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
                            </svg>
                        </div>

                    </div>
                </div>

                <div class="mb-4">
                    <div class="fw-bold text-dark mb-2 comment-label">Kommentar (optional)</div>
                    <textarea v-model="comment" class="form-control comment-textarea" rows="4" placeholder="Wie war die Nachhilfestunde?"></textarea>
                </div>

                <div v-if="errorMessage" class="text-danger fw-bold small mb-3 text-center">
                    {{ errorMessage }}
                </div>

                <button @click="submitRating" class="btn-yellow-main w-100 mt-2" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"
                        aria-hidden="true"></span>
                    {{ isSubmitting ? 'Wird gesendet...' : 'Bewertung abgeben' }}
                </button>
            </div>

        </div>
    </div>
</template>

<style scoped>
.content-wrapper-desktop {
    margin: 0 auto;
}

.booking-info {
    font-size: 15px;
}

.comment-label {
    font-size: 15px;
}

.comment-textarea {
    border-color: #cccccc;
    border-radius: 8px;
    resize: none;
}

.yellow-label {
    color: #d4a218;
    font-weight: 800;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.avatar-circle-large {
    width: 60px;
    height: 60px;
    background-color: #dcdcdc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    color: #333;
    flex-shrink: 0;
}

.cursor-pointer {
    cursor: pointer;
    transition: transform 0.1s;
}

.cursor-pointer:hover {
    transform: scale(1.1);
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
    opacity: 0.6;
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
