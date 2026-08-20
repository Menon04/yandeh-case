<template>
  <div class="cart-item card">
    <div class="cart-item__info">
      <h3 class="cart-item__name">{{ item.productName }}</h3>
      <div class="cart-item__details">
        <span class="cart-item__price tabular-nums">
          {{ formatPrice(item.unitPrice) }}/un
        </span>
        <span class="cart-item__subtotal tabular-nums">
          {{ formatPrice(item.subtotal) }}
        </span>
      </div>
      <p v-if="item.priceError" class="cart-item__error">
        {{ item.priceError }}
        <template v-if="item.minQuantity">
          — quantidade mínima: {{ item.minQuantity }} un
        </template>
      </p>
    </div>

    <div class="cart-item__actions">
      <div class="cart-item__quantity">
        <button
          class="btn btn--ghost btn--sm cart-item__stepper"
          @click="emit('update-quantity', item.quantity - 1)"
        >
          −
        </button>
        <div class="cart-item__quantity-input-wrap">
          <input
            :value="item.quantity"
            type="number"
            class="input input--number"
            @input="handleQuantityChange"
            @blur="handleBlur"
          />
          <div class="cart-item__arrows">
            <button
              type="button"
              class="cart-item__arrow cart-item__arrow--up"
              @click="emit('update-quantity', item.quantity + 1)"
            >
              ▲
            </button>
            <button
              type="button"
              class="cart-item__arrow cart-item__arrow--down"
              @click="emit('update-quantity', item.quantity - 1)"
            >
              ▼
            </button>
          </div>
        </div>
        <button
          class="btn btn--ghost btn--sm cart-item__stepper"
          @click="emit('update-quantity', item.quantity + 1)"
        >
          +
        </button>
      </div>
      <button class="btn btn--ghost btn--sm" @click="emit('remove')">
        Remover
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  item: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    priceError?: string
    minQuantity?: number | null
  }
}>()

const emit = defineEmits<{
  'update-quantity': [quantity: number]
  'remove': []
}>()

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function handleQuantityChange(event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value, 10)
  if (!isNaN(value) && value >= 0) {
    if (value === 0) {
      emit('remove')
    } else {
      emit('update-quantity', value)
    }
  }
}

function handleBlur(event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value, 10)
  if (isNaN(value) || value <= 0) {
    emit('remove')
  }
}
</script>

<style scoped>
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.cart-item__info {
  flex: 1;
  min-width: 0;
}

.cart-item__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__details {
  display: flex;
  gap: var(--space-md);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.cart-item__subtotal {
  font-weight: 600;
  color: var(--text-primary);
}

.cart-item__error {
  margin-top: var(--space-xs);
  font-size: 0.75rem;
  color: var(--warning);
}

.cart-item__actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.cart-item__quantity {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.cart-item__stepper {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
}

.cart-item__quantity-input-wrap {
  position: relative;
  width: 80px;
}

.cart-item__quantity-input-wrap .input--number {
  width: 100%;
  text-align: center;
  padding-right: 20px;
  -moz-appearance: textfield;
}

.cart-item__quantity-input-wrap .input--number::-webkit-outer-spin-button,
.cart-item__quantity-input-wrap .input--number::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cart-item__arrows {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
}

.cart-item__quantity-input-wrap:hover .cart-item__arrows {
  opacity: 1;
  pointer-events: auto;
}

.cart-item__arrow {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.5rem;
  color: var(--text-tertiary);
  padding: 0;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.cart-item__arrow:hover {
  color: var(--text-primary);
}

.cart-item__arrow--up {
  margin-bottom: 1px;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: stretch;
  }

  .cart-item__actions {
    justify-content: space-between;
  }
}
</style>
