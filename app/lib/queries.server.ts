import { db } from "~/lib/db/db.server";
import {
  servers,
  users,
  transactions,
  type Transaction,
  paymentTypes,
  transactionStatuses,
} from "~/lib/db/schema";
import { type DrizzleWhere } from "~/types/DataTable";
import { and, asc, count, desc, or, type SQL } from "drizzle-orm";

import { filterColumn } from "~/lib/utils/filterColumns";
import { GetTransactionsSchema } from "~/lib/validations";

/**
 * Get all servers.
 */
export async function getServers() {
  return db.select().from(servers);
}

/**
 * Get non-sensitive information about all users. This is useful for
 * displaying user information in a non-sensitive way to the public.
 */
export async function getNonSensitiveUserInfo() {
  return db
    .select({
      id: users.id,
      account_type: users.accountType,
      minecraft_uuid: users.minecraftUuid,
      minecraft_username: users.minecraftUsername,
      discord_username: users.discordUsername,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users);
}

/**
 * Get transactions based on the input provided. This function is used to
 * fetch transactions for the transactions table using the search parameters
 * provided by the user.
 */
export async function getTransactions(input: GetTransactionsSchema) {
  const { page, per_page, sort, note, paymentType, status, operator } = input;

  try {
    const offset = (page - 1) * per_page;
    const [column, order] = (sort?.split(".") ?? ["createdAt", "desc"]) as [
      keyof Transaction | undefined,
      "asc" | "desc" | undefined,
    ];

    const expressions: (SQL<unknown> | undefined)[] = [
      note
        ? filterColumn({
            column: transactions.note,
            value: note,
          })
        : undefined,
      paymentType
        ? filterColumn({
            column: transactions.paymentType,
            value: paymentType,
            isSelectable: true,
          })
        : undefined,
      status
        ? filterColumn({
            column: transactions.status,
            value: status,
            isSelectable: true,
          })
        : undefined,
    ];
    const where: DrizzleWhere<Transaction> =
      !operator || operator === "and"
        ? and(...expressions)
        : or(...expressions);

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select()
        .from(transactions)
        .limit(per_page)
        .offset(offset)
        .where(where)
        .orderBy(
          column && column in transactions
            ? order === "asc"
              ? asc(transactions[column])
              : desc(transactions[column])
            : desc(transactions.id),
        );

      const total = await tx
        .select({
          count: count(),
        })
        .from(transactions)
        .where(where)
        .then((res) => res[0]?.count ?? 0);

      return {
        data,
        total,
      };
    });

    const pageCount = Math.ceil(total / per_page);
    return { data, pageCount };
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return { data: [], pageCount: 0 };
  }
}

/**
 * Get all transactions.
 */
export async function getAllTransactions() {
  try {
    const data = await db.select().from(transactions);

    return data;
  } catch (err) {
    console.error("Error fetching all transactions:", err);
    return [];
  }
}

/**
 * Get payment types.
 */
export async function getPaymentTypes() {
  return await db.select().from(paymentTypes);
}

/**
 * Get transaction statuses.
 */
export async function getTransactionStatuses() {
  return await db.select().from(transactionStatuses);
}
