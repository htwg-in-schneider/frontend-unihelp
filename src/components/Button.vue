<script setup>
defineProps({
  customClass: {
    type: String,
    default: 'btn btn-dark'
  }
});
</script>

<template>
  <button :class="customClass" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<style scoped>
.btn-yellow-solid {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  color: white;
  background-color: #d4a218;
  transition: opacity 0.2s;
}
.btn-yellow-solid:hover {
  opacity: 0.9;
}
</style>
