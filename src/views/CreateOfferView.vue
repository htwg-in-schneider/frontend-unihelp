<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { useToast } from '../composables/useToast.js';
import { useFormats } from '../composables/useFormats.js';

const router = useRouter();
const { getAccessTokenSilently } = useAuth0();
const { success, error: showError } = useToast();
const { formatOptions } = useFormats();
const url = `${import.meta.env.VITE_API_BASE_URL}/api/offer`;

onMounted(() => loadFormats());

const today = new Date().toISOString().split('T')[0];

const offer = ref({
    module: '',
    university: '',
    course: '',
    price: null,
    format: '',
    language: '',
    availabilities: [
        { date: '', startTime: '', endTime: '', booked: false }
    ],
    description: '',
    isActive: true
});

function addAvailability() {
    offer.value.availabilities.push({ date: '', startTime: '', endTime: '', booked: false });
}

function removeAvailability(index) {
    offer.value.availabilities.splice(index, 1);
}

async function saveOffer() {
    if (offer.value.price <= 0) {
        showError('Der Preis muss größer als 0 sein.');
        return;
    }
    for (const avail of offer.value.availabilities) {
        if (avail.startTime && avail.endTime && avail.endTime <= avail.startTime) {
            showError('Die Endzeit muss nach der Startzeit liegen.');
            return;
        }
    }
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(offer.value)
        });
        if (response.ok) {
            success('Angebot erfolgreich veröffentlicht.');
            router.push('/offers');
        } else {
            showError('Fehler beim Speichern des Angebots.');
        }
    } catch (e) {
        showError('Netzwerkfehler. Bitte versuche es erneut.');
    }
}
</script>

<template>
    <div class="form-focus-view">
        <div class="container py-5 form-container">

            <div class="form-card shadow-sm mb-5">
                <form @submit.prevent="saveOffer">

                    <div class="visibility-box mb-4 p-3 rounded">
                        <label class="fw-bold d-block mb-2 text-dark">Sichtbarkeit des Angebots</label>
                        <div class="form-check form-switch d-flex align-items-center m-0 p-0">
                            <input class="form-check-input focus-switch m-0 me-3" type="checkbox" role="switch"
                                id="activeSwitch" v-model="offer.isActive">
                            <label class="form-check-label fw-bold"
                                :class="offer.isActive ? 'text-success-custom' : 'text-muted'" for="activeSwitch">
                                {{ offer.isActive ? 'Aktiv (für andere sichtbar)' : 'Inaktiv (verborgen)' }}
                            </label>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-bold text-dark">Modul<span class="text-danger">*</span></label>
                        <input v-model="offer.module" type="text" class="form-control custom-input"
                            placeholder="z.B. Datenbank- und Informationssysteme 1" required>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-4">
                            <label class="form-label fw-bold text-dark">Hochschule<span
                                    class="text-danger">*</span></label>
                            <input v-model="offer.university" type="text" class="form-control custom-input"
                                placeholder="z.B. HTWG Konstanz" required>
                        </div>
                        <div class="col-md-6 mb-4">
                            <label class="form-label fw-bold text-dark">Studiengang<span
                                    class="text-danger">*</span></label>
                            <input v-model="offer.course" type="text" class="form-control custom-input"
                                placeholder="z.B. Wirtschaftsinformatik" required>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <label class="form-label fw-bold text-dark">Preis pro Stunde (€)<span
                                    class="text-danger">*</span></label>
                            <input v-model="offer.price" type="number" step="0.01" min="0.01" class="form-control custom-input"
                                placeholder="z.B. 17" required>
                        </div>
                        <div class="col-md-4 mb-4">
                            <label class="form-label fw-bold text-dark">Format<span class="text-danger">*</span></label>
                            <select v-model="offer.format" class="form-select custom-input" required>
                                <option value="" disabled selected>Bitte wählen...</option>
                                <option v-for="opt in formatOptions()" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-4">
                            <label class="form-label fw-bold text-dark">Sprache<span
                                    class="text-danger">*</span></label>
                            <select v-model="offer.language" class="form-select custom-input" required>
                                <option value="" disabled selected>Bitte wählen...</option>
                                <option value="Deutsch">Deutsch</option>
                                <option value="Englisch">Englisch</option>
                                <option value="Französisch">Französisch</option>
                                <option value="Spanisch">Spanisch</option>
                                <option value="Italienisch">Italienisch</option>
                                <option value="Türkisch">Türkisch</option>
                                <option value="Sonstige">Sonstige</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-4 p-4 rounded availability-box">
                        <label class="form-label fw-bold text-dark d-block mb-3">Verfügbare Termine<span
                                class="text-danger">*</span></label>

                        <div v-for="(avail, index) in offer.availabilities" :key="index"
                            class="row mb-3 align-items-end">
                            <div class="col-md-4 mb-2 mb-md-0">
                                <label class="form-label text-muted small mb-1">Datum</label>
                                <input v-model="avail.date" type="date" :min="today" class="form-control custom-input" required>
                            </div>
                            <div class="col-md-3 mb-2 mb-md-0">
                                <label class="form-label text-muted small mb-1">Von</label>
                                <input v-model="avail.startTime" type="time" class="form-control custom-input" required>
                            </div>
                            <div class="col-md-3 mb-2 mb-md-0">
                                <label class="form-label text-muted small mb-1">Bis</label>
                                <input v-model="avail.endTime" type="time" :min="avail.startTime || undefined" class="form-control custom-input" required>
                            </div>
                            <div class="col-md-2">
                                <button type="button" @click="removeAvailability(index)"
                                    class="btn btn-outline-danger w-100 d-flex justify-content-center align-items-center btn-delete-slot"
                                    :disabled="offer.availabilities.length === 1" title="Termin entfernen">
                                    Löschen
                                </button>
                            </div>
                        </div>

                        <button type="button" @click="addAvailability"
                            class="btn btn-outline-secondary mt-2 fw-bold btn-add-slot">
                            + Weiteren Termin hinzufügen
                        </button>
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-bold text-dark">Beschreibung<span
                                class="text-danger">*</span></label>
                        <textarea v-model="offer.description" class="form-control custom-input" rows="4"
                            placeholder="Bestnoten sind garantiert! Schreibe hier ein paar Details..."
                            required></textarea>
                    </div>

                    <div class="mt-5 d-flex flex-column gap-3">
                        <button type="submit"
                            class="btn btn-yellow-main w-100 fw-bold fs-5 shadow-sm">Veröffentlichen</button>
                        <button type="button" @click="router.back()"
                            class="btn btn-outline-cancel w-100 fw-bold fs-5">Abbrechen</button>
                    </div>

                </form>
            </div>

        </div>
    </div>
</template>

<style scoped>
.form-focus-view {
    background-color: #f7f4ed;
}

.form-container {
    max-width: 800px;
    margin: 0 auto;
}

.visibility-box {
    background-color: #f8f9fa;
    border: 1px solid #e0e0e0;
}

.availability-box {
    background-color: #f8f9fa;
    border: 1px solid #e0e0e0;
}

.btn-delete-slot {
    height: 48px;
    border-radius: 10px;
}

.btn-add-slot {
    border-radius: 10px;
}

.form-card {
    background-color: #ffffff;
    border-radius: 20px;
    padding: 35px;
    border: 1px solid #f0f0f0;
}

.custom-input {
    border-radius: 10px;
    border: 1px solid #dcdcdc;
    padding: 12px 16px;
    font-size: 1rem;
    background-color: #fafafa;
}

.custom-input:focus {
    background-color: #ffffff;
    border-color: #d4a218;
    box-shadow: 0 0 0 0.25rem rgba(212, 162, 24, 0.25);
    outline: none;
}

.custom-input::placeholder {
    color: #888;
}

.focus-switch {
    width: 45px !important;
    height: 24px !important;
    cursor: pointer;
}

.focus-switch:checked {
    background-color: #0b7a54;
    border-color: #0b7a54;
}

.text-success-custom {
    color: #0b7a54 !important;
}

.btn-yellow-main {
    background-color: #d4a218;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 14px 0;
    transition: background-color 0.2s;
}

.btn-yellow-main:hover {
    background-color: #b88d15;
    color: white;
}

.btn-outline-cancel {
    background-color: transparent;
    color: #212529;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 12px 0;
    transition: all 0.2s;
}

.btn-outline-cancel:hover {
    background-color: #f8f9fa;
    border-color: #ccc;
}

@media (max-width: 768px) {
    .form-card {
        padding: 20px;
        border-radius: 16px;
    }

    .form-container {
        max-width: 100%;
    }
}
</style>