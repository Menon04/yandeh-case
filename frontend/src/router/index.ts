import { createRouter, createWebHistory } from 'vue-router'
import CatalogView from '@/views/CatalogView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'catalog',
      component: CatalogView,
      meta: { role: 'buyer' },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue'),
      meta: { role: 'buyer' },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersView.vue'),
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue'),
      meta: { role: 'supplier' },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  
  if (to.meta.role === 'buyer' && auth.isSupplier) {
    next({ name: 'products' })
  } else if (to.meta.role === 'supplier' && auth.isBuyer) {
    next({ name: 'catalog' })
  } else {
    next()
  }
})

export default router
