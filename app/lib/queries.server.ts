import { db } from "~/lib/db/db.server";
import {
  servers,
  transactions,
  type Transaction,
  paymentTypes,
  transactionStatuses,
} from "~/lib/db/schema";
import { type DrizzleWhere } from "~/types/DataTable";
import { and, asc, count, desc, or, type SQL } from "drizzle-orm";

import { filterColumn } from "~/lib/utils/filterColumns";
import { GetTransactionsSchema } from "~/lib/validations";

export async function getServers() {
  return db.select().from(servers).execute();
}

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
        .execute()
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

export async function getAllTransactions() {
  try {
    const data = await db.select().from(transactions).execute();

    return data;
  } catch (err) {
    console.error("Error fetching all transactions:", err);
    return [];
  }
}

export async function getPaymentTypes() {
  return db.select().from(paymentTypes).execute();
}

export async function getTransactionStatuses() {
  return db.select().from(transactionStatuses).execute();
}
