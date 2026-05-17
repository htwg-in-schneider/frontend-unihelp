<script setup>
defineProps({
  href: {
    type: String,
    required: true
  }
});
</script>

<template>
  <a :href="href" class="text-decoration-none text-dark opacity-75 custom-footer-link">
    <slot></slot>
  </a>
</template>

<style scoped>
.custom-footer-link:hover {
  opacity: 1 !important;
}
</style>
