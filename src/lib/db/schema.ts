import { sql } from "drizzle-orm";
import {
  pgTable,
  index,
  uniqueIndex,
  foreignKey,
  integer,
  numeric,
  timestamp,
  text,
  boolean,
  check,
  uuid,
} from "drizzle-orm/pg-core";

export const servers = pgTable(
  "Servers",
  {
    id: integer().generatedByDefaultAsIdentity({
      name: "Servers_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    name: text().notNull(),
    bannerLink: text("banner_link").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
    shortName: text("short_name").notNull(),
  },
  (table) => [
    index("Servers_short_name_idx").using(
      "btree",
      table.shortName.asc().nullsLast().op("text_ops")
    ),
  ]
);
export type SelectServer = typeof servers.$inferSelect;
export type InsertServer = typeof servers.$inferInsert;

export const paymentTypes = pgTable("PaymentTypes", {
  name: text().notNull(),
});
export type SelectPaymentType = typeof paymentTypes.$inferSelect;
export type InsertPaymentType = typeof paymentTypes.$inferInsert;

export const transactionStatuses = pgTable("TransactionStatuses", {
  name: text().notNull(),
});
export type SelectTransactionStatus = typeof transactionStatuses.$inferSelect;
export type InsertTransactionStatus = typeof transactionStatuses.$inferInsert;

export const transactionTypes = pgTable("TransactionTypes", {
  name: text().notNull(),
});
export type SelectTransactionType = typeof transactionTypes.$inferSelect;
export type InsertTransactionType = typeof transactionTypes.$inferInsert;

export const accountTypes = pgTable("AccountTypes", {
  name: text().notNull(),
  interestRate: numeric("interest_rate").notNull(),
  transactionFee: numeric("transaction_fee").notNull(),
});
export type SelectAccountType = typeof accountTypes.$inferSelect;
export type InsertAccountType = typeof accountTypes.$inferInsert;

export const roles = pgTable("Roles", {
  name: text().notNull(),
});
export type SelectRole = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

export const users = pgTable(
  "Users",
  {
    id: integer().generatedByDefaultAsIdentity({
      name: "Users_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    accountType: text("account_type").notNull(),
    minecraftUuid: uuid("minecraft_uuid").notNull(),
    minecraftUsername: text("minecraft_username").notNull(),
    discordUsername: text("discord_username").notNull(),
    hashedPassword: text("hashed_password").notNull(),
    role: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
    deactivated: boolean().default(false).notNull(),
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
    uniqueIndex("Users_minecraft_uuid_key").on(table.minecraftUuid),
    uniqueIndex("Users_minecraft_username_key").on(table.minecraftUsername),
    uniqueIndex("Users_discord_username_key").on(table.discordUsername),
    foreignKey({
      columns: [table.accountType],
      foreignColumns: [accountTypes.name],
      name: "Users_account_type_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.role],
      foreignColumns: [roles.name],
      name: "Users_role_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    check("Users_discord_username_check", sql`length(discord_username) <= 32`),
    check(
      "Users_minecraft_username_check",
      sql`length(minecraft_username) <= 16`
    ),
  ]
);
export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const userSettings = pgTable(
  "UserSettings",
  {
    id: integer().generatedByDefaultAsIdentity({
      name: "UserSettings_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    userId: integer("user_id").notNull(),
    font: text().default("Default").notNull(),
    discordCommunication: boolean("discord_communication")
      .default(false)
      .notNull(),
    discordTransactions: boolean("discord_transactions")
      .default(true)
      .notNull(),
    discordSecurity: boolean("discord_security").default(true).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "UserSettings_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);
export type SelectUserSetting = typeof userSettings.$inferSelect;
export type InsertUserSetting = typeof userSettings.$inferInsert;

export const transactions = pgTable(
  "Transactions",
  {
    id: integer().generatedByDefaultAsIdentity({
      name: "NewTransactions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    userId: integer("user_id").notNull(),
    createdByUserId: integer("created_by_user_id").notNull(),
    serverId: integer("server_id").notNull(),
    transferId: integer("transfer_id"),
    amount: numeric({ precision: 34, scale: 2 }).notNull(),
    fee: numeric({ precision: 34, scale: 2 }).default("0.00").notNull(),
    transactionType: text("transaction_type").notNull(),
    paymentType: text("payment_type").notNull(),
    attachment: text(),
    note: text(),
    status: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
  },
  (table) => [
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
    index("Transactions_transfer_id_idx").using(
      "btree",
      table.transferId.asc().nullsLast().op("int4_ops")
    ),
    index("Transactions_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [users.id],
      name: "Transactions_created_by_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.paymentType],
      foreignColumns: [paymentTypes.name],
      name: "Transactions_payment_type_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.serverId],
      foreignColumns: [servers.id],
      name: "Transactions_server_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.status],
      foreignColumns: [transactionStatuses.name],
      name: "Transactions_status_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.transactionType],
      foreignColumns: [transactionTypes.name],
      name: "Transactions_transaction_type_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.transferId],
      foreignColumns: [transfers.id],
      name: "Transactions_transfer_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "Transactions_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);
export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export const transfers = pgTable(
  "Transfers",
  {
    id: integer().generatedByDefaultAsIdentity({
      name: "Transfers_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    senderUserId: integer("sender_user_id").notNull(),
    recipientUserId: integer("recipient_user_id").notNull(),
    amount: numeric({ precision: 34, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`(now() AT TIME ZONE 'utc'::text)`)
      .notNull(),
  },
  (table) => [
    index("Transfers_created_at_idx").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops")
    ),
    index("Transfers_recipient_user_id_idx").using(
      "btree",
      table.recipientUserId.asc().nullsLast().op("int4_ops")
    ),
    index("Transfers_sender_user_id_idx").using(
      "btree",
      table.senderUserId.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.senderUserId],
      foreignColumns: [users.id],
      name: "Transfers_sender_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.recipientUserId],
      foreignColumns: [users.id],
      name: "Transfers_recipient_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);
export type SelectTransfer = typeof transfers.$inferSelect;
export type InsertTransfer = typeof transfers.$inferInsert;
