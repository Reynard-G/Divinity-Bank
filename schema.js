import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const accountTypes = pgTable('AccountTypes', {
  name: text('name').notNull().primaryKey(),
  interestRate: numeric('interest_rate', 4, 3).notNull(),
  transactionFee: numeric('transaction_fee', 4, 3).notNull(),
});

export const paymentTypes = pgTable('PaymentTypes', {
  name: text('name').notNull().primaryKey(),
});

export const roles = pgTable('Roles', {
  name: text('name').notNull().primaryKey(),
});

export const transactionStatuses = pgTable('TransactionStatuses', {
  name: text('name').notNull().primaryKey(),
});

export const transactionTypes = pgTable('TransactionTypes', {
  name: text('name').notNull().primaryKey(),
});

export const transactions = pgTable('Transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  createdByUserId: integer('created_by_user_id')
    .notNull()
    .references(() => users.id),
  amount: numeric('amount', 32, 2).notNull(),
  fee: numeric('fee', 32, 2).notNull().default(0.0),
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const users = pgTable('Users', {
  id: serial('id').primaryKey(),
  accountType: text('account_type')
    .notNull()
    .references(() => accountTypes.name),
  minecraftUuid: text('minecraft_uuid'),
  minecraftUsername: text('minecraft_username'),
  discordUsername: text('discord_username'),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
