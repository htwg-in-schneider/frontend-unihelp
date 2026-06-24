<script setup>
defineProps({
  offer: {
    type: Object,
    required: true
  },
  showEditButton: {
    type: Boolean,
    default: false
  },
  isAuthenticated: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div class="card h-100 shadow-sm border-0 offer-card position-relative"
    :class="{ 'inactive-offer': !offer.isActive }">

    <div class="card-body d-flex flex-column p-4">

      <div v-if="!offer.isActive" class="position-absolute top-0 end-0 mt-3 me-3">
        <span class="badge bg-secondary">Inaktiv</span>
      </div>

      <h5 class="card-title fw-bold text-dark pe-4">{{ offer.module }}</h5>
      <p class="text-muted small mb-2">{{ offer.university }} • {{ offer.course }}</p>

      <p class="card-text text-dark fw-bold fs-4 mt-auto pt-3 mb-0">{{ $formatPrice(offer.price) }} €<span
          class="fs-6 fw-normal text-muted">/Std.</span></p>

      <div class="mt-2 d-flex flex-column gap-2">
        <router-link v-if="isAuthenticated" :to="`/offer/${offer.id}`"
          class="btn btn-yellow-main w-100 fw-bold text-decoration-none text-center">
          Angebot ansehen
        </router-link>
        <span v-else class="btn btn-locked w-100 fw-bold text-center">
          Anmelden um Details zu sehen
        </span>
        <router-link v-if="showEditButton" :to="`/offer/edit/${offer.id}`"
          class="btn btn-blue-dark w-100 fw-bold text-decoration-none text-center">
          Angebot bearbeiten
        </router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
.offer-card {
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.3s ease;
}

.inactive-offer {
  opacity: 0.65;
  background-color: #fafafa;
}

.inactive-offer:hover {
  opacity: 0.85;
}

.btn-yellow-main {
  background-color: #d4a218;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 0;
}

.btn-yellow-main:hover {
  background-color: #b88d15;
  color: white;
}

.btn-blue-dark {
  background-color: #1f4277;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 0;
}

.btn-blue-dark:hover {
  background-color: #153059;
  color: white;
}

.btn-locked {
  background-color: #e9ecef;
  color: #888;
  border: none;
  border-radius: 8px;
  padding: 10px 0;
  font-size: 14px;
  cursor: default;
}
</style>
