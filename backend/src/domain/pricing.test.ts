import { describe, it, expect } from "vitest";
import {
  resolveTierPrice,
  calculateItemSubtotal,
  calculateOrderTotal,
  isAboveMinimum,
  validateTierRanges,
  PriceTier,
  PriceTierInput,
} from "./pricing.js";

describe("resolveTierPrice", () => {
  const tiers: PriceTier[] = [
    { id: "1", productId: "p1", minQty: 1, maxQty: 9, price: "15.00" },
    { id: "2", productId: "p1", minQty: 10, maxQty: 49, price: "12.50" },
    { id: "3", productId: "p1", minQty: 50, maxQty: null, price: "10.00" },
  ];

  it("returns correct tier for qty 1-9", () => {
    expect(resolveTierPrice(tiers, 1)).toEqual({ price: 15, tierId: "1" });
    expect(resolveTierPrice(tiers, 5)).toEqual({ price: 15, tierId: "1" });
    expect(resolveTierPrice(tiers, 9)).toEqual({ price: 15, tierId: "1" });
  });

  it("returns correct tier for qty 10-49", () => {
    expect(resolveTierPrice(tiers, 10)).toEqual({ price: 12.5, tierId: "2" });
    expect(resolveTierPrice(tiers, 25)).toEqual({ price: 12.5, tierId: "2" });
    expect(resolveTierPrice(tiers, 49)).toEqual({ price: 12.5, tierId: "2" });
  });

  it("returns correct tier for qty 50+ (null maxQty)", () => {
    expect(resolveTierPrice(tiers, 50)).toEqual({ price: 10, tierId: "3" });
    expect(resolveTierPrice(tiers, 1000)).toEqual({ price: 10, tierId: "3" });
  });

  it("returns null when no tier covers quantity", () => {
    const gaps: PriceTier[] = [
      { id: "1", productId: "p1", minQty: 1, maxQty: 5, price: "10.00" },
      { id: "2", productId: "p1", minQty: 10, maxQty: 20, price: "8.00" },
    ];
    expect(resolveTierPrice(gaps, 7)).toBeNull();
  });

  it("returns null for empty tiers", () => {
    expect(resolveTierPrice([], 5)).toBeNull();
  });
});

describe("calculateItemSubtotal", () => {
  it("calculates correctly", () => {
    expect(calculateItemSubtotal(10, 5)).toBe(50);
    expect(calculateItemSubtotal(12.5, 10)).toBe(125);
  });

  it("handles decimal precision", () => {
    expect(calculateItemSubtotal(10.555, 3)).toBe(31.67);
    expect(calculateItemSubtotal(0.1, 3)).toBe(0.3);
  });
});

describe("calculateOrderTotal", () => {
  it("sums all item subtotals", () => {
    const items = [
      { productId: "p1", quantity: 5, unitPrice: 10, subtotal: 50, priceTierId: "t1" },
      { productId: "p2", quantity: 3, unitPrice: 20, subtotal: 60, priceTierId: "t2" },
    ];
    expect(calculateOrderTotal(items)).toBe(110);
  });

  it("handles empty items", () => {
    expect(calculateOrderTotal([])).toBe(0);
  });

  it("handles decimal precision", () => {
    const items = [
      { productId: "p1", quantity: 3, unitPrice: 10.33, subtotal: 30.99, priceTierId: "t1" },
      { productId: "p2", quantity: 2, unitPrice: 5.67, subtotal: 11.34, priceTierId: "t2" },
    ];
    expect(calculateOrderTotal(items)).toBe(42.33);
  });
});

describe("isAboveMinimum", () => {
  it("returns true when total >= minimum", () => {
    expect(isAboveMinimum(100, 100)).toBe(true);
    expect(isAboveMinimum(150, 100)).toBe(true);
  });

  it("returns false when total < minimum", () => {
    expect(isAboveMinimum(99, 100)).toBe(false);
    expect(isAboveMinimum(0, 100)).toBe(false);
  });
});

describe("validateTierRanges", () => {
  it("accepts valid contiguous tiers", () => {
    const tiers: PriceTierInput[] = [
      { minQty: 1, maxQty: 9, price: 15 },
      { minQty: 10, maxQty: 49, price: 12.5 },
      { minQty: 50, maxQty: null, price: 10 },
    ];
    expect(validateTierRanges(tiers)).toEqual({ valid: true });
  });

  it("rejects empty tiers", () => {
    expect(validateTierRanges([])).toEqual({
      valid: false,
      error: "Pelo menos uma faixa de preço é obrigatória",
    });
  });

  it("rejects minQty < 1", () => {
    const tiers: PriceTierInput[] = [{ minQty: 0, maxQty: 10, price: 10 }];
    expect(validateTierRanges(tiers).valid).toBe(false);
  });

  it("rejects maxQty < minQty", () => {
    const tiers: PriceTierInput[] = [{ minQty: 10, maxQty: 5, price: 10 }];
    expect(validateTierRanges(tiers).valid).toBe(false);
  });

  it("rejects price <= 0", () => {
    const tiers: PriceTierInput[] = [{ minQty: 1, maxQty: 10, price: 0 }];
    expect(validateTierRanges(tiers).valid).toBe(false);
  });

  it("rejects overlapping tiers", () => {
    const tiers: PriceTierInput[] = [
      { minQty: 1, maxQty: 10, price: 15 },
      { minQty: 5, maxQty: 20, price: 12 },
    ];
    const result = validateTierRanges(tiers);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Sobreposição");
  });

  it("rejects gaps between tiers", () => {
    const tiers: PriceTierInput[] = [
      { minQty: 1, maxQty: 5, price: 15 },
      { minQty: 10, maxQty: 20, price: 12 },
    ];
    const result = validateTierRanges(tiers);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Gap");
  });

  it("rejects tier after null maxQty", () => {
    const tiers: PriceTierInput[] = [
      { minQty: 1, maxQty: null, price: 10 },
      { minQty: 100, maxQty: 200, price: 8 },
    ];
    const result = validateTierRanges(tiers);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("maxQty null");
  });
});
