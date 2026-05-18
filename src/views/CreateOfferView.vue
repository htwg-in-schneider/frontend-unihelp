<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const url = 'http://localhost:8081/api/offer';

const offer = ref({
  university: '',
  course: '',
  module: '',
  price: null,
  description: '',
  format: '',
  availableTimes: '',
  language: '',
  isActive: true
});

async function createOffer() {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer.value),
    });
    if (!response.ok) throw new Error('Fehler beim Erstellen');
    router.push('/offers');
  } catch (error) {
    console.error(error);
    alert('Konnte nicht erstellt werden.');
  }
}
</script>

<template>
  <div class="container py-4 form-wrapper mt-3">

    <form @submit.prevent="createOffer" class="bg-light-beige p-4 rounded-3 border-0 shadow-sm">
      
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
        <input type="text" class="form-control" v-model="offer.university" placeholder="z.B. HTWG Konstanz" required />
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Studiengang<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.course" placeholder="z.B. Wirtschaftsinformatik" required />
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Modul<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.module" placeholder="z.B. Datenbank- und Informationssysteme 1" required />
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Preis pro Stunde (€)<span class="text-danger">*</span></label>
        <input type="number" class="form-control" v-model="offer.price" placeholder="z.B. 17" required />
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Beschreibung<span class="text-danger">*</span></label>
        <textarea class="form-control" rows="3" v-model="offer.description" placeholder="Bestnoten sind garantiert! Schreibe hier ein paar Details..." required></textarea>
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Format<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.format" placeholder="z.B. Online, Präsenz oder Online & Präsenz" required />
      </div>
      <div class="mb-3">
        <label class="fw-bold mb-1">Verfügbare Zeiten<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.availableTimes" placeholder="z.B. Mo, Mi, Do 16:30 - 19:00" required />
      </div>
      <div class="mb-4">
        <label class="fw-bold mb-1">Sprache<span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="offer.language" placeholder="z.B. Deutsch" required />
      </div>

      <button type="submit" class="btn btn-yellow-main w-100 fw-bold fs-5 py-2 mb-2">Veröffentlichen</button>
      <button type="button" @click="router.back()" class="btn btn-cancel w-100 fw-bold fs-5 py-2">Abbrechen</button>
    </form>
  </div>
</template>

<style scoped>
.form-wrapper { max-width: 550px; margin: 0 auto; }
.bg-light-beige { background-color: #fcfaf5; }
.form-control { border-radius: 8px; border: 1px solid #d1d1d1; padding: 10px; }

.btn-yellow-main { background-color: #fcdb39; color: #333; border: 1px solid #d4b82d; border-radius: 8px; }
.btn-yellow-main:hover { background-color: #f0ce2b; }

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

.custom-switch { margin-left: 0 !important; }
.custom-switch:checked { background-color: #198754; border-color: #198754; }
.text-success { color: #198754 !important; }
</style>
