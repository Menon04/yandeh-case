<template>
  <div class="cart">
    <div class="page__header">
      <h1 class="page__title">Carrinho</h1>
      <p class="page__subtitle">Revise seu pedido antes de fechar</p>
    </div>

    <div v-if="cart.items.length === 0" class="cart__empty">
      <p>Seu carrinho está vazio</p>
      <router-link to="/" class="btn btn--primary">Ver catálogo</router-link>
    </div>

    <div v-else class="cart__content">
      <div class="cart__items">
        <CartItem
          v-for="item in cartItemsWithDetails"
          :key="item.productId"
          :item="item"
          @update-quantity="(qty) => cart.updateQuantity(item.productId, qty)"
          @remove="cart.removeItem(item.productId)"
        />
      </div>

      <div class="cart__summary">
        <MinimumOrderBanner
          :is-above-minimum="cart.isAboveMinimum"
          :missing-amount="cart.missingAmount"
          :is-loading="cart.isPreviewLoading"
          :title="cart.hasPriceErrors ? 'Quantidade inválida no carrinho' : undefined"
          :message="cart.hasPriceErrors ? 'Ajuste a quantidade destacada abaixo para continuar' : undefined"
        />

        <div class="cart__total">
          <span class="cart__total-label">Total</span>
          <span class="cart__total-value tabular-nums" :class="{ 'cart__total-value--loading': cart.isPreviewLoading }">
            {{ formatPrice(cart.total) }}
          </span>
        </div>

        <CheckoutButton
          :disabled="!cart.isAboveMinimum"
          :is-submitting="cart.isSubmitting"
          @checkout="handleCheckout"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import CartItem from '@/components/CartItem.vue'
import MinimumOrderBanner from '@/components/MinimumOrderBanner.vue'
import CheckoutButton from '@/components/CheckoutButton.vue'

const router = useRouter()
const cart = useCartStore()

const cartItemsWithDetails = computed(() => {
  const previewByProduct = new Map(
    (cart.preview?.items ?? []).map((previewItem) => [previewItem.productId, previewItem])
  )

  // A quantidade sempre vem de cart.items (fonte real do carrinho), para que
  // a UI reflita a mudança imediatamente mesmo se o preview ainda não voltou
  // ou falhou (ex.: quantidade fora da faixa de preço do produto). Nome e
  // preço vêm do último preview bem-sucedido para aquele item.
  return cart.items.map((item) => {
    const previewItem = previewByProduct.get(item.productId)
    return {
      productId: item.productId,
      productName: previewItem?.productName ?? 'Carregando...',
      quantity: item.quantity,
      unitPrice: previewItem?.unitPrice ?? 0,
      subtotal: previewItem?.subtotal ?? 0,
      priceError: previewItem?.priceError,
      minQuantity: previewItem?.minQuantity,
    }
  })
})

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

async function handleCheckout() {
  const success = await cart.checkout()
  if (success) {
    router.push('/orders')
  }
}

onMounted(() => {
  if (cart.items.length > 0 && !cart.preview && !cart.isPreviewLoading) {
    cart.refreshPreview()
  }
})
</script>

<style scoped>
.cart__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  text-align: center;
  color: var(--text-secondary);
}

.cart__content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-xl);
  align-items: start;
}

.cart__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.cart__summary {
  position: sticky;
  top: 100px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.cart__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: var(--space-md) 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}

.cart__total-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.cart__total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: opacity 0.2s;
}

.cart__total-value--loading {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .cart__content {
    grid-template-columns: 1fr;
  }

  .cart__summary {
    position: static;
  }
}
</style>
