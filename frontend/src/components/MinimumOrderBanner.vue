<template>
  <div
    class="minimum-banner"
    :class="{
      'minimum-banner--success': isAboveMinimum,
      'minimum-banner--warning': !isAboveMinimum,
      'minimum-banner--loading': isLoading,
    }"
  >
    <div class="minimum-banner__icon">
      <span v-if="isAboveMinimum">✓</span>
      <span v-else>!</span>
    </div>
    <div class="minimum-banner__content">
      <p class="minimum-banner__title">
        {{ title ?? (isAboveMinimum ? 'Pedido mínimo atingido' : 'Pedido mínimo não atingido') }}
      </p>
      <p v-if="!isAboveMinimum" class="minimum-banner__message">
        {{ message ?? `Faltam ${formatPrice(missingAmount)} para fechar o pedido` }}
      </p>
    </div>
    <div v-if="isLoading" class="minimum-banner__spinner">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isAboveMinimum: boolean
  missingAmount: number
  isLoading: boolean
  title?: string
  message?: string
}>()

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
</script>

<style scoped>
.minimum-banner {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid;
  transition: all 0.2s;
}

.minimum-banner--success {
  background: rgba(93, 245, 88, 0.1);
  border-color: var(--green-accent);
}

.minimum-banner--warning {
  background: rgba(255, 184, 77, 0.1);
  border-color: var(--warning);
}

.minimum-banner--loading {
  opacity: 0.7;
}

.minimum-banner__icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.minimum-banner--success .minimum-banner__icon {
  background: var(--green-accent);
  color: var(--text-primary);
}

.minimum-banner--warning .minimum-banner__icon {
  background: var(--warning);
  color: var(--text-primary);
}

.minimum-banner__content {
  flex: 1;
}

.minimum-banner__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.minimum-banner__message {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.minimum-banner__spinner {
  flex-shrink: 0;
}
</style>
