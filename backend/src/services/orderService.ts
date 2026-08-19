import { db } from "../db/index.js";
import { orders, orderItems, products, priceTiers, buyers, suppliers } from "../db/schema.js";
import { eq, and, inArray, gte, lte } from "drizzle-orm";
import {
  resolveTier,
  calculateItemSubtotal,
  calculateOrderTotal,
  isAboveMinimum,
  OrderItemCalculated,
} from "../domain/pricing.js";
import { AppError } from "../middleware/errorHandler.js";

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  buyerId: string;
  supplierId: string;
  items: OrderItemInput[];
  idempotencyKey: string;
}

export async function createOrder(input: CreateOrderInput): Promise<{
  order: Record<string, unknown>;
  isNew: boolean;
}> {
  if (input.items.length === 0) {
    throw new AppError(400, "Pedido precisa ter ao menos um item");
  }

  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new AppError(400, "Quantidade inválida", {
        product_id: item.productId,
      });
    }
  }

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(orders)
      .where(eq(orders.idempotencyKey, input.idempotencyKey))
      .limit(1);

    if (existing) {
      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, existing.id));

      return {
        isNew: false,
        order: {
          ...existing,
          total: parseFloat(existing.total),
          items: items.map((i) => ({
            ...i,
            unitPriceApplied: parseFloat(i.unitPriceApplied),
            subtotal: parseFloat(i.subtotal),
          })),
        },
      };
    }

    const [buyer] = await tx
      .select()
      .from(buyers)
      .where(eq(buyers.id, input.buyerId))
      .limit(1);

    const [supplier] = await tx
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, input.supplierId))
      .limit(1);

    if (!buyer || !supplier) {
      throw new AppError(404, "Comprador ou fornecedor não encontrado");
    }

    const productIds = input.items.map((i) => i.productId);
    const allProducts = await tx
      .select()
      .from(products)
      .where(
        and(
          inArray(products.id, productIds),
          eq(products.supplierId, input.supplierId)
        )
      );

    if (allProducts.length !== productIds.length) {
      const foundIds = new Set(allProducts.map((p) => p.id));
      const missing = productIds.find((id) => !foundIds.has(id));
      throw new AppError(404, "Produto não encontrado", {
        product_id: missing,
      });
    }

    const allTiers = await tx
      .select()
      .from(priceTiers)
      .where(inArray(priceTiers.productId, productIds));

    const tiersByProduct = new Map<string, typeof allTiers>();
    for (const tier of allTiers) {
      const existing = tiersByProduct.get(tier.productId) || [];
      existing.push(tier);
      tiersByProduct.set(tier.productId, existing);
    }

    const calculatedItems: OrderItemCalculated[] = [];

    for (const item of input.items) {
      const tiers = tiersByProduct.get(item.productId) || [];
      const tier = resolveTier(tiers, item.quantity);

      if (!tier) {
        throw new AppError(
          422,
          "Não há faixa de preço para essa quantidade",
          {
            product_id: item.productId,
            quantity: item.quantity,
          }
        );
      }

      const unitPrice = parseFloat(tier.price);
      const subtotal = calculateItemSubtotal(unitPrice, item.quantity);

      calculatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        priceTierId: tier.id,
      });
    }

    const total = calculateOrderTotal(calculatedItems);
    const minimum = parseFloat(supplier.minimumOrderValue);

    if (!isAboveMinimum(total, minimum)) {
      throw new AppError(422, "Pedido abaixo do mínimo", {
        total,
        minimum,
      });
    }

    const [order] = await tx
      .insert(orders)
      .values({
        buyerId: input.buyerId,
        supplierId: input.supplierId,
        total: total.toFixed(2),
        idempotencyKey: input.idempotencyKey ?? null,
      })
      .returning();

    const insertedItems = await tx
      .insert(orderItems)
      .values(
        calculatedItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          priceTierId: item.priceTierId,
          quantity: item.quantity,
          unitPriceApplied: item.unitPrice.toFixed(2),
          subtotal: item.subtotal.toFixed(2),
        }))
      )
      .returning();

    return {
      isNew: true,
      order: {
        ...order,
        total: parseFloat(order.total),
        items: insertedItems.map((i) => ({
          ...i,
          unitPriceApplied: parseFloat(i.unitPriceApplied),
          subtotal: parseFloat(i.subtotal),
        })),
      },
    };
  });
}

export async function listOrders(filters?: {
  buyerId?: string;
  supplierId?: string;
  from?: Date;
  to?: Date;
}) {
  const conditions = [];

  if (filters?.buyerId) {
    conditions.push(eq(orders.buyerId, filters.buyerId));
  }
  if (filters?.supplierId) {
    conditions.push(eq(orders.supplierId, filters.supplierId));
  }
  if (filters?.from) {
    conditions.push(gte(orders.createdAt, filters.from));
  }
  if (filters?.to) {
    conditions.push(lte(orders.createdAt, filters.to));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const allOrders = await db
    .select()
    .from(orders)
    .where(whereClause);

  const orderIds = allOrders.map((o) => o.id);
  const allItems =
    orderIds.length > 0
      ? await db
          .select()
          .from(orderItems)
          .where(inArray(orderItems.orderId, orderIds))
      : [];

  const itemsByOrderId = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const existing = itemsByOrderId.get(item.orderId) || [];
    existing.push(item);
    itemsByOrderId.set(item.orderId, existing);
  }

  return allOrders.map((o) => ({
    ...o,
    total: parseFloat(o.total),
    items: (itemsByOrderId.get(o.id) || []).map((i) => ({
      ...i,
      unitPriceApplied: parseFloat(i.unitPriceApplied),
      subtotal: parseFloat(i.subtotal),
    })),
  }));
}

export async function getOrder(orderId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId));

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    ...order,
    total: parseFloat(order.total),
    items: items.map((i) => ({
      ...i,
      unitPriceApplied: parseFloat(i.unitPriceApplied),
      subtotal: parseFloat(i.subtotal),
    })),
  };
}
