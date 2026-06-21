<script setup>
import { useToast } from '../composables/useToast.js';
const { toasts } = useToast();
</script>

<template>
    <div class="toast-container">
        <transition-group name="toast">
            <div v-for="toast in toasts" :key="toast.id" class="toast-item" :class="toast.type">
                <span class="toast-icon">
                    <span v-if="toast.type === 'success'">✓</span>
                    <span v-else-if="toast.type === 'error'">✕</span>
                    <span v-else>i</span>
                </span>
                <span class="toast-message">{{ toast.message }}</span>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
.toast-container {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    pointer-events: none;
}

.toast-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    min-width: 220px;
    max-width: 360px;
    pointer-events: auto;
}

.toast-item.success {
    background-color: #1a7a4a;
}

.toast-item.error {
    background-color: #c0392b;
}

.toast-item.info {
    background-color: #1f4277;
}

.toast-icon {
    font-size: 16px;
    font-weight: 800;
    flex-shrink: 0;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(16px);
}

@media (max-width: 767px) {
    .toast-container {
        bottom: 90px;
    }
}
</style>
