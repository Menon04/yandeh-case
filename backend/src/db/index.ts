import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
import * as schema from "./schema.js";

dotenv.config({ path: "../.env" });

const connectionString = process.env.DATABASE_URL!;

export const connection = postgres(connectionString, { max: 10 });
export const db = drizzle(connection, { schema });
