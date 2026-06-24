<script setup>
import { ref } from 'vue';

const isOpen = ref(false);

function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}
</script>

<template>
  <div class="legal-menu d-lg-none">
    <button class="legal-toggler" type="button" @click="toggle" aria-label="Menü öffnen">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div v-if="isOpen" class="legal-backdrop" @click="close"></div>

    <div v-if="isOpen" class="legal-dropdown shadow">
      <router-link class="legal-link" to="/imprint" @click="close">Impressum</router-link>
      <router-link class="legal-link" to="/privacy" @click="close">Datenschutz</router-link>
    </div>
  </div>
</template>

<style scoped>
.legal-menu {
  position: relative;
}

.legal-toggler {
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
  line-height: 1;
}

.legal-toggler:focus {
  box-shadow: none;
  outline: none;
}

.legal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1500;
}

.legal-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 1600;
  background-color: #f7f4ed;
  border: 1px solid #e0dcd5;
  border-radius: 12px;
  padding: 6px;
  min-width: 160px;
  display: flex;
  flex-direction: column;
}

.legal-link {
  display: block;
  padding: 10px 14px;
  border-radius: 8px;
  color: #212529;
  text-decoration: none;
  font-weight: 500;
}

.legal-link:hover {
  background-color: rgba(0, 0, 0, 0.04);
  color: #d4a218;
}
</style>
