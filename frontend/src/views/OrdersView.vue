<template>
  <div class="orders">
    <div class="page__header">
      <h1 class="page__title">{{ auth.isBuyer ? 'Meus Pedidos' : 'Pedidos Recebidos' }}</h1>
      <p class="page__subtitle">
        {{ auth.isBuyer ? 'Histórico de pedidos realizados' : 'Pedidos recebidos dos compradores' }}
      </p>
    </div>

    <DateFilter @filter-change="handleFilterChange" />

    <div v-if="loading" class="orders__loading">
      <div class="spinner"></div>
      <span>Carregando pedidos...</span>
    </div>

    <div v-else-if="error" class="orders__error">
      <p>{{ error }}</p>
      <button class="btn btn--secondary" @click="loadOrders">Tentar novamente</button>
    </div>

    <div v-else-if="orders.length === 0" class="orders__empty">
      <p>{{ auth.isBuyer ? 'Nenhum pedido encontrado' : 'Nenhum pedido recebido' }}</p>
      <router-link v-if="auth.isBuyer" to="/" class="btn btn--primary">Fazer pedido</router-link>
    </div>

    <div v-else class="orders__list">
      <OrderListItem
        v-for="order in orders"
        :key="order.id"
        :order="order"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Order } from '@/types'
import { getOrders } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import OrderListItem from '@/components/OrderListItem.vue'
import DateFilter from '@/components/DateFilter.vue'

const auth = useAuthStore()
const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const filter = ref<{ from?: string; to?: string }>({})

async function loadOrders() {
  loading.value = true
  error.value = null
  try {
    orders.value = await getOrders(filter.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar pedidos'
  } finally {
    loading.value = false
  }
}

function handleFilterChange(newFilter: { from?: string; to?: string }) {
  filter.value = newFilter
  loadOrders()
}

onMounted(loadOrders)
</script>

<style scoped>
.orders__loading,
.orders__error,
.orders__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  text-align: center;
  color: var(--text-secondary);
}

.orders__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
</style>
