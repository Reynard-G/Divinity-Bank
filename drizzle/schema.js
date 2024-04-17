import { sql } from 'drizzle-orm';
import {
  inet,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const accountTypes = pgTable('AccountTypes', {
  name: text('name').primaryKey().notNull(),
  interestRate: numeric('interest_rate', { precision: 4, scale: 3 }).notNull(),
  transactionFee: numeric('transaction_fee', {
    precision: 4,
    scale: 3,
  }).notNull(),
});

export const paymentTypes = pgTable('PaymentTypes', {
  name: text('name').primaryKey().notNull(),
});

export const roles = pgTable('Roles', {
  name: text('name').primaryKey().notNull(),
});

export const transactionStatuses = pgTable('TransactionStatuses', {
  name: text('name').primaryKey().notNull(),
});

export const transactionTypes = pgTable('TransactionTypes', {
  name: text('name').primaryKey().notNull(),
});

export const users = pgTable('Users', {
  id: serial('id').primaryKey().notNull(),
  accountType: text('account_type')
    .notNull()
    .references(() => accountTypes.name),
  minecraftUuid: varchar('minecraft_uuid', { length: 36 }),
  minecraftUsername: varchar('minecraft_username', { length: 16 }),
  discordUsername: varchar('discord_username', { length: 32 }),
  password: varchar('password', { length: 60 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .default(sql`now() AT TIME ZONE 'utc'`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .default(sql`now() AT TIME ZONE 'utc'`)
    .notNull(),
  lastSignInAt: timestamp('last_sign_in_at', {
    withTimezone: true,
    mode: 'string',
  }),
  lastDiscordChangeAt: timestamp('last_discord_change_at', {
    withTimezone: true,
    mode: 'string',
  }),
  lastPasswordChangeAt: timestamp('last_password_change_at', {
    withTimezone: true,
    mode: 'string',
  }),
  lastIpAccessed: inet('last_ip_accessed'),
});

export const transactions = pgTable('Transactions', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  createdByUserId: integer('created_by_user_id')
    .notNull()
    .references(() => users.id),
  amount: numeric('amount', { precision: 32, scale: 2 }).notNull(),
  fee: numeric('fee', { precision: 32, scale: 2 }).default('0.00').notNull(),
  transactionType: text('transaction_type')
    .notNull()
    .references(() => transactionTypes.name),
  paymentType: text('payment_type')
    .notNull()
    .references(() => paymentTypes.name),
  attachment: text('attachment'),
  note: text('note'),
  status: text('status')
    .notNull()
    .references(() => transactionStatuses.name),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .default(sql`now() AT TIME ZONE 'utc'`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .default(sql`now() AT TIME ZONE 'utc'`)
    .notNull(),
});
