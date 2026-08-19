import { db } from "../db/index.js";
import { products, priceTiers, orderItems } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";
import {
  PriceTierInput,
  validateTierRanges,
} from "../domain/pricing.js";
import { AppError } from "../middleware/errorHandler.js";

export interface ProductInput {
  name: string;
  description?: string;
  priceTiers: PriceTierInput[];
}

export async function listProducts(supplierId: string) {
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.supplierId, supplierId));

  const productIds = allProducts.map((p) => p.id);
  const allTiers =
    productIds.length > 0
      ? await db
          .select()
          .from(priceTiers)
          .where(inArray(priceTiers.productId, productIds))
      : [];

  const tiersByProductId = new Map<string, typeof allTiers>();
  for (const tier of allTiers) {
    const existing = tiersByProductId.get(tier.productId) || [];
    existing.push(tier);
    tiersByProductId.set(tier.productId, existing);
  }

  return allProducts.map((p) => ({
    ...p,
    priceTiers: (tiersByProductId.get(p.id) || [])
      .sort((a, b) => a.minQty - b.minQty)
      .map((t) => ({
        ...t,
        price: parseFloat(t.price),
      })),
  }));
}

export async function getProduct(productId: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));

  if (!product) return null;

  const tiers = await db
    .select()
    .from(priceTiers)
    .where(eq(priceTiers.productId, productId))
    .orderBy(priceTiers.minQty);

  return {
    ...product,
    priceTiers: tiers.map((t) => ({
      ...t,
      price: parseFloat(t.price),
    })),
  };
}

export async function createProduct(
  supplierId: string,
  input: ProductInput
) {
  const validation = validateTierRanges(input.priceTiers);
  if (!validation.valid) {
    throw new AppError(400, validation.error!);
  }

  return db.transaction(async (tx) => {
    const [product] = await tx
      .insert(products)
      .values({
        supplierId,
        name: input.name,
        description: input.description ?? null,
      })
      .returning();

    const tiers = await tx
      .insert(priceTiers)
      .values(
        input.priceTiers.map((t) => ({
          productId: product.id,
          minQty: t.minQty,
          maxQty: t.maxQty,
          price: t.price.toFixed(2),
        }))
      )
      .returning();

    return {
      ...product,
      priceTiers: tiers.map((t) => ({
        ...t,
        price: parseFloat(t.price),
      })),
    };
  });
}

export async function updateProduct(
  productId: string,
  input: ProductInput
) {
  const existing = await getProduct(productId);
  if (!existing) {
    throw new AppError(404, "Produto não encontrado");
  }

  const validation = validateTierRanges(input.priceTiers);
  if (!validation.valid) {
    throw new AppError(400, validation.error!);
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(products)
      .set({
        name: input.name,
        description: input.description ?? null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    await tx.delete(priceTiers).where(eq(priceTiers.productId, productId));

    const tiers = await tx
      .insert(priceTiers)
      .values(
        input.priceTiers.map((t) => ({
          productId,
          minQty: t.minQty,
          maxQty: t.maxQty,
          price: t.price.toFixed(2),
        }))
      )
      .returning();

    return {
      ...updated,
      priceTiers: tiers.map((t) => ({
        ...t,
        price: parseFloat(t.price),
      })),
    };
  });
}

export async function deleteProduct(productId: string) {
  const existing = await getProduct(productId);
  if (!existing) {
    throw new AppError(404, "Produto não encontrado");
  }

  const [linkedItem] = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.productId, productId))
    .limit(1);

  if (linkedItem) {
    throw new AppError(
      409,
      "Não é possível excluir produto com pedidos associados"
    );
  }

  await db.delete(products).where(eq(products.id, productId));
}
