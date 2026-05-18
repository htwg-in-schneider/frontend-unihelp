<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const url = 'http://localhost:8081/api/offer';

const offer = ref({});
const showDeleteModal = ref(false); 

onMounted(() => fetchOffer());

async function fetchOffer() {
  try {
    const response = await fetch(`${url}/${route.params.id}`);
    if (!response.ok) throw new Error('Nicht gefunden');
    offer.value = await response.json();
  } catch (error) {
    console.error(error);
    router.push('/offers');
  }
}

async function updateOffer() {
  try {
    const response = await fetch(`${url}/${offer.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer.value),
    });
    if (!response.ok) throw new Error('Fehler beim Update');
    router.push('/offers');
  } catch (error) {
    console.error(error);
    alert('Konnte nicht aktualisiert werden.');
  }
}

async function executeDelete() {
  try {
    const response = await fetch(`${url}/${offer.value.id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Fehler beim Löschen');
    showDeleteModal.value = false;
    router.push('/offers');
  } catch (error) {
    console.error(error);
    alert('Konnte nicht gelöscht werden.');
  }
}
</script>

<template>
  <div class="container py-4 form-wrapper position-relative mt-3">

    <form @submit.prevent="updateOffer" class="bg-light-beige p-4 rounded-3 border-0 shadow-sm">
      
      <div class="mb-4 p-3 bg-white rounded-3 border">
        <label class="fw-bold mb-2 d-block text-dark">Sichtbarkeit des Angebots</label>
        <div class="form-check form-switch d-flex align-items-center ps-0 m-0">
          <input class="form-check-input fs-4 m-0 ms-0 custom-switch" type="checkbox" role="switch" id="isActiveSwitch" v-model="offer.isActive">
          <label class="form-check-label fw-bold ms-3" :class="offer.isActive ? 'text-success' : 'text-muted'" for="isActiveSwitch">
            {{ offer.isActive ? 'Aktiv (für andere sichtbar)' : 'Inaktiv (verborgen)' }}
          </label>
        </div>
      </div>

      <div class="mb-3">
        <label class="fw-bold mb-1">Hochschule<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.university" required />
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Studiengang<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.course" required />
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Modul<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.module" required />
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Preis pro Stunde (€)<span class="text-danger">*</span></label>
        <input type="number" class="form-control" v-model="offer.price" required />
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Beschreibung<span class="text-danger">*</span></label>
        <textarea class="form-control" rows="3" v-model="offer.description" required></textarea>
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Format<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.format" required />
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Verfügbare Zeiten<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.availableTimes" required />
      </div>
      <div class="mb-4">
        <label class="fw-bold mb-1">Sprache<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.language" required />
      </div>

      <button type="submit" class="btn btn-yellow-main w-100 fw-bold fs-5 py-2 mb-2">Änderungen speichern</button>
      <button type="button" @click="showDeleteModal = true" class="btn btn-red-delete w-100 fw-bold fs-5 py-2">Angebot löschen</button>
    </form>

    <div v-if="showDeleteModal" class="custom-modal-overlay d-flex align-items-center justify-content-center">
      <div class="custom-modal-box p-4 text-center bg-white rounded-4 shadow-lg">
        <div class="warning-icon mb-2">⚠️</div>
        <h4 class="fw-bold mb-2">Angebot löschen?</h4>
        <p class="text-muted mb-4 px-2">
          Möchtest du dieses Angebot wirklich dauerhaft löschen? Offene Buchungen werden dabei storniert.
        </p>
        
        <button @click="executeDelete" class="btn btn-red-delete w-100 fw-bold py-2 mb-2">
          Löschen und stornieren
        </button>
        <button @click="showDeleteModal = false" class="btn btn-cancel w-100 fw-bold py-2">
          Abbrechen
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.form-wrapper { 
    max-width: 550px; margin: 0 auto; 
}

.bg-light-beige { 
    background-color: #fcfaf5; 
}

.form-control { 
    border-radius: 8px; border: 1px solid #d1d1d1; padding: 10px; 
}

.btn-yellow-main { 
    background-color: #fcdb39; color: #333; border: 1px solid #d4b82d; border-radius: 8px; 
}
.btn-yellow-main:hover { 
    background-color: #f0ce2b; 
}

.btn-red-delete { 
    background-color: #e32828; color: white; border: none; border-radius: 8px; 
}

.btn-red-delete:hover { 
    background-color: #c41e1e; color: white; 
}

.btn-cancel {
  background-color: transparent;
  color: #111827;
  border: 1px solid #111827;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.btn-cancel:hover {
  background-color: #f3f4f6; 
  color: #111827;
}

.custom-switch { 
    margin-left: 0 !important; 
}

.custom-switch:checked { 
    background-color: #198754; border-color: #198754; 
}

.text-success { 
    color: #198754 !important; 
}

.custom-modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(252, 250, 245, 0.8); backdrop-filter: blur(2px); z-index: 1000;
}

.custom-modal-box { 
    width: 90%; max-width: 360px; border: 1px solid #e0e0e0; 
}

.warning-icon { 
    font-size: 48px; line-height: 1; 
}
</style>
