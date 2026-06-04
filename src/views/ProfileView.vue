<script setup>
import { useAuth0 } from '@auth0/auth0-vue'
import { onMounted, ref } from 'vue'

const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
const bearerToken = ref('')
const error = ref('')

function copyToClipboard(event) {
  event.target.select()
  navigator.clipboard.writeText(event.target.value)
}

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      const token = await getAccessTokenSilently()
      bearerToken.value = token
    } catch (e) {
       error.value = `Fehler beim Laden des Tokens: ${e.message}`
      console.warn('Could not get token:', e)
    }
  }
})
</script>

<template>
  <div class="container py-5 content-wrapper-desktop">
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-warning" role="status"></div>
    </div>

    <div v-else-if="isAuthenticated && user" class="card mx-auto shadow-sm border-0" style="max-width: 600px;">
      <div class="card-body text-center p-5">
        <img :src="user.picture" :alt="user.name" class="rounded-circle mb-3 border border-3 border-warning" width="120" height="120">
        <h3 class="fw-bold">{{ user.name }}</h3>
        <p class="text-muted">{{ user.email }}</p>

        <div class="mt-4 text-start">
          <details class="bg-light p-3 rounded">
            <summary class="btn btn-sm btn-outline-dark mb-2 fw-bold">OAuth2-Debug-Info & Token anzeigen</summary>
            <div class="mt-3">
              <label class="form-label fw-bold" style="font-size: 14px;">User (Auth0 Daten):</label>
              <pre class="bg-white p-3 rounded border" style="font-size: 12px; overflow-x: auto;"><code>{{ JSON.stringify(user, null, 2) }}</code></pre>
              
              <label class="form-label fw-bold mt-3" style="font-size: 14px;">Dein Bearer Token (Zum Kopieren reinklicken):</label>
              <textarea class="form-control text-muted" rows="4" readonly @click="copyToClipboard" style="font-size: 12px;">{{ bearerToken }}</textarea>
            </div>
          </details>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <h3 class="fw-bold">Zugriff verweigert</h3>
      <p class="text-muted">Bitte logge dich ein, um dein Profil zu sehen.</p>
    </div>
  </div>
</template>
