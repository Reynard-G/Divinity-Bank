//import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

//config({ path: '.env' });

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/lib/db/schema.ts",
  out: "./app/lib/db",
  /*dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },*/
});
