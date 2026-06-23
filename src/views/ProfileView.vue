<script setup>
import { useAuth0 } from '@auth0/auth0-vue'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProfileActivityCard from '../components/ProfileActivityCard.vue'
import DeleteModal from '../components/DeleteModal.vue'
import { useToast } from '../composables/useToast.js'

const baseUrl = import.meta.env.VITE_API_BASE_URL
const { user, isAuthenticated, isLoading, getAccessTokenSilently, logout } = useAuth0()
const router = useRouter()
const { success, error: showError } = useToast()
const profileData = ref(null)
const error = ref('')
const actionError = ref('')
const bearerToken = ref('')

const isEditing = ref(false)
const showDeleteModal = ref(false)
const formData = ref({})
const myOffersCount = ref(0)
const myBookingsCount = ref(0)
const myRatingsCount = ref(0)

const userInitials = computed(() => {
  if (profileData.value?.firstName && profileData.value?.lastName) {
    return profileData.value.firstName.charAt(0) + profileData.value.lastName.charAt(0)
  }
  return user.value?.name ? user.value.name.substring(0, 2).toUpperCase() : 'U'
})

const isModerator = computed(() => {
  return profileData.value?.role === 'MODERATOR' || profileData.value?.role === 'ADMIN'
})

function copyToClipboard(event) {
  event.target.select()
  navigator.clipboard.writeText(event.target.value)
}

function getRoleName(constant) {
  switch (constant) {
    case 'ADMIN':
      return 'Administrator'
    case 'MODERATOR':
      return 'Moderator'
    case 'REGULAR':
      return 'Regulärer Benutzer'
    default:
      return constant;
  }
}

onMounted(async () => {
  if (isAuthenticated.value) {
    await loadProfile()
    await loadActivityData()
  }
})

async function loadProfile() {
  try {
    const token = await getAccessTokenSilently()
    bearerToken.value = token

    const response = await fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.ok) {
      profileData.value = await response.json()
      formData.value = { ...profileData.value }
    } else {
      error.value = `Fehler beim Laden: ${response.statusText}`
    }
  } catch (e) {
    error.value = 'Netzwerkfehler beim Laden des Profils.'
  }
}

async function loadActivityData() {
  try {
    const token = await getAccessTokenSilently()
    const [offersRes, bookingsRes] = await Promise.all([
      fetch(`${baseUrl}/api/offer`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${baseUrl}/api/booking`, { headers: { Authorization: `Bearer ${token}` } })
    ])
    if (offersRes.ok) {
      const allOffers = await offersRes.json()
      const myOffers = allOffers.filter(o => o.ownerOauthId === user.value?.sub)
      myOffersCount.value = myOffers.length
    }
    if (bookingsRes.ok) {
      const allBookings = await bookingsRes.json()
      myBookingsCount.value = allBookings.filter(b => b.studentOauthId === user.value?.sub).length
      myRatingsCount.value = allBookings.filter(b =>
        b.tutorOauthId === user.value?.sub && b.status === 'RATED'
      ).length
    }
  } catch (e) {
    console.error('Fehler beim Laden der Aktivitätsdaten', e)
  }
}

function startEditing() {
  actionError.value = ''
  formData.value = { ...profileData.value }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  actionError.value = ''
}

function triggerDelete() {
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

async function saveProfile() {
  actionError.value = ''
  try {
    const token = await getAccessTokenSilently()
    const response = await fetch(`${baseUrl}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData.value)
    })

    if (response.ok) {
      profileData.value = await response.json()
      isEditing.value = false
      success('Profil erfolgreich gespeichert.')
    } else if (response.status === 409) {
      showError('Dieser Nutzername ist bereits vergeben.')
      actionError.value = 'Dieser Nutzername ist bereits vergeben.'
    } else {
      showError('Fehler beim Speichern der Daten.')
      actionError.value = 'Fehler beim Speichern der Daten. Bitte versuche es später erneut.'
    }
  } catch (e) {
    console.error('Save error', e)
    showError('Netzwerkfehler beim Speichern.')
    actionError.value = 'Netzwerkfehler beim Speichern.'
  }
}

async function confirmDeleteProfile() {
  actionError.value = ''
  try {
    const token = await getAccessTokenSilently()
    const response = await fetch(`${baseUrl}/api/profile`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.ok) {
      logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })
    } else {
      closeDeleteModal()
      actionError.value = 'Fehler beim Deaktivieren des Kontos.'
    }
  } catch (e) {
    console.error('Delete error', e)
    closeDeleteModal()
    actionError.value = 'Netzwerkfehler beim Löschen.'
  }
}
</script>

<template>
  <div class="profile-page-wrapper">

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-warning" role="status"></div>
    </div>

    <div v-else-if="isAuthenticated && profileData" class="container py-4 py-lg-5 profile-container">

      <div v-if="!isEditing" class="row">
        <div class="col-lg-5 mb-4 mb-lg-0">
          <div class="bg-white p-4 p-lg-5 rounded-4 shadow-sm border text-center mb-4 profile-card-border">
            <div class="avatar-circle mx-auto mb-3">{{ userInitials }}</div>
            <h3 class="fw-bold text-dark mb-1 fs-4">{{ profileData.firstName || 'Vorname' }} {{ profileData.lastName ||
              'Nachname' }}</h3>
            <p class="text-muted mb-1 small fw-bold">{{ profileData.email }}</p>
            <p class="text-muted mb-2 small fw-bold">{{ profileData.university || 'Hochschule fehlt' }} - {{
              profileData.course || 'Studiengang fehlt' }}</p>

            <div class="mb-4">
              <span class="badge bg-dark px-3 py-2 role-badge">{{
                getRoleName(profileData.role) }}</span>
            </div>

            <div class="stats-row d-flex justify-content-between mb-4">
              <div class="stat-box">
                <span class="stat-number">{{ myOffersCount }}</span>
                <span class="stat-label">Angebote</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ myBookingsCount }}</span>
                <span class="stat-label">Buchungen</span>
              </div>
              <div class="stat-box border-0">
                <span class="stat-number">{{ myRatingsCount }}</span>
                <span class="stat-label">Bewertungen</span>
              </div>
            </div>

            <button @click="startEditing" class="btn btn-outline-dark w-100 fw-bold py-2 btn-edit-profile">
              Profil bearbeiten
            </button>
          </div>

          <div class="text-start">
            <details class="bg-light p-3 rounded border shadow-sm debug-box">
              <summary class="btn btn-sm btn-outline-secondary w-100 fw-bold debug-summary">OAuth2-Debug-Info
                & Token anzeigen</summary>
              <div class="mt-3">
                <label class="form-label fw-bold text-dark debug-label">User (Auth0 Daten):</label>
                <pre class="bg-white p-3 rounded border text-muted debug-pre"><code>{{ JSON.stringify(user, null, 2) }}</code></pre>

                <label class="form-label fw-bold text-dark mt-3 debug-label">Dein Bearer Token (Zum
                  Kopieren klicken):</label>
                <textarea class="form-control text-muted debug-token" rows="4" readonly @click="copyToClipboard">{{ bearerToken }}</textarea>
              </div>
            </details>
          </div>
        </div>

        <div class="col-lg-7">
          <h6 class="text-warning fw-bold mb-3 text-uppercase activities-heading">Meine Aktivitäten</h6>

          <div @click="router.push('/dashboard')">
            <ProfileActivityCard icon="✉️" title="Meine Angebote" :subtitle="`${myOffersCount} aktive Angebote`" />
          </div>
          <div @click="router.push('/bookings')">
            <ProfileActivityCard icon="📅" title="Buchungen" :subtitle="`${myBookingsCount} Buchungen insgesamt`" />
          </div>
          <div @click="router.push('/bookings')">
            <ProfileActivityCard icon="⭐" title="Bewertungen" :subtitle="`${myRatingsCount} Bewertungen erhalten`" />
          </div>

          <div @click="router.push('/moderation')">
            <ProfileActivityCard v-if="isModerator" icon="👤" title="Moderator Terminal" subtitle="Verwaltung" />
          </div>

        </div>
      </div>

      <div v-else class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <div class="bg-white p-4 p-md-5 rounded-4 shadow-sm border position-relative profile-card-border">

            <div class="text-center mb-4">
              <h3 class="fw-bold text-dark mb-4">Konto bearbeiten</h3>
            </div>

            <div v-if="actionError" class="alert alert-danger py-2 px-3 small fw-bold mb-4" role="alert">
              {{ actionError }}
            </div>

            <form @submit.prevent="saveProfile">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold text-dark small mb-1">Vorname<span
                      class="text-danger">*</span></label>
                  <input v-model="formData.firstName" type="text" class="form-control custom-input" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold text-dark small mb-1">Nachname<span
                      class="text-danger">*</span></label>
                  <input v-model="formData.lastName" type="text" class="form-control custom-input" required>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold text-dark small mb-1">Nutzername<span
                      class="text-danger">*</span></label>
                  <input v-model="formData.username" type="text" class="form-control custom-input" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold text-dark small mb-1">E-Mail<span
                      class="text-danger">*</span></label>
                  <input v-model="formData.email" type="email" class="form-control custom-input input-readonly" required readonly>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold text-dark small mb-1">Telefon (optional)</label>
                <input v-model="formData.phone" type="text" class="form-control custom-input" placeholder="+49...">
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold text-dark small mb-1">Hochschule<span
                      class="text-danger">*</span></label>
                  <input v-model="formData.university" type="text" class="form-control custom-input" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold text-dark small mb-1">Studiengang<span
                      class="text-danger">*</span></label>
                  <input v-model="formData.course" type="text" class="form-control custom-input" required>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold text-dark small mb-1">Sprache<span class="text-danger">*</span></label>
                <select v-model="formData.language" class="form-control custom-input custom-select" required>
                  <option value="" disabled>Bitte wählen...</option>
                  <option value="Deutsch">Deutsch</option>
                  <option value="Englisch">Englisch</option>
                  <option value="Spanisch">Spanisch</option>
                  <option value="Französisch">Französisch</option>
                  <option value="Italienisch">Italienisch</option>
                  <option value="Türkisch">Türkisch</option>
                  <option value="Arabisch">Arabisch</option>
                </select>
              </div>

              <div class="mt-5 d-flex flex-column gap-3">
                <button type="submit" class="btn btn-profile-yellow w-100 fw-bold fs-5 shadow-sm">Änderungen
                  speichern</button>
                <button type="button" @click="cancelEditing"
                  class="btn btn-outline-cancel-profile w-100 fw-bold fs-5 shadow-sm">Abbrechen</button>
                <button type="button" @click="triggerDelete"
                  class="btn btn-red-delete w-100 fw-bold fs-5 shadow-sm">Konto löschen</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!isLoading" class="text-center py-5">
      <h3 class="fw-bold">Zugriff verweigert</h3>
      <p class="text-muted">Bitte logge dich ein, um dein Profil zu sehen.</p>
    </div>

    <DeleteModal v-if="showDeleteModal" @confirm="confirmDeleteProfile" @cancel="closeDeleteModal" />

  </div>
</template>

<style scoped>
.profile-page-wrapper {
  padding-bottom: 80px;
}

.profile-container {
  max-width: 1100px;
}

.profile-card-border {
  border-color: #e0dcd5 !important;
}

.role-badge {
  font-size: 13px;
  font-weight: 600;
}

.btn-edit-profile {
  border-radius: 8px;
}

.debug-box {
  border-color: #e0dcd5 !important;
}

.debug-summary {
  font-size: 13px;
}

.debug-label {
  font-size: 13px;
}

.debug-pre {
  font-size: 12px;
  overflow-x: auto;
}

.debug-token {
  font-size: 12px;
  cursor: pointer;
}

.activities-heading {
  letter-spacing: 0.5px;
}

.btn-outline-cancel-profile {
  background-color: transparent;
  color: #212529;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 14px 0;
  transition: all 0.2s;
}

.btn-outline-cancel-profile:hover {
  background-color: #f8f9fa;
  border-color: #ccc;
}

.input-readonly {
  background-color: #f0f0f0;
  cursor: not-allowed;
  color: #6c757d;
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

.custom-input {
  border-radius: 10px;
  border: 1px solid #dcdcdc;
  padding: 12px 16px;
  font-size: 1rem;
  background-color: #fafafa;
  transition: all 0.2s ease;
  font-family: inherit;
}

.custom-input:focus {
  background-color: #ffffff;
  border-color: #1f4277;
  box-shadow: 0 0 0 0.25rem rgba(31, 66, 119, 0.25);
  outline: none;
}

.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23333' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 12px;
  cursor: pointer;
}

.btn-profile-yellow {
  background-color: #fcdb39;
  color: #111827;
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  transition: background-color 0.2s;
}

.btn-profile-yellow:hover {
  background-color: #e6c52a;
  color: #111827;
}

.btn-red-delete {
  background-color: #e32828;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  transition: background-color 0.2s;
}

.btn-red-delete:hover {
  background-color: #c41e1e;
  color: white;
}
</style>
