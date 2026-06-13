<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isAppPage = computed(() => {
  const paths = ['/', '/dashboard', '/offers', '/bookings', '/messages', '/profile'];
  return paths.includes(route.path);
});

const isFormMode = computed(() => {
  return route.query.view === 'form' || route.path.includes('/new') || route.path.includes('/edit');
});
</script>

<template>
  <div>
    <footer class="site-footer border-top py-4 mt-auto" :class="{ 'hide-on-mobile-app': isAppPage && !isFormMode }">
      <div
        class="container-fluid px-4 px-lg-5 d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div class="fw-bold fs-5 mb-2 mb-md-0 text-dark">UniHelp 2026</div>
        <div class="d-flex gap-4 text-dark">
          <router-link to="/imprint"
            class="text-decoration-none text-dark opacity-75 footer-link-hover">Impressum</router-link>
          <router-link to="/privacy"
            class="text-decoration-none text-dark opacity-75 footer-link-hover">Datenschutz</router-link>
          <a href="/#contact" class="text-decoration-none text-dark opacity-75 footer-link-hover">Kontakt</a>
        </div>
      </div>
    </footer>

    <div v-if="isAppPage && !isFormMode"
      class="mobile-bottom-nav d-md-none bg-white border-top fixed-bottom d-flex justify-content-around py-2 shadow-sm">

      <router-link to="/dashboard" class="nav-item text-decoration-none text-center"
        :class="{ 'active-blue': route.path === '/dashboard' || route.path === '/offers' || route.path === '/' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
          class="bi bi-search d-block mx-auto mb-1 text-secondary"
          :class="{ 'text-active': route.path === '/dashboard' || route.path === '/offers' || route.path === '/' }"
          viewBox="0 0 16 16">
          <path
            d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
        </svg>
        <span class="text-secondary nav-label"
          :class="{ 'text-active': route.path === '/dashboard' || route.path === '/offers' || route.path === '/' }">Entdecken</span>
      </router-link>

      <router-link to="/bookings" class="nav-item text-decoration-none text-center"
        :class="{ 'active-blue': route.path === '/bookings' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
          class="bi bi-calendar-check d-block mx-auto mb-1 text-secondary"
          :class="{ 'text-active': route.path === '/bookings' }" viewBox="0 0 16 16">
          <path
            d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
          <path
            d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
        </svg>
        <span class="text-secondary nav-label" :class="{ 'text-active': route.path === '/bookings' }">Buchungen</span>
      </router-link>

      <router-link to="/messages" class="nav-item text-decoration-none text-center"
        :class="{ 'active-blue': route.path === '/messages' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
          class="bi bi-chat-dots d-block mx-auto mb-1 text-secondary"
          :class="{ 'text-active': route.path === '/messages' }" viewBox="0 0 16 16">
          <path
            d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
          <path
            d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z" />
        </svg>
        <span class="text-secondary nav-label" :class="{ 'text-active': route.path === '/messages' }">Nachrichten</span>
      </router-link>

      <router-link to="/profile" class="nav-item text-decoration-none text-center"
        :class="{ 'active-blue': route.path === '/profile' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
          class="bi bi-person d-block mx-auto mb-1 text-secondary" :class="{ 'text-active': route.path === '/profile' }"
          viewBox="0 0 16 16">
          <path
            d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
        </svg>
        <span class="text-secondary nav-label" :class="{ 'text-active': route.path === '/profile' }">Profil</span>
      </router-link>

    </div>
  </div>
</template>

<style scoped>
.site-footer {
  background-color: #f7f4ed;
}

.mobile-bottom-nav {
  z-index: 2000;
  padding-bottom: env(safe-area-inset-bottom, 10px);
}

.nav-label {
  font-size: 11px;
}

.active-blue .text-active {
  color: #2b487b !important;
  font-weight: bold;
}

.footer-link-hover:hover {
  opacity: 1 !important;
  color: #d4a218 !important;
}

@media (max-width: 767px) {
  .hide-on-mobile-app {
    display: none !important;
  }
}
</style>
