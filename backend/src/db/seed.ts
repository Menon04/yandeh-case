import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import dotenv from "dotenv";
import { buyers, suppliers, products, priceTiers } from "./schema.js";
import { inArray } from "drizzle-orm";

dotenv.config({ path: "../.env" });

const BUYER_ID = "11111111-1111-4111-8111-111111111111";
const SUPPLIER_ID = "22222222-2222-4222-8222-222222222222";

async function seed() {
  const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(connection);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("Seeding data...");

  await db.insert(buyers).values({
    id: BUYER_ID,
    name: "Farmácia Central",
  }).onConflictDoNothing();

  await db.insert(suppliers).values({
    id: SUPPLIER_ID,
    name: "Distribuidora Farma",
    minimumOrderValue: "100.00",
  }).onConflictDoNothing();

  const productIds = [
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  ];

  await db.insert(products).values([
    {
      id: productIds[0],
      supplierId: SUPPLIER_ID,
      name: "Paracetamol 500mg",
      description: "Comprimido de paracetamol 500mg - caixa com 10",
    },
    {
      id: productIds[1],
      supplierId: SUPPLIER_ID,
      name: "Dipirona 1g",
      description: "Comprimido de dipirona 1g - caixa com 20",
    },
    {
      id: productIds[2],
      supplierId: SUPPLIER_ID,
      name: "Ibuprofeno 400mg",
      description: "Comprimido de ibuprofeno 400mg - caixa com 30",
    },
  ]).onConflictDoNothing();

  // price_tiers não tem um ID previsível nem uma constraint única pra
  // (productId, minQty) — então onConflictDoNothing() aqui nunca colide com
  // nada, e rodar o seed mais de uma vez (ex.: a cada restart do container,
  // já que o Dockerfile chama esse script no boot) duplicava as faixas de
  // preço a cada execução. Só inserimos se ainda não existir nenhuma faixa
  // para esses produtos.
  const existingTiers = await db
    .select({ productId: priceTiers.productId })
    .from(priceTiers)
    .where(inArray(priceTiers.productId, productIds))
    .limit(1);

  if (existingTiers.length === 0) {
    await db.insert(priceTiers).values([
      { productId: productIds[0], minQty: 1, maxQty: 9, price: "15.00" },
      { productId: productIds[0], minQty: 10, maxQty: 49, price: "12.50" },
      { productId: productIds[0], minQty: 50, maxQty: null, price: "10.00" },

      { productId: productIds[1], minQty: 1, maxQty: 9, price: "20.00" },
      { productId: productIds[1], minQty: 10, maxQty: 49, price: "17.00" },
      { productId: productIds[1], minQty: 50, maxQty: null, price: "14.00" },

      { productId: productIds[2], minQty: 1, maxQty: 9, price: "25.00" },
      { productId: productIds[2], minQty: 10, maxQty: 49, price: "22.00" },
      { productId: productIds[2], minQty: 50, maxQty: null, price: "18.00" },
    ]);
  } else {
    console.log("Price tiers já existem, pulando.");
  }

  console.log("Seed complete!");
  console.log(`  Buyer: ${BUYER_ID} (Farmácia Central)`);
  console.log(`  Supplier: ${SUPPLIER_ID} (Distribuidora Farma)`);
  console.log(`  Products: ${productIds.length}`);
  console.log(`  Price tiers: 9`);

  await connection.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
