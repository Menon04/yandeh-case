<template>
  <div class="product-card card">
    <div class="product-card__header">
      <h3 class="product-card__name">{{ product.name }}</h3>
      <p v-if="product.description" class="product-card__description">
        {{ product.description }}
      </p>
    </div>

    <div class="product-card__tiers">
      <PriceTierTable :tiers="product.priceTiers" />
    </div>

    <div class="product-card__actions">
      <div class="product-card__quantity">
        <label :for="`qty-${product.id}`" class="product-card__label">Quantidade</label>
        <input
          :id="`qty-${product.id}`"
          v-model.number="quantity"
          type="number"
          min="1"
          class="input input--number"
        />
      </div>
      <button
        class="btn btn--primary"
        :disabled="quantity < 1"
        @click="handleAdd"
      >
        Adicionar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Product } from '@/types'
import PriceTierTable from './PriceTierTable.vue'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  'add-to-cart': [{ productId: string; quantity: number }]
}>()

const quantity = ref(1)

function handleAdd() {
  if (quantity.value >= 1) {
    emit('add-to-cart', {
      productId: props.product.id,
      quantity: quantity.value,
    })
    quantity.value = 1
  }
}
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.product-card__header {
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--space-md);
}

.product-card__name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.product-card__description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.product-card__tiers {
  flex: 1;
}

.product-card__actions {
  display: flex;
  align-items: flex-end;
  gap: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-subtle);
}

.product-card__quantity {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.product-card__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
