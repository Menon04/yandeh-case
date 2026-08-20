import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, PreviewResponse } from '@/types'
import * as api from '@/services/api'

export const useCartStore = defineStore('cart', () => {
  const supplierId = ref(import.meta.env.VITE_SUPPLIER_ID)
  const buyerId = ref(import.meta.env.VITE_BUYER_ID)
  const items = ref<CartItem[]>([])
  const preview = ref<PreviewResponse | null>(null)
  const isPreviewLoading = ref(false)
  const isSubmitting = ref(false)

  let previewTimeout: ReturnType<typeof setTimeout> | null = null

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const isAboveMinimum = computed(() => preview.value?.isAboveMinimum ?? false)
  const missingAmount = computed(() => preview.value?.missingAmount ?? 0)
  const total = computed(() => preview.value?.total ?? 0)
  const hasPriceErrors = computed(() => preview.value?.hasPriceErrors ?? false)

  function schedulePreview() {
    if (previewTimeout) {
      clearTimeout(previewTimeout)
    }

    if (items.value.length === 0) {
      preview.value = null
      isPreviewLoading.value = false
      return
    }

    isPreviewLoading.value = true
    previewTimeout = setTimeout(async () => {
      try {
        preview.value = await api.previewOrder(
          buyerId.value,
          supplierId.value,
          items.value
        )
      } catch (error) {
        console.error('Preview failed:', error)
      } finally {
        isPreviewLoading.value = false
      }
    }, 300)
  }

  function refreshPreview() {
    if (items.value.length === 0) {
      preview.value = null
      isPreviewLoading.value = false
      return
    }

    isPreviewLoading.value = true
    api.previewOrder(buyerId.value, supplierId.value, items.value)
      .then((result) => {
        preview.value = result
      })
      .catch((error) => {
        console.error('Preview failed:', error)
      })
      .finally(() => {
        isPreviewLoading.value = false
      })
  }

  function addItem(productId: string, quantity: number) {
    const existing = items.value.find((item) => item.productId === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ productId, quantity })
    }
    schedulePreview()
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find((item) => item.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
        schedulePreview()
      }
    }
  }

  function removeItem(productId: string) {
    items.value = items.value.filter((item) => item.productId !== productId)
    schedulePreview()
  }

  function clearCart() {
    items.value = []
    preview.value = null
  }

  async function checkout(): Promise<boolean> {
    if (items.value.length === 0 || !isAboveMinimum.value) {
      return false
    }

    isSubmitting.value = true
    try {
      const idempotencyKey = crypto.randomUUID()
      await api.createOrder(
        buyerId.value,
        supplierId.value,
        items.value,
        idempotencyKey
      )
      clearCart()
      return true
    } catch (error) {
      console.error('Checkout failed:', error)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    supplierId,
    buyerId,
    items,
    preview,
    isPreviewLoading,
    isSubmitting,
    totalItems,
    isAboveMinimum,
    missingAmount,
    total,
    hasPriceErrors,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    checkout,
    refreshPreview,
  }
})
