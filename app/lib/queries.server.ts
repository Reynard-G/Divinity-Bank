import { and, asc, count, desc, eq, or, type SQL, sql } from "drizzle-orm";

import PaymentTypes from "~/constants/PaymentTypes";
import TransactionStatuses from "~/constants/TransactionStatuses";
import TransactionTypes from "~/constants/TransactionTypes";
import { db } from "~/lib/db/db.server";
import {
  type PaymentType,
  paymentTypes,
  type Server,
  servers,
  type Transaction,
  transactions,
  type TransactionStatus,
  transactionStatuses,
  users,
} from "~/lib/db/schema";
import { filterColumn } from "~/lib/utils/filterColumns";
import { GetTransactionsSchema } from "~/lib/validations";
import { type DrizzleWhere } from "~/types/DataTable";
import { NonSensitiveUser } from "~/types/User";

import { formatCurrency } from "./utils/formatCurrency";

/**
 * Get all servers.
 *
 * @returns All servers.
 */
export async function getServers(): Promise<Server[]> {
  return db.select().from(servers).orderBy(asc(servers.id));
}

/**
 * Get non-sensitive information about all users. This is useful for
 * displaying user information in a non-sensitive way to the public.
 *
 * @returns Non-sensitive information about all users.
 */
export async function getNonSensitiveUserInfo(): Promise<NonSensitiveUser[]> {
  return db
    .select({
      id: users.id,
      account_type: users.accountType,
      minecraft_uuid: users.minecraftUuid,
      minecraft_username: users.minecraftUsername,
      discord_username: users.discordUsername,
      role: users.role,
      created_at: users.createdAt,
      updated_at: users.updatedAt,
    })
    .from(users)
    .orderBy(asc(users.id));
}

/**
 * Get transactions based on the input provided. This function is used to
 * fetch transactions for the transactions table using the search parameters
 * provided by the user.
 *
 * @param userId The ID of the user fetching the transactions.
 * @param input The input parameters for fetching transactions.
 * @returns The transactions and the total number of pages.
 */
export async function getTransactions(
  userId: number,
  input: GetTransactionsSchema,
): Promise<{ data: Transaction[]; pageCount: number }> {
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
        .where(and(eq(transactions.userId, userId), where))
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
 *
 * @returns All transactions.
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const data = await db
      .select()
      .from(transactions)
      .orderBy(asc(transactions.id));

    return data;
  } catch (err) {
    console.error("Error fetching all transactions:", err);
    throw new Error("Error fetching all transactions");
  }
}

/**
 * Get payment types.
 *
 * @returns The payment types.
 */
export async function getPaymentTypes(): Promise<PaymentType[]> {
  return await db.select().from(paymentTypes);
}

/**
 * Get transaction statuses.
 *
 * @returns The transaction statuses.
 */
export async function getTransactionStatuses(): Promise<TransactionStatus[]> {
  return await db.select().from(transactionStatuses);
}

/**
 * Get a user's balance.
 *
 * @param userId The ID of the user to get the balance for.
 * @returns The balance of the user.
 */
export async function getBalance(userId: number): Promise<number> {
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
): Promise<number> {
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
export async function withdraw(
  userId: number,
  amount: number,
): Promise<number> {
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
): Promise<number> {
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
