import { and, asc, count, desc, eq, or, type SQL, sql } from "drizzle-orm";

import PaymentTypes from "~/constants/PaymentTypes";
import TransactionStatuses from "~/constants/TransactionStatuses";
import TransactionTypes from "~/constants/TransactionTypes";
import { db } from "~/lib/db/db.server";
import {
  paymentTypes,
  servers,
  type Transaction,
  transactions,
  transactionStatuses,
  users,
} from "~/lib/db/schema";
import { filterColumn } from "~/lib/utils/filterColumns";
import { GetTransactionsSchema } from "~/lib/validations";
import { type DrizzleWhere } from "~/types/DataTable";

import { formatCurrency } from "./utils/formatCurrency";

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
    throw new Error("Error fetching transactions");
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
    throw new Error("Error fetching all transactions");
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

export async function getBalance(userId: number) {
  return await db.transaction(async (tx) => {
    const user = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0]);

    if (!user) {
      throw new Error("User not found");
    }

    const creditBalance = await tx
      .select({ amount: sql<string>`SUM(amount)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.transactionType, TransactionTypes.CREDIT),
          eq(transactions.status, TransactionStatuses.SUCCESS),
        ),
      )
      .then((res) => res[0]?.amount ?? 0);

    const debitBalance = await tx
      .select({ amount: sql<string>`SUM(amount)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.transactionType, TransactionTypes.DEBIT),
          or(
            eq(transactions.status, TransactionStatuses.SUCCESS),
            eq(transactions.status, TransactionStatuses.PENDING),
          ),
        ),
      )
      .then((res) => res[0]?.amount ?? 0);

    return Number(creditBalance) - Number(debitBalance);
  });
}

/**
 * Deposit money into a user's account.
 *
 * @param userId The ID of the user depositing the money.
 * @param amount The amount to deposit.
 * @param proofOfDeposit A proof of deposit.
 * @returns The new balance of the user.
 */
export async function deposit(
  userId: number,
  amount: number,
  proofOfDeposit: string,
) {
  return await db.transaction(async (tx) => {
    const user = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0]);

    if (!user) {
      throw new Error("User not found");
    }

    const newBalance = (await getBalance(userId)) + Number(amount);

    await tx.insert(transactions).values({
      userId,
      createdByUserId: userId,
      amount: amount.toString(),
      fee: "0",
      transactionType: TransactionTypes.CREDIT,
      paymentType: PaymentTypes.DEPOSIT,
      attachment: proofOfDeposit,
      note: `Deposit of ${formatCurrency(amount)}`,
      status: TransactionStatuses.PENDING,
    });

    return newBalance;
  });
}

/**
 * Withdraw money from a user's account.
 *
 * @param userId The ID of the user withdrawing the money.
 * @param amount The amount to withdraw.
 * @returns The new balance of the user.
 */
export async function withdraw(userId: number, amount: number) {
  return await db.transaction(async (tx) => {
    const user = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0]);

    if (!user) {
      throw new Error("User not found");
    }

    const balance = await getBalance(userId);

    if (balance < Number(amount)) {
      throw new Error("Insufficient funds");
    }

    await tx.insert(transactions).values({
      userId,
      createdByUserId: userId,
      amount: amount.toString(),
      fee: "0",
      transactionType: TransactionTypes.DEBIT,
      paymentType: PaymentTypes.WITHDRAW,
      note: `Withdrawal of ${formatCurrency(amount)}`,
      status: TransactionStatuses.PENDING,
    });

    return balance - Number(amount);
  });
}

/**
 * Transfer money from one user to another.
 *
 * @param userId The ID of the user sending the money.
 * @param recipientId The ID of the user receiving the money.
 * @param amount The amount to transfer.
 * @returns The new balance of the user sending the money.
 */
export async function transfer(
  userId: number,
  recipientId: number,
  amount: number,
) {
  return await db.transaction(async (tx) => {
    const user = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0]);

    if (!user) {
      throw new Error("User not found");
    }

    const recipient = await tx
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .then((res) => res[0]);

    if (!recipient) {
      throw new Error("Recipient not found");
    }

    const balance = await getBalance(userId);

    if (balance < Number(amount)) {
      throw new Error("Insufficient funds");
    }

    await tx.insert(transactions).values({
      userId,
      createdByUserId: userId,
      amount: amount.toString(),
      fee: "0",
      transactionType: TransactionTypes.DEBIT,
      paymentType: PaymentTypes.TRANSFER,
      note: `Transfer of ${formatCurrency(amount)} to ${recipient.id} (${recipient.minecraftUsername})`,
      status: TransactionStatuses.SUCCESS,
    });

    await tx.insert(transactions).values({
      userId: recipientId,
      createdByUserId: userId,
      amount: amount.toString(),
      fee: "0",
      transactionType: TransactionTypes.CREDIT,
      paymentType: PaymentTypes.TRANSFER,
      note: `Transfer of ${formatCurrency(amount)} from ${user.id} (${user.minecraftUsername})`,
      status: TransactionStatuses.SUCCESS,
    });

    return balance - Number(amount);
  });
}
