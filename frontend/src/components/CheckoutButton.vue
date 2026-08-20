<template>
  <button
    class="btn btn--primary btn--lg checkout-button"
    :disabled="disabled || isSubmitting"
    @click="emit('checkout')"
  >
    <span v-if="isSubmitting" class="spinner"></span>
    <span v-else>Fechar Pedido</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  disabled: boolean
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  checkout: []
}>()
</script>

<style scoped>
.checkout-button {
  width: 100%;
  position: relative;
}
</style>
