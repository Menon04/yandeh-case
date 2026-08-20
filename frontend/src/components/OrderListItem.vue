<template>
  <div class="order-item card">
    <div class="order-item__header" @click="toggleExpand">
      <div class="order-item__info">
        <span class="order-item__date tabular-nums">
          {{ formatDate(order.createdAt) }}
        </span>
        <span class="order-item__status badge badge--neutral">
          {{ order.status }}
        </span>
      </div>
      <div class="order-item__total">
        <span class="order-item__total-label">Total</span>
        <span class="order-item__total-value tabular-nums">
          {{ formatPrice(order.total) }}
        </span>
      </div>
      <button class="order-item__toggle" :class="{ 'order-item__toggle--expanded': isExpanded }">
        ▼
      </button>
    </div>

    <div v-if="isExpanded" class="order-item__details">
      <OrderItemsList :items="order.items" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Order } from '@/types'
import OrderItemsList from './OrderItemsList.vue'

defineProps<{
  order: Order
}>()

const isExpanded = ref(false)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
</script>

<style scoped>
.order-item {
  overflow: hidden;
}

.order-item__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
  padding: var(--space-md);
  margin: calc(var(--space-md) * -1);
  transition: background 0.15s;
}

.order-item__header:hover {
  background: var(--bg-elevated);
}

.order-item__info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.order-item__date {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.order-item__total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.order-item__total-label {
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-item__total-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.order-item__toggle {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  transition: transform 0.2s;
  padding: var(--space-sm);
}

.order-item__toggle--expanded {
  transform: rotate(180deg);
}

.order-item__details {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-subtle);
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .order-item__toggle {
    transition: none;
  }

  .order-item__details {
    animation: none;
  }
}
</style>
