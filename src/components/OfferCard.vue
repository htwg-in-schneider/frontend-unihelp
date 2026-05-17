<script setup>
import Button from './Button.vue';

defineProps({
  offer: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="card offer-card h-100 text-start">
    <div class="card-body p-3 d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start mb-1 flex-grow-1">
        <div>
          <h5 class="fw-bold mb-0 text-dark" style="font-size: 16px;">{{ offer.module }}</h5>
          <p class="text-muted small mt-1 mb-1">{{ offer.course }} ({{ offer.university }})</p>
        </div>
      </div>
      
      <div>
        <p class="mb-3 fw-bold text-dark" style="font-size: 15px;">{{ offer.price }} €/Std.</p>
        <div class="mt-auto d-flex flex-column gap-2">
          <Button customClass="btn-yellow-solid w-100" @click="$emit('showDetails', offer.description)">
            Details
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.offer-card {
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  background-color: #fff;
  transition: transform 0.2s, opacity 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.offer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
</style>
