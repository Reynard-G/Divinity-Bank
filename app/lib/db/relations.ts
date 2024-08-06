import { relations } from "drizzle-orm/relations";
import { accountTypes, users, roles } from "./schema";

export const usersRelations = relations(users, ({ one }) => ({
  accountType: one(accountTypes, {
    fields: [users.accountType],
    references: [accountTypes.name],
  }),
  role: one(roles, {
    fields: [users.role],
    references: [roles.name],
  }),
}));

export const accountTypesRelations = relations(accountTypes, ({ many }) => ({
  users: many(users),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));
