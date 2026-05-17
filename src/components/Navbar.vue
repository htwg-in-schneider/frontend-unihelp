<script setup>
import { ref } from 'vue';

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <nav class="navbar navbar-expand-md px-4 py-3" style="background-color: #f7f4ed;">
    <div class="container-fluid d-flex justify-content-between align-items-center">
      
      <div class="d-md-none" style="width: 30px;"></div>

      <router-link class="navbar-brand fw-bold fs-4 mx-md-0 mx-auto" to="/" @click="closeMenu">UniHelp</router-link>

      <button class="navbar-toggler custom-toggler" type="button" @click="toggleMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse justify-content-end" :class="{ 'show': isMenuOpen }">
        <ul class="navbar-nav align-items-center text-center mt-3 mt-md-0 ms-auto desktop-gap">
          <li class="nav-item mobile-nav-item">
            <router-link class="nav-link text-dark" to="/angebote" @click="closeMenu">Angebote</router-link>
          </li>
          <li class="nav-item mobile-nav-item">
            <a class="nav-link text-dark" href="/#steps" @click="closeMenu">Ablauf</a>
          </li>
          <li class="nav-item mobile-nav-item">
            <a class="nav-link text-dark" href="/#for-students" @click="closeMenu">Für Studenten</a>
          </li>
          <li class="nav-item mobile-nav-item">
            <a class="nav-link text-dark" href="/#for-tutors" @click="closeMenu">Tutor werden</a>
          </li>
          <li class="nav-item mobile-btn-item mt-3 mt-md-0 px-3 px-md-0">
            <button class="btn btn-outline-dark w-100 px-4" @click="closeMenu">Anmelden</button>
          </li>
          <li class="nav-item mobile-btn-item mt-2 mt-md-0 mb-2 mb-md-0 px-3 px-md-0">
            <button class="btn btn-warning w-100 fw-bold px-4" @click="closeMenu">Registrieren</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.custom-toggler {
  border: none !important;
  padding: 0 !important;
}
.custom-toggler:focus {
  box-shadow: none !important;
  outline: none !important;
}

@media (max-width: 767px) {
  .navbar-collapse {
    background-color: #f7f4ed;
    border-top: 1px solid #e0dcd5;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .mobile-nav-item {
    margin-bottom: 2px;
  }
  .nav-link {
    padding-top: 4px !important;
    padding-bottom: 4px !important;
  }
  
  .mobile-btn-item.mt-3 {
    margin-top: 12px !important;
  }
  .mobile-btn-item.mt-2 {
    margin-top: 8px !important;
  }
}

@media (min-width: 768px) {
  .desktop-gap {
    gap: 0.5rem;
  }
}
</style>
