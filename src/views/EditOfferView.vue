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
    <div class="form-focus-view" style="background-color: #f7f4ed; min-height: 100vh;">
        <div class="container py-5 form-container">

            <div class="form-card shadow-sm mb-5">
                <form @submit.prevent="updateOffer">

                    <div class="visibility-box mb-4 p-3 rounded"
                        style="background-color: #f8f9fa; border: 1px solid #e0e0e0;">
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
                            <input v-model="offer.price" type="number" class="form-control custom-input" required>
                        </div>
                        <div class="col-md-4 mb-4">
                            <label class="form-label fw-bold text-dark">Format<span class="text-danger">*</span></label>
                            <select v-model="offer.format" class="form-select custom-input" required>
                                <option value="" disabled>Bitte wählen...</option>
                                <option value="ONLINE">Online</option>
                                <option value="PRAESENZ">Präsenz</option>
                                <option value="HYBRID">Online & Präsenz</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-4">
                            <label class="form-label fw-bold text-dark">Sprache<span
                                    class="text-danger">*</span></label>
                            <input v-model="offer.language" type="text" class="form-control custom-input" required>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-bold text-dark">Verfügbare Zeiten<span
                                class="text-danger">*</span></label>
                        <input v-model="offer.availableTimes" type="text" class="form-control custom-input" required>
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
.form-container {
    max-width: 800px;
    margin: 0 auto;
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