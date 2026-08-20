<template>
  <div class="catalog">
    <div class="page__header">
      <h1 class="page__title">Catálogo de Produtos</h1>
      <p class="page__subtitle">Selecione produtos e quantidades para adicionar ao pedido</p>
    </div>

    <div v-if="loading" class="catalog__loading">
      <div class="spinner"></div>
      <span>Carregando produtos...</span>
    </div>

    <div v-else-if="error" class="catalog__error">
      <p>{{ error }}</p>
      <button class="btn btn--secondary" @click="loadProducts">Tentar novamente</button>
    </div>

    <div v-else-if="products.length === 0" class="catalog__empty">
      <p>Nenhum produto disponível</p>
    </div>

    <div v-else class="grid grid--products">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @add-to-cart="handleAddToCart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Product } from '@/types'
import { getProducts } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/ProductCard.vue'

const router = useRouter()
const cart = useCartStore()

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadProducts() {
  loading.value = true
  error.value = null
  try {
    products.value = await getProducts()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar produtos'
  } finally {
    loading.value = false
  }
}

function handleAddToCart({ productId, quantity }: { productId: string; quantity: number }) {
  cart.addItem(productId, quantity)
  router.push('/cart')
}

onMounted(loadProducts)
</script>

<style scoped>
.catalog__loading,
.catalog__error,
.catalog__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  text-align: center;
  color: var(--text-secondary);
}
</style>
