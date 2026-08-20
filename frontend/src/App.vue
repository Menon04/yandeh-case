<template>
  <div class="app">
    <header class="app-header">
      <div class="container">
        <router-link to="/" class="app-header__logo">
          <span class="app-header__logo-mark">Y</span>
          Yandeh
        </router-link>
        
        <nav class="app-header__nav">
          <template v-if="auth.isBuyer">
            <router-link to="/" class="app-header__link">Catálogo</router-link>
            <router-link to="/cart" class="app-header__link">
              Carrinho
              <span v-if="cart.totalItems > 0" class="app-header__cart-badge tabular-nums">
                {{ cart.totalItems }}
              </span>
            </router-link>
            <router-link to="/orders" class="app-header__link">Pedidos</router-link>
          </template>
          
          <template v-else>
            <router-link to="/products" class="app-header__link">Produtos</router-link>
            <router-link to="/orders" class="app-header__link">Pedidos Recebidos</router-link>
          </template>
        </nav>

        <div class="app-header__role-switch">
          <button
            class="role-switch"
            :class="{ 'role-switch--supplier': auth.isSupplier }"
            @click="auth.toggleRole()"
          >
            <span class="role-switch__label">
              {{ auth.isBuyer ? 'Comprador' : 'Fornecedor' }}
            </span>
            <span class="role-switch__toggle"></span>
          </button>
        </div>
      </div>
    </header>
    <main class="page">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page {
  flex: 1;
}
</style>
