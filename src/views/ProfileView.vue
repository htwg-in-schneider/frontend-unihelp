<script setup>
import { useAuth0 } from '@auth0/auth0-vue'
import { onMounted, ref } from 'vue'

const baseUrl = 'http://localhost:8081'
const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
const profileData = ref(null)
const bearerToken = ref('')
const error = ref('')

function copyToClipboard(event) {
  event.target.select()
  navigator.clipboard.writeText(event.target.value)
}

function getRoleName(constant) {
  switch (constant) {
    case 'ADMIN':
      return 'Administrator'
    case 'REGULAR':
      return 'Regulärer Benutzer'
    default:
      return constant;
  }
}

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      const token = await getAccessTokenSilently()
      bearerToken.value = token

      const response = await fetch(`${baseUrl}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        profileData.value = await response.json()
      } else {
        error.value = `Fehler beim Laden des Profils aus dem Backend: ${response.status} ${response.statusText}`
      }
    } catch (e) {
      error.value = `Fehler beim Laden des Profils: ${e.message}`
      console.warn('Could not get token or profile:', e)
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

        <div v-if="profileData">
          <img :src="user.picture" :alt="user.name" class="rounded-circle mb-3 border border-3 border-warning"
            width="120" height="120">

          <h3 class="fw-bold">{{ profileData.name }}</h3>
          <p class="text-muted mb-1">{{ profileData.email }}</p>
          <span class="badge bg-dark mb-3 px-3 py-2">{{ getRoleName(profileData.role) }}</span>
        </div>

        <div v-else>
          <p class="card-text text-danger fw-bold">
            {{ error || 'Lade Backend-Profildaten...' }}
          </p>
        </div>

        <div class="mt-4 text-start">
          <details class="bg-light p-3 rounded">
            <summary class="btn btn-sm btn-outline-dark mb-2 fw-bold">OAuth2-Debug-Info & Token anzeigen</summary>
            <div class="mt-3">
              <label class="form-label fw-bold" style="font-size: 14px;">User (Auth0 Daten):</label>
              <pre class="bg-white p-3 rounded border"
                style="font-size: 12px; overflow-x: auto;"><code>{{ JSON.stringify(user, null, 2) }}</code></pre>

              <label class="form-label fw-bold mt-3" style="font-size: 14px;">Dein Bearer Token (Zum Kopieren
                reinklicken):</label>
              <textarea class="form-control text-muted" rows="4" readonly @click="copyToClipboard"
                style="font-size: 12px;">{{ bearerToken }}</textarea>
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
