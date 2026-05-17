<script setup>
defineProps({
  tutor: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="tutor-card">
    <img :src="tutor.image" :alt="tutor.name" />
    <div class="tutor-card-body text-start">
      <p class="subject">{{ tutor.subject }}</p>
      <h4 class="name">{{ tutor.name }}</h4>
      <p class="rating">{{ tutor.rating }}</p>
      <p class="price-tag">ab {{ tutor.price }} €/Std.</p>
    </div>
  </div>
</template>

<style scoped>
.tutor-card {
  border: 1px solid #e0e0e0;
  width: 31%; 
  background-color: #f7f4ed;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

@media (max-width: 767px) {
  .tutor-card {
    width: 100%;
    margin-bottom: 20px;
  }
}

.tutor-card img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
}

.tutor-card-body {
  padding: 16px 20px;
}

.subject {
  font-size: 13px;
  color: #333;
  font-weight: 700;
  margin-bottom: 4px;
}

.name {
  font-size: 18px;
  margin-bottom: 8px;
  color: #333;
  font-weight: normal;
}

.rating {
  color: #424242;
  font-size: 13px;
  margin-bottom: 16px;
}

.price-tag {
  color: #333;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 0;
}
</style>
