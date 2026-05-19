<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const url = 'http://localhost:8081/api/offer';

const offer = ref({
    module: '',
    university: '',
    course: '',
    price: null,
    format: '',
    language: '',
    availableTimes: '',
    description: '',
    isActive: true
});

async function saveOffer() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(offer.value)
        });
        if (response.ok) {
            router.push('/offers');
        } else {
            console.error('Fehler beim Speichern');
        }
    } catch (error) {
        console.error('Netzwerkfehler:', error);
    }
}
</script>

<template>
    <div class="form-focus-view" style="background-color: #f7f4ed; min-height: 100vh;">
        <div class="container py-5 form-container">

            <div class="form-card shadow-sm mb-5">
                <form @submit.prevent="saveOffer">

                    <div class="visibility-box mb-4 p-3 rounded"
                        style="background-color: #f8f9fa; border: 1px solid #e0e0e0;">
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
                            <input v-model="offer.price" type="number" class="form-control custom-input"
                                placeholder="z.B. 17" required>
                        </div>
                        <div class="col-md-4 mb-4">
                            <label class="form-label fw-bold text-dark">Format<span class="text-danger">*</span></label>
                            <select v-model="offer.format" class="form-select custom-input" required>
                                <option value="" disabled selected>Bitte wählen...</option>
                                <option value="ONLINE">Online</option>
                                <option value="PRAESENZ">Präsenz</option>
                                <option value="HYBRID">Online & Präsenz</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-4">
                            <label class="form-label fw-bold text-dark">Sprache<span
                                    class="text-danger">*</span></label>
                            <input v-model="offer.language" type="text" class="form-control custom-input"
                                placeholder="z.B. Deutsch" required>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-bold text-dark">Verfügbare Zeiten<span
                                class="text-danger">*</span></label>
                        <input v-model="offer.availableTimes" type="text" class="form-control custom-input"
                            placeholder="z.B. Mo, Mi, Do 16:30 - 19:00" required>
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