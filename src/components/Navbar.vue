<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import UserMenu from './UserMenu.vue';

const { isAuthenticated } = useAuth0();

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
  return route.path.startsWith('/offer/') ||
    route.path.startsWith('/payment/') ||
    route.path.startsWith('/rate/') ||
    route.path.startsWith('/user/') ||
    route.path.startsWith('/chat/') ||
    route.path.startsWith('/moderation');
});

const showCenteredTitle = computed(() => {
  return route.path !== '/' && route.path !== '/dashboard';
});

const isAppPage = computed(() => {
  return route.path !== '/';
});

const goBack = () => {
  router.back();
};

function scrollTo(id) {
  closeMenu();
  if (route.path !== '/') {
    router.push('/').then(() => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  } else {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-md px-4 py-3 position-relative navbar-base"
    :class="{ 'border-bottom': isDetailView || isAppPage, 'navbar-fixed-height': showCenteredTitle }">
    <div class="container-fluid d-flex justify-content-between align-items-center">

      <div class="d-flex align-items-center navbar-left">
        <div v-if="isDetailView" class="me-3">
          <button @click="goBack"
            class="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="bi bi-chevron-left" viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
            </svg>
          </button>
        </div>

        <router-link class="navbar-brand fw-bold text-dark text-decoration-none mx-0 p-0 m-0 fs-4 brand-link" to="/"
          @click="closeMenu" :class="{ 'd-none d-md-block': showCenteredTitle }">
          UniHelp
        </router-link>
      </div>

      <div v-if="showCenteredTitle"
        class="position-absolute start-50 translate-middle-x text-center d-md-none navbar-center">
        <router-link class="navbar-brand fw-bold text-dark text-decoration-none mx-0 p-0 m-0 d-block brand-link-mobile"
          to="/dashboard" @click="closeMenu">UniHelp</router-link>
        <div class="fw-bold text-dark fs-4 page-title-mobile">
          {{ route.path.startsWith('/moderation') ? 'Moderation' : (route.meta.title || 'Angebot') }}
        </div>
      </div>
      <div v-if="showCenteredTitle"
        class="position-absolute start-50 translate-middle-x text-center d-none d-md-block navbar-center">
        <div class="fw-bold fs-4 text-dark page-title-desktop">
          {{ route.path.startsWith('/moderation') ? 'Moderation' : (route.meta.title || 'Angebot') }}
        </div>
      </div>

      <div class="navbar-right">
        <button v-if="!isAppPage" class="navbar-toggler custom-toggler" type="button" @click="toggleMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse justify-content-end" :class="{ 'show': isMenuOpen }">

          <ul v-if="!isAppPage" class="navbar-nav align-items-center text-center mt-3 mt-md-0 ms-auto desktop-gap">
            <li class="nav-item mobile-nav-item">
              <router-link class="nav-link text-dark" to="/offers" @click="closeMenu">Angebote</router-link>
            </li>
            <li class="nav-item mobile-nav-item">
              <a class="nav-link text-dark" href="#steps" @click.prevent="scrollTo('steps')">Ablauf</a>
            </li>
            <li class="nav-item mobile-nav-item">
              <a class="nav-link text-dark" href="#for-students" @click.prevent="scrollTo('for-students')">Für Studenten</a>
            </li>
            <li class="nav-item mobile-nav-item">
              <a class="nav-link text-dark" href="#for-tutors" @click.prevent="scrollTo('for-tutors')">Tutor werden</a>
            </li>
          </ul>

          <ul v-else-if="isAuthenticated"
            class="navbar-nav align-items-center text-center mt-3 mt-md-0 ms-auto desktop-gap d-none d-md-flex">
            <li class="nav-item mobile-nav-item">
              <router-link class="nav-link text-dark"
                :class="{ 'nav-link-active': route.path === '/dashboard' || route.path === '/offers' }"
                to="/dashboard">Entdecken</router-link>
            </li>
            <li class="nav-item mobile-nav-item">
              <router-link class="nav-link text-dark" :class="{ 'nav-link-active': route.path === '/bookings' }"
                to="/bookings">Buchungen</router-link>
            </li>
            <li class="nav-item mobile-nav-item">
              <router-link class="nav-link text-dark" :class="{ 'nav-link-active': route.path === '/messages' }"
                to="/messages">Nachrichten</router-link>
            </li>
          </ul>

          <div class="d-flex align-items-center justify-content-center ms-lg-3 mt-3 mt-lg-0" :class="{ 'd-none d-md-flex': isAppPage }">
            <UserMenu />
          </div>
        </div>
      </div>

    </div>
  </nav>
</template>

<style scoped>
.navbar-base {
  background-color: #f7f4ed;
  border-color: #dcdcdc !important;
}

.navbar-left {
  z-index: 10;
}

.navbar-center {
  z-index: 5;
}

.navbar-right {
  z-index: 10;
}

.back-btn {
  width: 35px;
  height: 35px;
  border: 1px solid #dcdcdc;
  background-color: #fff;
}

.brand-link {
  line-height: 1;
}

.brand-link-mobile {
  line-height: 1;
  font-size: 17px;
}

.page-title-mobile {
  line-height: 1.2;
}

.page-title-desktop {
  line-height: 1;
}

.nav-link-active {
  color: #2b487b !important;
  font-weight: 600;
}

.custom-toggler {
  border: none !important;
  padding: 0 !important;
}

.custom-toggler:focus {
  box-shadow: none !important;
  outline: none !important;
}

@media (max-width: 767px) {
  .navbar-fixed-height {
    min-height: 64px;
  }

  .navbar-collapse {
    background-color: #f7f4ed;
    border-top: 1px solid #e0dcd5;
    padding-top: 10px;
    padding-bottom: 10px;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
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
