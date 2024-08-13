import { relations } from "drizzle-orm/relations";

import {
  accountTypes,
  paymentTypes,
  roles,
  transactions,
  transactionStatuses,
  transactionTypes,
  users,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  accountType: one(accountTypes, {
    fields: [users.accountType],
    references: [accountTypes.name],
  }),
  role: one(roles, {
    fields: [users.role],
    references: [roles.name],
  }),
  transactions_createdByUserId: many(transactions, {
    relationName: "transactions_createdByUserId_users_id",
  }),
  transactions_userId: many(transactions, {
    relationName: "transactions_userId_users_id",
  }),
}));

export const accountTypesRelations = relations(accountTypes, ({ many }) => ({
  users: many(users),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user_createdByUserId: one(users, {
    fields: [transactions.createdByUserId],
    references: [users.id],
    relationName: "transactions_createdByUserId_users_id",
  }),
  paymentType: one(paymentTypes, {
    fields: [transactions.paymentType],
    references: [paymentTypes.name],
  }),
  transactionStatus: one(transactionStatuses, {
    fields: [transactions.status],
    references: [transactionStatuses.name],
  }),
  transactionType: one(transactionTypes, {
    fields: [transactions.transactionType],
    references: [transactionTypes.name],
  }),
  user_userId: one(users, {
    fields: [transactions.userId],
    references: [users.id],
    relationName: "transactions_userId_users_id",
  }),
}));

export const paymentTypesRelations = relations(paymentTypes, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionStatusesRelations = relations(
  transactionStatuses,
  ({ many }) => ({
    transactions: many(transactions),
  }),
);

export const transactionTypesRelations = relations(
  transactionTypes,
  ({ many }) => ({
    transactions: many(transactions),
  }),
);
