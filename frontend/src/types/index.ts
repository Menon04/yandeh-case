export interface PriceTier {
  id: string
  productId: string
  minQty: number
  maxQty: number | null
  price: number
}

export interface Product {
  id: string
  supplierId: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  priceTiers: PriceTier[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  priceTierId: string | null
  quantity: number
  unitPriceApplied: number
  subtotal: number
}

export interface Order {
  id: string
  buyerId: string
  supplierId: string
  total: number
  status: string
  idempotencyKey: string | null
  createdAt: string
  items: OrderItem[]
}

export interface PreviewItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number | null
  subtotal: number
  priceError?: string
  minQuantity?: number | null
}

export interface PreviewResponse {
  items: PreviewItem[]
  total: number
  minimumOrderValue: number
  isAboveMinimum: boolean
  hasPriceErrors: boolean
  missingAmount: number
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface CartState {
  supplierId: string
  buyerId: string
  items: CartItem[]
  preview: PreviewResponse | null
  isPreviewLoading: boolean
  isSubmitting: boolean
}
