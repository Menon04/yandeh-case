import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UserRole = 'buyer' | 'supplier'

export const useAuthStore = defineStore('auth', () => {
  const currentRole = ref<UserRole>('buyer')
  
  const buyerId = import.meta.env.VITE_BUYER_ID
  const supplierId = import.meta.env.VITE_SUPPLIER_ID
  
  const currentUserId = computed(() => 
    currentRole.value === 'buyer' ? buyerId : supplierId
  )
  
  const isBuyer = computed(() => currentRole.value === 'buyer')
  const isSupplier = computed(() => currentRole.value === 'supplier')
  
  function switchRole(role: UserRole) {
    currentRole.value = role
  }
  
  function toggleRole() {
    currentRole.value = currentRole.value === 'buyer' ? 'supplier' : 'buyer'
  }
  
  return {
    currentRole,
    currentUserId,
    isBuyer,
    isSupplier,
    switchRole,
    toggleRole,
  }
})
