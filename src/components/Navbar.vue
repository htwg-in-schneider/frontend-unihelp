<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UserMenu from './UserMenu.vue';

const isMenuOpen = ref(false);
const route = useRoute();
const router = useRouter();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const isDetailView = computed(() => {
  return route.path.startsWith('/offer/') || route.path === '/profile';
});

const goBack = () => {
  router.back();
};
</script>

<template>
  <nav class="navbar navbar-expand-md px-4 py-3" :class="{ 'border-bottom': isDetailView }"
    style="background-color: #f7f4ed; border-color: #dcdcdc !important;">
    <div class="container-fluid d-flex justify-content-between align-items-center">

      <div v-if="isDetailView" class="d-flex align-items-center" style="width: 35px;">
        <button @click="goBack"
          class="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm"
          style="width: 35px; height: 35px; border: 1px solid #dcdcdc; background-color: #fff;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left"
            viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
          </svg>
        </button>
      </div>
      <div v-else class="d-md-none" style="width: 35px;"></div>

      <div class="text-center mx-auto d-flex flex-column align-items-center">
        <router-link class="navbar-brand fw-bold text-dark text-decoration-none mx-0 p-0 m-0"
          :class="isDetailView ? 'fs-5' : 'fs-4'" to="/" @click="closeMenu"
          style="line-height: 1;">UniHelp</router-link>

        <div v-if="isDetailView" class="fw-bold fs-4 text-dark mt-1" style="line-height: 1;">{{ route.meta.title ||
          'Angebot' }}</div>
      </div>

      <div v-if="isDetailView" style="width: 35px;"></div>
      <button v-else class="navbar-toggler custom-toggler" type="button" @click="toggleMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div v-if="!isDetailView" class="collapse navbar-collapse justify-content-end" :class="{ 'show': isMenuOpen }">
        <ul class="navbar-nav align-items-center text-center mt-3 mt-md-0 ms-auto desktop-gap">
          <li class="nav-item mobile-nav-item">
            <router-link class="nav-link text-dark" to="/offers" @click="closeMenu">Angebote</router-link>
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
        </ul>
        <div class="d-flex align-items-center ms-lg-3 mt-3 mt-lg-0">
          <UserMenu />
        </div>
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
