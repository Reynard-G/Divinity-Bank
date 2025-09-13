import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  check,
  uuid,
} from "drizzle-orm/pg-core";

export const servers = pgTable(
  "Servers",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity({
      name: "Servers_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    name: text("name").notNull(),
    shortName: text("short_name").notNull(),
    bannerLink: text("banner_link").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
  },
  (table) => [
    index("Servers_short_name_idx").using(
      "btree",
      table.shortName.asc().nullsLast().op("text_ops")
    ),
  ]
);
export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;

export const paymentTypes = pgTable("PaymentTypes", {
  name: text("name").primaryKey().notNull(),
});
export type PaymentType = typeof paymentTypes.$inferSelect;
export type NewPaymentType = typeof paymentTypes.$inferInsert;

export const transactionStatuses = pgTable("TransactionStatuses", {
  name: text("name").primaryKey().notNull(),
});
export type TransactionStatus = typeof transactionStatuses.$inferSelect;
export type NewTransactionStatus = typeof transactionStatuses.$inferInsert;

export const transactionTypes = pgTable("TransactionTypes", {
  name: text("name").primaryKey().notNull(),
});
export type TransactionType = typeof transactionTypes.$inferSelect;
export type NewTransactionType = typeof transactionTypes.$inferInsert;

export const accountTypes = pgTable("AccountTypes", {
  name: text("name").primaryKey().notNull(),
  interestRate: numeric("interest_rate").notNull(),
  transactionFee: numeric("transaction_fee").notNull(),
});
export type AccountType = typeof accountTypes.$inferSelect;
export type NewAccountType = typeof accountTypes.$inferInsert;

export const roles = pgTable("Roles", {
  name: text("name").primaryKey().notNull(),
});
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export const users = pgTable(
  "Users",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity({
      name: "Users_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    accountType: text("account_type")
      .notNull()
      .references(() => accountTypes.name, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    minecraftUuid: uuid("minecraft_uuid").notNull(),
    minecraftUsername: text("minecraft_username").notNull(),
    discordUsername: text("discord_username").notNull(),
    hashedPassword: text("hashed_password").notNull(),
    role: text("role")
      .notNull()
      .references(() => roles.name, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
  },
  (table) => [
    index("Users_account_type_idx").using(
      "btree",
      table.accountType.asc().nullsLast().op("text_ops")
    ),
    index("Users_role_idx").using(
      "btree",
      table.role.asc().nullsLast().op("text_ops")
    ),
    unique("Users_minecraft_uuid_key").on(table.minecraftUuid),
    unique("Users_minecraft_username_key").on(table.minecraftUsername),
    unique("Users_discord_username_key").on(table.discordUsername),
    check(
      "Users_discord_username_check",
      sql`length(${table.discordUsername}) <= 32`
    ),
    check(
      "Users_minecraft_username_check",
      sql`length(${table.minecraftUsername}) <= 16`
    ),
  ]
);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const userSettings = pgTable(
  "UserSettings",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity({
      name: "UserSettings_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    font: text("font").notNull().default("Default"),
    discordCommunication: boolean("discord_communication")
      .notNull()
      .default(false),
    discordTransactions: boolean("discord_transactions")
      .notNull()
      .default(true),
    discordSecurity: boolean("discord_security").notNull().default(true),
  },
  (table) => [unique("UserSettings_id_key").on(table.id)]
);
export type UserSetting = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;

export const transactions = pgTable(
  "Transactions",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity({
      name: "Transactions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    serverId: integer("server_id")
      .notNull()
      .references(() => servers.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    createdByUserId: integer("created_by_user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    amount: numeric("amount", { precision: 34, scale: 2 }).notNull(),
    fee: numeric("fee", { precision: 34, scale: 2 }).notNull().default("0.00"),
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
  },
  (table) => [
    index("idx_transactions_user_server_status_type").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.serverId.asc().nullsLast().op("int4_ops"),
      table.status.asc().nullsLast().op("text_ops"),
      table.transactionType.asc().nullsLast().op("text_ops")
    ),
    index("Transactions_created_at_idx").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops")
    ),
    index("Transactions_created_by_user_id_idx").using(
      "btree",
      table.createdByUserId.asc().nullsLast().op("int4_ops")
    ),
    index("Transactions_payment_type_idx").using(
      "btree",
      table.paymentType.asc().nullsLast().op("text_ops")
    ),
    index("Transactions_server_id_idx").using(
      "btree",
      table.serverId.asc().nullsLast().op("int4_ops")
    ),
    index("Transactions_status_idx").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops")
    ),
    index("Transactions_transaction_type_idx").using(
      "btree",
      table.transactionType.asc().nullsLast().op("text_ops")
    ),
    index("Transactions_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
  ]
);
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
