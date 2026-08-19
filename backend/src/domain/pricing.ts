export interface PriceTier {
  id: string;
  productId: string;
  minQty: number;
  maxQty: number | null;
  price: string;
}

export interface PriceTierInput {
  minQty: number;
  maxQty: number | null;
  price: number;
}

export interface OrderItemCalculated {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  priceTierId: string | null;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function resolveTierPrice(
  tiers: PriceTier[],
  quantity: number
): { price: number; tierId: string } | null {
  const tier = tiers.find(
    (t) => quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty)
  );

  if (!tier) return null;

  return {
    price: parseFloat(tier.price),
    tierId: tier.id,
  };
}

export function calculateItemSubtotal(
  unitPrice: number,
  quantity: number
): number {
  return Math.round(unitPrice * quantity * 100) / 100;
}

export function calculateOrderTotal(items: OrderItemCalculated[]): number {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  return Math.round(total * 100) / 100;
}

export function isAboveMinimum(
  total: number,
  minimumOrderValue: number
): boolean {
  return total >= minimumOrderValue;
}

export function validateTierRanges(tiers: PriceTierInput[]): ValidationResult {
  if (tiers.length === 0) {
    return { valid: false, error: "Pelo menos uma faixa de preço é obrigatória" };
  }

  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    if (current.minQty < 1) {
      return { valid: false, error: "minQty deve ser >= 1" };
    }

    if (current.maxQty !== null && current.maxQty < current.minQty) {
      return { valid: false, error: "maxQty deve ser >= minQty" };
    }

    if (current.price <= 0) {
      return { valid: false, error: "price deve ser > 0" };
    }

    if (i > 0) {
      const prev = sorted[i - 1];

      if (prev.maxQty === null) {
        return {
          valid: false,
          error: "Faixa anterior já cobre todas as quantidades (maxQty null)",
        };
      }

      if (current.minQty <= prev.maxQty) {
        return {
          valid: false,
          error: "Sobreposição de faixas detectada",
        };
      }

      if (current.minQty > prev.maxQty + 1) {
        return {
          valid: false,
          error: "Gap entre faixas detectado",
        };
      }
    }
  }

  return { valid: true };
}
