<template>
  <div class="order-items">
    <div class="order-items__header">
      <span class="order-items__label">Produto</span>
      <span class="order-items__label">Qtd</span>
      <span class="order-items__label">Preço</span>
      <span class="order-items__label">Subtotal</span>
    </div>
    <div
      v-for="item in items"
      :key="item.id"
      class="order-items__row"
    >
      <span class="order-items__product">{{ item.productId }}</span>
      <span class="order-items__qty tabular-nums">{{ item.quantity }}</span>
      <span class="order-items__price tabular-nums">{{ formatPrice(item.unitPriceApplied) }}</span>
      <span class="order-items__subtotal tabular-nums">{{ formatPrice(item.subtotal) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderItem } from '@/types'

defineProps<{
  items: OrderItem[]
}>()

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
</script>

<style scoped>
.order-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.order-items__header {
  display: grid;
  grid-template-columns: 1fr 80px 100px 100px;
  gap: var(--space-md);
  padding: var(--space-xs) var(--space-sm);
  border-bottom: 1px solid var(--border-subtle);
}

.order-items__label {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-items__row {
  display: grid;
  grid-template-columns: 1fr 80px 100px 100px;
  gap: var(--space-md);
  padding: var(--space-sm);
  align-items: center;
}

.order-items__product {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.order-items__qty,
.order-items__price,
.order-items__subtotal {
  font-size: 0.875rem;
  text-align: right;
}

.order-items__qty {
  color: var(--text-secondary);
}

.order-items__price {
  color: var(--text-secondary);
}

.order-items__subtotal {
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .order-items__header,
  .order-items__row {
    grid-template-columns: 1fr 60px 80px 80px;
    gap: var(--space-sm);
  }

  .order-items__product {
    font-size: 0.75rem;
  }

  .order-items__qty,
  .order-items__price,
  .order-items__subtotal {
    font-size: 0.75rem;
  }
}
</style>
