import {
  pgTable,
  text,
  numeric,
  serial,
  varchar,
  timestamp,
  inet,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const servers = pgTable("Servers", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull(),
  bannerLink: text("banner_link").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`(now() AT TIME ZONE 'utc'::text)`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`(now() AT TIME ZONE 'utc'::text)`),
});
export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;

export const paymentTypes = pgTable("PaymentTypes", {
  name: text("name").primaryKey().notNull(),
});
export type PaymentType = typeof paymentTypes.$inferSelect;
export type NewPaymentType = typeof paymentTypes.$inferInsert;

export const transactionTypes = pgTable("TransactionTypes", {
  name: text("name").primaryKey().notNull(),
});
export type TransactionType = typeof transactionTypes.$inferSelect;
export type NewTransactionType = typeof transactionTypes.$inferInsert;

export const accountTypes = pgTable("AccountTypes", {
  name: text("name").primaryKey().notNull(),
  interestRate: numeric("interest_rate", { precision: 4, scale: 3 }).notNull(),
  transactionFee: numeric("transaction_fee", {
    precision: 4,
    scale: 3,
  }).notNull(),
});
export type AccountType = typeof accountTypes.$inferSelect;
export type NewAccountType = typeof accountTypes.$inferInsert;

export const transactionStatuses = pgTable("TransactionStatuses", {
  name: text("name").primaryKey().notNull(),
});
export type TransactionStatus = typeof transactionStatuses.$inferSelect;
export type NewTransactionStatus = typeof transactionStatuses.$inferInsert;

export const users = pgTable("Users", {
  id: serial("id").primaryKey().notNull(),
  accountType: text("account_type")
    .notNull()
    .references(() => accountTypes.name, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  minecraftUuid: varchar("minecraft_uuid", { length: 36 }),
  minecraftUsername: varchar("minecraft_username", { length: 16 }),
  discordUsername: varchar("discord_username", { length: 32 }),
  password: varchar("password", { length: 60 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull(),
  lastSignInAt: timestamp("last_sign_in_at", {
    withTimezone: true,
    mode: "string",
  }),
  lastDiscordUsernameChangeAt: timestamp("last_discord_username_change_at", {
    withTimezone: true,
    mode: "string",
  }),
  lastPasswordChangeAt: timestamp("last_password_change_at", {
    withTimezone: true,
    mode: "string",
  }),
  lastIpAccessed: inet("last_ip_accessed"),
  role: text("role")
    .default("Client")
    .references(() => roles.name, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
});
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const transactions = pgTable("Transactions", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
  createdByUserId: integer("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
  amount: numeric("amount", { precision: 32, scale: 2 }).notNull(),
  fee: numeric("fee", { precision: 32, scale: 2 }).default("0.00").notNull(),
  transactionType: text("transaction_type")
    .notNull()
    .references(() => transactionTypes.name, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  paymentType: text("payment_type")
    .notNull()
    .references(() => paymentTypes.name, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  attachment: text("attachment"),
  note: text("note"),
  status: text("status")
    .notNull()
    .references(() => transactionStatuses.name, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull(),
});
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export const roles = pgTable("Roles", {
  name: text("name").primaryKey().notNull(),
});
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
