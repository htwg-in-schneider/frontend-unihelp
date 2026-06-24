<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SpecialBanner from './components/SpecialBanner.vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import ToastContainer from './components/ToastContainer.vue';

const route = useRoute();

const isAppPage = computed(() => {
  const paths = ['/offers', '/bookings', '/messages', '/profile', '/dashboard'];
  return paths.includes(route.path);
});
</script>

<template>
  <div :class="['app-layout', { 'has-mobile-nav': isAppPage }]"
    style="background-color: #f7f4ed; min-height: 100vh; display: flex; flex-direction: column;">

    <SpecialBanner />
    <Navbar />

    <main class="main-content">
      <router-view />
    </main>

    <Footer />
    <ToastContainer />

  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.main-content {
  flex: 1;
  padding-bottom: 0;
}

@media (max-width: 991px) {
  .has-mobile-nav .main-content {
    padding-bottom: 80px !important;
  }
}
</style>