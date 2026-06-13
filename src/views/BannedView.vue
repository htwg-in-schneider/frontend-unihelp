<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const { logout, getAccessTokenSilently } = useAuth0();
const route = useRoute();
const router = useRouter();

onMounted(() => {
    checkBanStatus();
    setInterval(checkBanStatus, 10000);
});

async function checkBanStatus() {
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch('http://localhost:8081/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            router.push('/dashboard');
        }
    } catch (e) {
    }
}

function handleLogout() {
    logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } });
}

const banMessage = computed(() => {
    const type = route.query.type;
    const until = route.query.until;

    if (type === 'TEMPORARY' && until) {
        const dateObj = new Date(until);
        const dateStr = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        return `Dein Konto wurde vorübergehend gesperrt bis zum ${dateStr} um ${timeStr} Uhr.`;
    } else if (type === 'PERMANENT') {
        return `Dein Konto wurde permanent gesperrt.`;
    } else if (type === 'DELETED') {
        return `Dein Profil wurde von einem Administrator gelöscht.`;
    }
    return `Dein Konto wurde aufgrund eines Verstoßes gegen unsere Richtlinien gesperrt.`;
});

const banReason = computed(() => {
    return route.query.reason || '';
});
</script>

<template>
    <div class="banned-wrapper">
        <div class="banned-card shadow-lg">
            <div class="icon-circle mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor"
                    class="bi bi-shield-lock-fill text-danger" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                        d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99A1.5 1.5 0 0 1 8 5z" />
                </svg>
            </div>
            <h1 class="fw-bold text-dark mb-3">Zugriff verweigert</h1>
            <p class="text-dark mb-2 fs-5">{{ banMessage }}</p>
            <p v-if="banReason" class="text-muted mb-4 fs-6">Grund: {{ banReason }}</p>
            <p v-else class="mb-4"></p>
            <button @click="handleLogout" class="btn-logout fw-bold w-100">Zurück zur Startseite</button>
        </div>
    </div>
</template>

<style scoped>
.banned-wrapper {
    background-color: #f7f4ed;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.banned-card {
    background-color: white;
    border: 1px solid #e0dcd5;
    border-radius: 20px;
    padding: 50px 30px;
    max-width: 500px;
    text-align: center;
}

.icon-circle {
    width: 90px;
    height: 90px;
    background-color: #fcebeb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
}

.btn-logout {
    background-color: #111827;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 14px 0;
    font-size: 16px;
    transition: opacity 0.2s;
}

.btn-logout:hover {
    opacity: 0.85;
}
</style>
