<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { useToast } from '../composables/useToast.js';
import { useFormats } from '../composables/useFormats.js';

const route = useRoute();
const router = useRouter();
const { getAccessTokenSilently } = useAuth0();
const { success, error: showError } = useToast();
const { formatOptions } = useFormats();
const url = `${import.meta.env.VITE_API_BASE_URL}/api/offer`;
const today = new Date().toISOString().split('T')[0];

const offer = ref({
    availabilities: []
});
const showDeleteModal = ref(false);

onMounted(() => {
    fetchOffer();
});

async function fetchOffer() {
    try {
        const response = await fetch(`${url}/${route.params.id}`);
        if (!response.ok) throw new Error('Nicht gefunden');
        offer.value = await response.json();

        if (!offer.value.availabilities || offer.value.availabilities.length === 0) {
            offer.value.availabilities = [{ date: '', startTime: '', endTime: '', booked: false }];
        }
    } catch (error) {
        console.error(error);
        router.push('/offers');
    }
}

function addAvailability() {
    if (!offer.value.availabilities) {
        offer.value.availabilities = [];
    }
    offer.value.availabilities.push({ date: '', startTime: '', endTime: '', booked: false });
}

function removeAvailability(index) {
    offer.value.availabilities.splice(index, 1);
}

async function updateOffer() {
    if (offer.value.price <= 0) {
        showError('Der Preis muss größer als 0 sein.');
        return;
    }
    for (const avail of offer.value.availabilities) {
        if (!avail.booked && avail.startTime && avail.endTime && avail.endTime <= avail.startTime) {
            showError('Die Endzeit muss nach der Startzeit liegen.');
            return;
        }
    }
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${url}/${offer.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(offer.value),
        });
        if (!response.ok) throw new Error('Fehler beim Update');
        success('Änderungen gespeichert.');
        router.push('/offers');
    } catch (e) {
        console.error(e);
        showError('Konnte nicht aktualisiert werden.');
    }
}

async function executeDelete() {
    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${url}/${offer.value.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Fehler beim Löschen');
        showDeleteModal.value = false;
        success('Angebot wurde gelöscht.');
        router.push('/offers');
    } catch (e) {
        console.error(e);
        showError('Angebot konnte nicht gelöscht werden.');
    }
}
</script>

<template>
    <div class="form-focus-view">
        <div class="container py-5 form-container">

            <div class="form-card shadow-sm mb-5">
                <form @submit.prevent="updateOffer">

                    <div class="visibility-box mb-4 p-3 rounded">
                        <label class="fw-bold d-block mb-2 text-dark">Sichtbarkeit des Angebots</label>
                        <div class="form-check form-switch d-flex align-items-center m-0 p-0">
                            <input class="form-check-input focus-switch m-0 me-3" type="checkbox" role="switch"
                                id="activeSwitchEdit" v-model="offer.isActive">
                            <label class="form-check-label fw-bold"
                                :class="offer.isActive ? 'text-success-custom' : 'text-muted'" for="activeSwitchEdit">
                                {{ offer.isActive ? 'Aktiv (für andere sichtbar)' : 'Inaktiv (verborgen)' }}
                            </label>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-bold text-dark">Modul<span class="text-danger">*</span></label>
                        <input v-model="offer.module" type="text" class="form-control custom-input" required>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-4">
                            <label class="form-label fw-bold text-dark">Hochschule<span
                                    class="text-danger">*</span></label>
                            <input v-model="offer.university" type="text" class="form-control custom-input" required>
                        </div>
                        <div class="col-md-6 mb-4">
                            <label class="form-label fw-bold text-dark">Studiengang<span
                                    class="text-danger">*</span></label>
                            <input v-model="offer.course" type="text" class="form-control custom-input" required>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <label class="form-label fw-bold text-dark">Preis pro Stunde (€)<span
                                    class="text-danger">*</span></label>
                            <input v-model="offer.price" type="number" step="0.01" min="0.01" class="form-control custom-input"
                                required>
                        </div>
                        <div class="col-md-4 mb-4">
                            <label class="form-label fw-bold text-dark">Format<span class="text-danger">*</span></label>
                            <select v-model="offer.format" class="form-select custom-input" required>
                                <option value="" disabled>Bitte wählen...</option>
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
                                <input v-model="avail.date" type="date" :min="avail.booked ? undefined : today"
                                    class="form-control custom-input" required :disabled="avail.booked">
                            </div>
                            <div class="col-md-3 mb-2 mb-md-0">
                                <label class="form-label text-muted small mb-1">Von</label>
                                <input v-model="avail.startTime" type="time" class="form-control custom-input" required
                                    :disabled="avail.booked">
                            </div>
                            <div class="col-md-3 mb-2 mb-md-0">
                                <label class="form-label text-muted small mb-1">Bis</label>
                                <input v-model="avail.endTime" type="time"
                                    :min="avail.booked ? undefined : (avail.startTime || undefined)"
                                    class="form-control custom-input" required :disabled="avail.booked">
                            </div>
                            <div class="col-md-2">
                                <button type="button" @click="removeAvailability(index)"
                                    class="btn btn-outline-danger w-100 d-flex justify-content-center align-items-center btn-delete-slot"
                                    :disabled="offer.availabilities.length === 1 || avail.booked"
                                    title="Termin entfernen">
                                    Löschen
                                </button>
                            </div>
                            <div v-if="avail.booked" class="col-12 mt-2">
                                <small class="text-danger fw-bold">⚠️ Dieser Termin wurde bereits von einem Studenten
                                    gebucht und kann nicht mehr geändert werden.</small>
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
                            required></textarea>
                    </div>

                    <div class="mt-5 d-flex flex-column gap-3">
                        <button type="submit" class="btn btn-blue-dark w-100 fw-bold fs-5 shadow-sm">Änderungen
                            speichern</button>
                        <button type="button" @click="showDeleteModal = true"
                            class="btn btn-red-delete w-100 fw-bold fs-5 shadow-sm">Angebot löschen</button>
                        <button type="button" @click="router.back()"
                            class="btn btn-outline-cancel w-100 fw-bold fs-5">Abbrechen</button>
                    </div>

                </form>
            </div>

        </div>

        <div v-if="showDeleteModal" class="custom-modal-overlay d-flex align-items-center justify-content-center">
            <div class="custom-modal-box p-4 text-center bg-white shadow-lg">
                <div class="warning-icon mb-2">⚠️</div>
                <h4 class="fw-bold mb-2">Angebot löschen?</h4>
                <p class="text-muted mb-4 px-2">
                    Möchtest du dieses Angebot wirklich dauerhaft löschen? Offene Buchungen werden dabei storniert.
                </p>

                <button @click="executeDelete" class="btn btn-red-delete w-100 fw-bold py-2 mb-3 fs-5">
                    Löschen und stornieren
                </button>
                <button @click="showDeleteModal = false" class="btn btn-outline-cancel w-100 fw-bold py-2 fs-5">
                    Abbrechen
                </button>
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
    border-color: #1f4277;
    box-shadow: 0 0 0 0.25rem rgba(31, 66, 119, 0.25);
    outline: none;
}

.custom-input:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
    border-color: #e0e0e0;
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

.btn-blue-dark {
    background-color: #1f4277;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 14px 0;
    transition: background-color 0.2s;
}

.btn-blue-dark:hover {
    background-color: #153059;
    color: white;
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

.custom-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(247, 244, 237, 0.8);
    backdrop-filter: blur(4px);
    z-index: 2000;
}

.custom-modal-box {
    width: 90%;
    max-width: 400px;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
}

.warning-icon {
    font-size: 48px;
    line-height: 1;
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