import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Determine if schema should use staging table or production table
const isProduction = process.env.NODE_ENV === "production";
const identifyTable = (name: string) =>
  isProduction ? name : `staging_${name}`;

export const servers = pgTable(identifyTable("Servers"), {
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
});
export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;

export const paymentTypes = pgTable(identifyTable("PaymentTypes"), {
  name: text("name").primaryKey().notNull(),
});
export type PaymentType = typeof paymentTypes.$inferSelect;
export type NewPaymentType = typeof paymentTypes.$inferInsert;

export const transactionStatuses = pgTable(
  identifyTable("TransactionStatuses"),
  {
    name: text("name").primaryKey().notNull(),
  },
);
export type TransactionStatus = typeof transactionStatuses.$inferSelect;
export type NewTransactionStatus = typeof transactionStatuses.$inferInsert;

export const transactionTypes = pgTable(identifyTable("TransactionTypes"), {
  name: text("name").primaryKey().notNull(),
});
export type TransactionType = typeof transactionTypes.$inferSelect;
export type NewTransactionType = typeof transactionTypes.$inferInsert;

export const accountTypes = pgTable(identifyTable("AccountTypes"), {
  name: text("name").primaryKey().notNull(),
  interestRate: numeric("interest_rate").notNull(),
  transactionFee: numeric("transaction_fee").notNull(),
});
export type AccountType = typeof accountTypes.$inferSelect;
export type NewAccountType = typeof accountTypes.$inferInsert;

export const roles = pgTable(identifyTable("Roles"), {
  name: text("name").primaryKey().notNull(),
});
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export const users = pgTable(
  identifyTable("Users"),
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
  (table) => {
    return {
      usersMinecraftUuidKey: unique("Users_minecraft_uuid_key").on(
        table.minecraftUuid,
      ),
      usersMinecraftUsernameKey: unique("Users_minecraft_username_key").on(
        table.minecraftUsername,
      ),
      usersDiscordUsernameKey: unique("Users_discord_username_key").on(
        table.discordUsername,
      ),
    };
  },
);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const userSettings = pgTable(identifyTable("UserSettings"), {
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
});
export type UserSetting = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;

export const transactions = pgTable(
  identifyTable("Transactions"),
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
  (table) => {
    return {
      createdByUserIdIdx: index("Transactions_created_by_user_id_idx").using(
        "btree",
        table.createdByUserId,
      ),
      paymentTypeIdx: index("Transactions_payment_type_idx").using(
        "btree",
        table.paymentType,
      ),
      statusIdx: index("Transactions_status_idx").using("btree", table.status),
      transactionTypeIdx: index("Transactions_transaction_type_idx").using(
        "btree",
        table.transactionType,
      ),
      userIdIdx: index("Transactions_user_id_idx").using("btree", table.userId),
    };
  },
);
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
