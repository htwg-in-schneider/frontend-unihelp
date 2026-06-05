<script setup>
defineEmits(['confirm', 'cancel']);
</script>

<template>
    <div class="modal-overlay d-flex align-items-center justify-content-center">
        <div class="custom-modal bg-white rounded-4 shadow p-4 text-center">
            <div class="mb-3 text-warning">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor"
                    class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                    <path
                        d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
            </div>
            <h4 class="fw-bold text-danger mb-3">Konto wirklich löschen?</h4>
            <p class="text-muted big mb-4 px-2" style="line-height: 1.5;">
                Du hast <strong>30 Tage</strong> Zeit, dein Konto widerherzustellen.<br> Danach wird es permanent
                gelöscht.
            </p>
            <div class="d-flex flex-column gap-2">
                <button @click="$emit('confirm')" class="btn btn-danger-solid fw-bold py-2 rounded-3 w-100">Ja, Konto
                    löschen</button>
                <button @click="$emit('cancel')"
                    class="btn btn-white-border fw-bold py-2 rounded-3 w-100">Abbrechen</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    backdrop-filter: blur(2px);
}

.custom-modal {
    width: 90%;
    max-width: 380px;
}

.btn-danger-solid {
    background-color: #e53e3e;
    color: white;
    border: none;
    font-size: 16px;
    font-family: inherit;
    transition: background-color 0.2s;
}

.btn-danger-solid:hover {
    background-color: #c53030;
    color: white;
}

.btn-white-border {
    background-color: white;
    color: #333;
    border: 1px solid #333;
    font-size: 16px;
    font-family: inherit;
    transition: all 0.2s ease;
}

.btn-white-border:hover {
    background-color: #f9f9f9;
}
</style>
