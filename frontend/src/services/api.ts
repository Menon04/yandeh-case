import type { Product, Order, PreviewResponse } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

export async function getProducts(): Promise<Product[]> {
  return request<Product[]>('/products')
}

export async function getProduct(id: string): Promise<Product> {
  return request<Product>(`/products/${id}`)
}

export async function createProduct(data: {
  name: string
  description: string
  priceTiers: { minQty: number; maxQty: number | null; price: number }[]
}): Promise<Product> {
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProduct(
  id: string,
  data: {
    name: string
    description: string
    priceTiers: { minQty: number; maxQty: number | null; price: number }[]
  }
): Promise<Product> {
  return request<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteProduct(id: string): Promise<void> {
  return request<void>(`/products/${id}`, {
    method: 'DELETE',
  })
}

export async function getOrders(params?: { from?: string; to?: string }): Promise<Order[]> {
  const searchParams = new URLSearchParams()
  if (params?.from) searchParams.set('from', params.from)
  if (params?.to) searchParams.set('to', params.to)
  
  const query = searchParams.toString()
  return request<Order[]>(`/orders${query ? `?${query}` : ''}`)
}

export async function getOrder(id: string): Promise<Order> {
  return request<Order>(`/orders/${id}`)
}

export async function previewOrder(
  buyerId: string,
  supplierId: string,
  items: { productId: string; quantity: number }[]
): Promise<PreviewResponse> {
  return request<PreviewResponse>('/orders/preview', {
    method: 'POST',
    body: JSON.stringify({ buyerId, supplierId, items }),
  })
}

export async function createOrder(
  buyerId: string,
  supplierId: string,
  items: { productId: string; quantity: number }[],
  idempotencyKey: string
): Promise<Order> {
  return request<Order>('/orders', {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ buyerId, supplierId, items }),
  })
}
