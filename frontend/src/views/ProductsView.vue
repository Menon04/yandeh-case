<template>
  <div class="products">
    <div class="page__header">
      <h1 class="page__title">Gerenciar Produtos</h1>
      <p class="page__subtitle">Cadastre e edite produtos com faixas de preço por quantidade</p>
    </div>

    <button class="btn btn--primary" @click="openCreateModal">
      + Novo Produto
    </button>

    <div v-if="loading" class="products__loading">
      <div class="spinner"></div>
      <span>Carregando produtos...</span>
    </div>

    <div v-else-if="error" class="products__error">
      <p>{{ error }}</p>
      <button class="btn btn--secondary" @click="loadProducts">Tentar novamente</button>
    </div>

    <div v-else-if="products.length === 0" class="products__empty">
      <p>Nenhum produto cadastrado</p>
    </div>

    <div v-else class="products__list">
      <div
        v-for="product in products"
        :key="product.id"
        class="product-row card"
      >
        <div class="product-row__info">
          <h3 class="product-row__name">{{ product.name }}</h3>
          <p v-if="product.description" class="product-row__description">
            {{ product.description }}
          </p>
        </div>

        <div class="product-row__tiers">
          <div class="product-row__tiers-label">Faixas de preço:</div>
          <div class="product-row__tiers-list">
            <span
              v-for="tier in product.priceTiers"
              :key="tier.id"
              class="product-row__tier tabular-nums"
            >
              {{ tier.minQty }}{{ tier.maxQty ? `-${tier.maxQty}` : '+' }}:
              {{ formatPrice(tier.price) }}
            </span>
          </div>
        </div>

        <div class="product-row__actions">
          <button class="btn btn--secondary btn--sm" @click="openEditModal(product)">
            Editar
          </button>
          <button class="btn btn--ghost btn--sm" @click="handleDelete(product)">
            Excluir
          </button>
        </div>
      </div>
    </div>

    <ProductModal
      v-if="showModal"
      :product="editingProduct"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Product } from '@/types'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/api'
import ProductModal from '@/components/ProductModal.vue'

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const editingProduct = ref<Product | null>(null)

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

function openCreateModal() {
  editingProduct.value = null
  showModal.value = true
}

function openEditModal(product: Product) {
  editingProduct.value = product
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
}

async function handleSave(data: { name: string; description: string; priceTiers: any[] }) {
  try {
    if (editingProduct.value) {
      await updateProduct(editingProduct.value.id, data)
    } else {
      await createProduct(data)
    }
    closeModal()
    await loadProducts()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Erro ao salvar produto')
  }
}

async function handleDelete(product: Product) {
  if (!confirm(`Excluir produto "${product.name}"?`)) return
  
  try {
    await deleteProduct(product.id)
    await loadProducts()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Erro ao excluir produto')
  }
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

onMounted(loadProducts)
</script>

<style scoped>
.products__loading,
.products__error,
.products__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  text-align: center;
  color: var(--text-secondary);
}

.products__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.product-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.product-row__info {
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--space-md);
}

.product-row__name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.product-row__description {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.product-row__tiers {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.product-row__tiers-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-row__tiers-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.product-row__tier {
  font-size: 0.875rem;
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
}

.product-row__actions {
  display: flex;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-subtle);
}
</style>
