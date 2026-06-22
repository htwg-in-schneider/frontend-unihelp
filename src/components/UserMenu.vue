<script setup>
import { useAuth0 } from '@auth0/auth0-vue'

const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0()

const handleLogin = async () => {
    console.log("Versuche Auth0 Login zu starten...");
    try {
        await loginWithRedirect();
    } catch (error) {
        console.error("Auth0 Login ist im Hintergrund abgestürzt:", error);
    }
}

const handleLogout = () => {
    logout({
        logoutParams: {
            returnTo: window.location.origin + import.meta.env.BASE_URL
        }
    })
}
</script>

<template>
    <div v-if="!isLoading">
        <button type="button" v-if="!isAuthenticated" @click.prevent="handleLogin"
            class="btn btn-dark fw-bold rounded-pill px-4">
            Anmelden
        </button>

        <div v-else class="dropdown">
            <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser1"
                data-bs-toggle="dropdown" aria-expanded="false">
                <img :src="user.picture" :alt="user.name" width="40" height="40" class="rounded-circle border">
            </a>
            <ul class="dropdown-menu dropdown-menu-end text-small shadow" aria-labelledby="dropdownUser1">
                <li>
                    <router-link class="dropdown-item" to="/profile">Profil & Token</router-link>
                </li>
                <li>
                    <hr class="dropdown-divider">
                </li>
                <li>
                    <button class="dropdown-item text-danger" @click="handleLogout">Abmelden</button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.dropdown-toggle::after {
    display: none;
}
</style>
