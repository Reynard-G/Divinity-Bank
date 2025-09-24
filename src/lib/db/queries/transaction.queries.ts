"use server";

import { cache } from "react";
import { sql, and, asc, desc, eq, count } from "drizzle-orm";
import Decimal from "decimal.js-light";

import { db } from "@/lib/db";
import {
  transactions,
  users,
  servers,
  type Transaction,
} from "@/lib/db/schema";
import { buildWhereClause } from "@/lib/db/queries/query-utils";
import { TRANSACTION_STATUSES } from "@/lib/constants/transaction-statuses";
import { TRANSACTION_TYPES } from "@/lib/constants/transaction-types";
import type { ExtendedColumnFilter, JoinOperator } from "@/types/data-table";

export interface ServerBalance {
  serverId: number;
  balance: number;
}

export interface ServerTransactionCount {
  serverId: number;
  transactionCount: number;
}

export interface ServerLatestTransaction {
  serverId: number;
  latestTransactionDate: Date | null;
}

export interface GetTransactionsInput {
  page: number;
  perPage: number;
  sort?: Array<{ id: string; desc: boolean }>;
  filters?: ExtendedColumnFilter<TransactionWithDetails>[];
  joinOperator?: JoinOperator;
  userId?: number;
  serverId?: number;
}

export interface TransactionWithDetails {
  id: number;
  amount: string;
  fee: string;
  transactionType: string;
  paymentType: string;
  status: string;
  note: string | null;
  attachment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    minecraftUsername: string;
    discordUsername: string;
  };
  createdByUser: {
    id: number;
    minecraftUsername: string;
    minecraftUuid: string;
    discordUsername: string;
  };
  server: {
    id: number;
    name: string;
    shortName: string;
  };
}

/**
 * Fetches a transaction by its ID.
 *
 * @param id - The ID of the transaction to fetch.
 * @returns The transaction object if found, otherwise null.
 * @throws Error if the database query fails.
 */
export async function getTransactionById(
  id: number
): Promise<Transaction | null> {
  try {
    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .then((res) => res[0] || null);

    return transaction;
  } catch (error) {
    console.error(`Failed to get transaction with id ${id}:`, error);
    throw new Error("Failed to retrieve transaction");
  }
}

/**
 * Fetches a transaction by its ID with all related details.
 *
 * @param id - The ID of the transaction to fetch.
 * @returns The transaction object with details if found, otherwise null.
 * @throws Error if the database query fails.
 */
export async function getTransactionByIdWithDetails(
  id: number
): Promise<TransactionWithDetails | null> {
  try {
    const transaction = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        fee: transactions.fee,
        transactionType: transactions.transactionType,
        paymentType: transactions.paymentType,
        status: transactions.status,
        note: transactions.note,
        attachment: transactions.attachment,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        user: {
          id: users.id,
          minecraftUsername: users.minecraftUsername,
          discordUsername: users.discordUsername,
        },
        createdByUser: {
          id: sql<number>`created_by_user.id`,
          minecraftUsername: sql<string>`created_by_user.minecraft_username`,
          minecraftUuid: sql<string>`created_by_user.minecraft_uuid`,
          discordUsername: sql<string>`created_by_user.discord_username`,
        },
        server: {
          id: servers.id,
          name: servers.name,
          shortName: servers.shortName,
        },
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .innerJoin(
        sql`"Users" AS created_by_user`,
        eq(transactions.createdByUserId, sql`created_by_user.id`)
      )
      .innerJoin(servers, eq(transactions.serverId, servers.id))
      .where(eq(transactions.id, id))
      .then((res) => res[0] || null);

    return transaction;
  } catch (error) {
    console.error(
      `Failed to get transaction with details for id ${id}:`,
      error
    );
    throw new Error("Failed to retrieve transaction with details");
  }
}

/**
 * Fetches the balance of the current user for a specific server.
 *
 * @param userId - The ID of the user whose balance is to be fetched.
 * @param serverId - The ID of the server for which the balance is to be fetched.
 * @returns The balance as a number, or 0 if no transactions are found.
 * @throws Error if the database query fails.
 */
export const getBalance = cache(
  async (userId: number, serverId: number): Promise<number> => {
    try {
      /**
       * Calculates the total credit and debit amounts for a specific user and server.
       *
       * Credit Sum: Totals all SUCCESSFUL credit transactions (money added to account)
       * Debit Sum: Totals all PENDING and SUCCESSFUL debit transactions (money spent/reserved)
       *
       * The reason for including PENDING debits is to account for funds that are
       * reserved/withdrawn but not yet fully processed, ensuring the available
       * balance reflects these pending transactions.
       *
       * The query uses conditional aggregation with CASE statements to:
       * 1. Sum credits only when transaction type is CREDIT and status is SUCCESS
       * 2. Sum debits when transaction type is DEBIT and status is PENDING or SUCCESS
       * 3. Return "0" as default using COALESCE if no matching transactions exist (e.g., new user)
       *
       * This effectively calculates available balance by including:
       * - All successfully added funds (credits)
       * - All reserved and committed funds (debits)
       *
       * @returns Object with creditSum and debitSum as strings
       */
      const result = await db
        .select({
          creditSum: sql<string>`
            COALESCE( SUM(
            CASE 
            WHEN ${transactions.transactionType} = ${TRANSACTION_TYPES.CREDIT} 
              AND ${transactions.status} = ${TRANSACTION_STATUSES.SUCCESS} THEN
              ${transactions.amount} 
              ELSE 0 
            END ), 0 )
          `,
          debitSum: sql<string>`
            COALESCE( SUM(
            CASE 
            WHEN ${transactions.transactionType} = ${TRANSACTION_TYPES.DEBIT} 
              AND
              ${transactions.status} IN (${TRANSACTION_STATUSES.PENDING},
                                         ${TRANSACTION_STATUSES.SUCCESS}) THEN
              ${transactions.amount} 
              ELSE 0 
            END ), 0 )
          `,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.serverId, serverId)
          )
        )
        .then((res) => res[0] ?? { creditSum: "0", debitSum: "0" });

      return new Decimal(result.creditSum)
        .minus(new Decimal(result.debitSum))
        .toNumber();
    } catch (error) {
      console.error(
        `Failed to get balance for user ${userId} on server ${serverId}:`,
        error
      );
      throw new Error("Failed to retrieve account balance");
    }
  }
);

/**
 * Fetches the balances for all servers for a specific user in a single query.
 * This is much more efficient than calling getBalance() for each server individually.
 *
 * @param userId - The ID of the user whose server balances are to be fetched.
 * @returns An array of ServerBalance objects, each containing a server ID and its balance.
 * @throws Error if the database query fails.
 */
export const getAllServerBalances = cache(
  async (userId: number): Promise<ServerBalance[]> => {
    try {
      const results = await db
        .select({
          serverId: transactions.serverId,
          balance: sql<string>`
        COALESCE(
          SUM(CASE WHEN ${transactions.transactionType} = ${TRANSACTION_TYPES.CREDIT} THEN ${transactions.amount} ELSE 0 END), 0
        ) - COALESCE(
          SUM(CASE WHEN ${transactions.transactionType} = ${TRANSACTION_TYPES.DEBIT} THEN ${transactions.amount} ELSE 0 END), 0
        )
      `,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.status, TRANSACTION_STATUSES.SUCCESS)
          )
        )
        .groupBy(transactions.serverId);

      return results.map((result) => ({
        serverId: result.serverId,
        balance: new Decimal(result.balance).toNumber(),
      }));
    } catch (error) {
      console.error(
        `Failed to get all server balances for user ${userId}:`,
        error
      );
      throw new Error("Failed to retrieve user's server balances");
    }
  }
);

/**
 * Fetches the transaction count for a user on a specific server.
 *
 * @param userId - The ID of the user.
 * @param serverId - The ID of the server.
 * @returns The count of transactions as a number.
 * @throws Error if the database query fails.
 */
export async function getTransactionCount(
  userId: number,
  serverId: number
): Promise<number> {
  try {
    const transactionCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.serverId, serverId)
        )
      )
      .then((res) => res[0]?.count ?? 0);

    return Number(transactionCount);
  } catch (error) {
    console.error(
      `Failed to get transaction count for user ${userId} on server ${serverId}:`,
      error
    );
    throw new Error("Failed to retrieve transaction count");
  }
}

/**
 * Fetches the transaction counts for all servers for a specific user in a single query.
 *
 * @param userId - The ID of the user whose server transaction counts are to be fetched.
 * @returns An array of ServerTransactionCount objects, each containing a server ID and its transaction count.
 * @throws Error if the database query fails.
 */
export const getAllServerTransactionCounts = cache(
  async (userId: number): Promise<ServerTransactionCount[]> => {
    try {
      const results = await db
        .select({
          serverId: transactions.serverId,
          transactionCount: sql<number>`COUNT(*)`,
        })
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .groupBy(transactions.serverId);

      return results.map((result) => ({
        serverId: result.serverId,
        transactionCount: Number(result.transactionCount),
      }));
    } catch (error) {
      console.error(
        `Failed to get all server transaction counts for user ${userId}:`,
        error
      );
      throw new Error("Failed to retrieve user's server transaction counts");
    }
  }
);

/**
 * Fetches the latest transaction date for a user on a specific server.
 *
 * @param userId - The ID of the user.
 * @param serverId - The ID of the server.
 * @returns The latest transaction date as a Date object, or null if no transactions are found.
 * @throws Error if the database query fails.
 */
export async function getLatestTransactionDate(
  userId: number,
  serverId: number
): Promise<Date | null> {
  try {
    const result = await db
      .select({
        latestDate: sql<string | null>`MAX(${transactions.createdAt})`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.serverId, serverId)
        )
      )
      .then((res) => res[0]?.latestDate || null);

    return result ? new Date(result) : null;
  } catch (error) {
    console.error(
      `Failed to get latest transaction date for user ${userId} on server ${serverId}:`,
      error
    );
    throw new Error("Failed to retrieve latest transaction date");
  }
}

/**
 * Fetches the latest transaction dates for all servers for a specific user in a single query.
 *
 * @param userId - The ID of the user whose server latest transaction dates are to be fetched.
 * @returns An array of ServerLatestTransaction objects, each containing a server ID and its latest transaction date.
 * @throws Error if the database query fails.
 */
export const getAllServerLatestTransactionDates = cache(
  async (userId: number): Promise<ServerLatestTransaction[]> => {
    try {
      const results = await db
        .select({
          serverId: transactions.serverId,
          latestTransactionDate: sql<
            string | null
          >`MAX(${transactions.createdAt})`,
        })
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .groupBy(transactions.serverId);

      return results.map((result) => ({
        serverId: result.serverId,
        latestTransactionDate: result.latestTransactionDate
          ? new Date(result.latestTransactionDate)
          : null,
      }));
    } catch (error) {
      console.error(
        `Failed to get all server latest transaction dates for user ${userId}:`,
        error
      );
      throw new Error(
        "Failed to retrieve user's server latest transaction dates"
      );
    }
  }
);

/**
 * Retrieves a paginated list of transactions with filtering, sorting, and relationship data.
 *
 * This function performs a complex query to fetch transactions along with their associated
 * user, creator, and server information. It supports pagination, multiple sort options,
 * and flexible filtering with AND/OR operators.
 *
 * @param input - The query parameters for retrieving transactions
 * @param input.page - The page number for pagination (1-based)
 * @param input.perPage - Number of transactions to return per page
 * @param input.sort - Array of sort criteria with column ID and direction (defaults to createdAt desc)
 * @param input.filters - Array of filter conditions to apply to the query (defaults to empty array)
 * @param input.joinOperator - Logical operator ("and" or "or") for combining filters (defaults to "and")
 * @param input.userId - User ID to filter transactions by user
 * @param input.serverId - Server ID to filter transactions by server
 *
 * @returns Promise that resolves to an object containing:
 *   - data: Array of transactions with user, creator, and server details
 *   - pageCount: Total number of pages based on perPage size
 *   - total: Total count of transactions matching the filters
 *
 * @throws Error if the database query fails.
 *
 * @example
 * ```typescript
 * const result = await getTransactions({
 *   page: 1,
 *   perPage: 10,
 *   sort: [{ id: "amount", desc: true }],
 *   filters: [{ column: "status", operator: "eq", value: "completed" }],
 *   userId: 123,
 *   serverId: 456
 * });
 * ```
 */
export async function getTransactions(input: GetTransactionsInput) {
  const {
    page,
    perPage,
    sort = [{ id: "createdAt", desc: true }],
    filters = [],
    joinOperator = "and",
    userId,
    serverId,
  } = input;

  const offset = (page - 1) * perPage;
  const where = buildWhereClause(filters, joinOperator, userId, serverId);

  // Build order by clause
  const orderBy = sort.map((sortItem) => {
    switch (sortItem.id) {
      case "amount":
        return sortItem.desc
          ? desc(transactions.amount)
          : asc(transactions.amount);
      case "fee":
        return sortItem.desc ? desc(transactions.fee) : asc(transactions.fee);
      case "transactionType":
        return sortItem.desc
          ? desc(transactions.transactionType)
          : asc(transactions.transactionType);
      case "paymentType":
        return sortItem.desc
          ? desc(transactions.paymentType)
          : asc(transactions.paymentType);
      case "status":
        return sortItem.desc
          ? desc(transactions.status)
          : asc(transactions.status);
      case "createdAt":
        return sortItem.desc
          ? desc(transactions.createdAt)
          : asc(transactions.createdAt);
      case "updatedAt":
        return sortItem.desc
          ? desc(transactions.updatedAt)
          : asc(transactions.updatedAt);
      default:
        return sortItem.desc
          ? desc(transactions.createdAt)
          : asc(transactions.createdAt);
    }
  });

  // Get paginated data with relationships
  let data: TransactionWithDetails[];
  try {
    data = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        fee: transactions.fee,
        transactionType: transactions.transactionType,
        paymentType: transactions.paymentType,
        status: transactions.status,
        note: transactions.note,
        attachment: transactions.attachment,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        user: {
          id: users.id,
          minecraftUsername: users.minecraftUsername,
          discordUsername: users.discordUsername,
        },
        createdByUser: {
          id: sql<number>`created_by_user.id`,
          minecraftUsername: sql<string>`created_by_user.minecraft_username`,
          minecraftUuid: sql<string>`created_by_user.minecraft_uuid`,
          discordUsername: sql<string>`created_by_user.discord_username`,
        },
        server: {
          id: servers.id,
          name: servers.name,
          shortName: servers.shortName,
        },
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .innerJoin(
        sql`"Users" AS created_by_user`,
        eq(transactions.createdByUserId, sql`created_by_user.id`)
      )
      .innerJoin(servers, eq(transactions.serverId, servers.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(perPage)
      .offset(offset);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }

  // Get total count
  let totalResult: { count: number }[];
  try {
    totalResult = await db
      .select({ count: count() })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .innerJoin(servers, eq(transactions.serverId, servers.id))
      .where(where);
  } catch (error) {
    console.error("Error fetching transaction count:", error);
    throw new Error("Failed to fetch transaction count");
  }

  const total = totalResult[0].count ?? 0;
  const pageCount = Math.ceil(total / perPage);

  return {
    data,
    pageCount,
    total,
  };
}
/**
 * Fetches counts of transactions grouped by their status for a specific user and server.
 *
 * @param userId - The ID of the user whose transactions are to be counted.
 * @param serverId - The ID of the server for which the transactions are to be counted.
 * @return A record mapping each transaction status to its count.
 * @throws Error if the database query fails.
 */
export async function getTransactionStatusCounts(
  serverId: number,
  userId: number
): Promise<Record<string, number>> {
  try {
    const results = await db
      .select({
        status: transactions.status,
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.serverId, serverId)
        )
      )
      .groupBy(transactions.status);

    return results.reduce(
      (acc, { status, count }) => {
        acc[status] = count;
        return acc;
      },
      {} as Record<string, number>
    );
  } catch (error) {
    console.error(
      `Failed to get transaction status counts for user ${userId} on server ${serverId}:`,
      error
    );
    throw new Error("Failed to retrieve transaction status counts");
  }
}

/**
 * Fetches counts of transactions grouped by their type for a specific user and server.
 *
 * @param userId - The ID of the user whose transactions are to be counted.
 * @param serverId - The ID of the server for which the transactions are to be counted.
 * @return A record mapping each transaction type to its count.
 * @throws Error if the database query fails.
 */
export async function getTransactionTypeCounts(
  userId: number,
  serverId: number
): Promise<Record<string, number>> {
  try {
    const results = await db
      .select({
        type: transactions.transactionType,
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.serverId, serverId)
        )
      )
      .groupBy(transactions.transactionType);

    return results.reduce(
      (acc, { type, count }) => {
        acc[type] = count;
        return acc;
      },
      {} as Record<string, number>
    );
  } catch (error) {
    console.error(
      `Failed to get transaction type counts for user ${userId} on server ${serverId}:`,
      error
    );
    throw new Error("Failed to retrieve transaction type counts");
  }
}

/**
 * Fetches counts of transactions grouped by their payment type for a specific user and server.
 *
 * @param userId - The ID of the user whose transactions are to be counted.
 * @param serverId - The ID of the server for which the transactions are to be counted.
 * @return A record mapping each payment type to its count.
 * @throws Error if the database query fails.
 */
export async function getPaymentTypeCounts(
  userId: number,
  serverId: number
): Promise<Record<string, number>> {
  try {
    const results = await db
      .select({
        type: transactions.paymentType,
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.serverId, serverId)
        )
      )
      .groupBy(transactions.paymentType);

    return results.reduce(
      (acc, { type, count }) => {
        acc[type] = count;
        return acc;
      },
      {} as Record<string, number>
    );
  } catch (error) {
    console.error(
      `Failed to get payment type counts for user ${userId} on server ${serverId}:`,
      error
    );
    throw new Error("Failed to retrieve payment type counts");
  }
}

/**
 * Fetches counts of transactions grouped by user for a specific user and server.
 *
 * @param userId - The ID of the user whose transactions are to be counted.
 * @param serverId - The ID of the server for which the transactions are to be counted.
 * @return A record mapping each username to an object containing user ID and count of transactions.
 * @throws Error if the database query fails.
 */
export async function getUserCounts(
  userId: number,
  serverId: number
): Promise<Record<string, { id: number; count: number }>> {
  try {
    const results = await db
      .select({
        id: users.id,
        username: users.minecraftUsername,
        count: count(),
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.serverId, serverId)
        )
      )
      .groupBy(users.id);

    return results.reduce(
      (acc, { id, username, count }) => {
        acc[username] = { id, count };
        return acc;
      },
      {} as Record<string, { id: number; count: number }>
    );
  } catch (error) {
    console.error(
      `Failed to get user counts for user ${userId} on server ${serverId}:`,
      error
    );
    throw new Error("Failed to retrieve user counts");
  }
}

/**
 * Fetches the minimum and maximum transaction amounts for a specific user and server.
 *
 * @param userId - The ID of the user whose transaction amounts are to be analyzed.
 * @param serverId - The ID of the server for which the transaction amounts are to be analyzed.
 * @returns An object containing the minimum and maximum transaction amounts.
 * @throws Error if the database query fails.
 */
export async function getAmountRange(
  userId: number,
  serverId: number
): Promise<{ min: number; max: number }> {
  try {
    const result = await db
      .select({
        min: sql<number>`COALESCE(MIN(CAST(${transactions.amount} AS DECIMAL)), 0)`,
        max: sql<number>`COALESCE(MAX(CAST(${transactions.amount} AS DECIMAL)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.serverId, serverId)
        )
      );

    return result[0] ?? { min: 0, max: 0 };
  } catch (error) {
    console.error(
      `Failed to get amount range for user ${userId} on server ${serverId}:`,
      error
    );
    throw new Error("Failed to retrieve amount range");
  }
}
