import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const buyers = pgTable("buyers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  minimumOrderValue: numeric("minimum_order_value", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    supplierIdx: index("idx_products_supplier").on(table.supplierId),
  })
);

export const priceTiers = pgTable(
  "price_tiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    minQty: integer("min_qty").notNull(),
    maxQty: integer("max_qty"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    productIdx: index("idx_price_tiers_product").on(table.productId),
    validRangeCheck: check(
      "valid_range",
      sql`${table.maxQty} IS NULL OR ${table.maxQty} >= ${table.minQty}`
    ),
  })
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => buyers.id),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("closed"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    buyerIdx: index("idx_orders_buyer").on(table.buyerId),
    supplierIdx: index("idx_orders_supplier").on(table.supplierId),
  })
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    priceTierId: uuid("price_tier_id").references(() => priceTiers.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull(),
    unitPriceApplied: numeric("unit_price_applied", {
      precision: 10,
      scale: 2,
    }).notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    orderIdx: index("idx_order_items_order").on(table.orderId),
    positiveQuantityCheck: check(
      "positive_quantity",
      sql`${table.quantity} > 0`
    ),
  })
);

export type Buyer = typeof buyers.$inferSelect;
export type NewBuyer = typeof buyers.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type PriceTier = typeof priceTiers.$inferSelect;
export type NewPriceTier = typeof priceTiers.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
