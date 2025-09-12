import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_POOLER_URL) {
  throw new Error("DATABASE_POOLER_URL environment variable is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_POOLER_URL });

export const db = drizzle(pool);
