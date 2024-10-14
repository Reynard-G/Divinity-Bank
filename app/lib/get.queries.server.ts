import { and, asc, count, desc, eq, or, type SQL, sql } from "drizzle-orm";

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
  type User,
  users,
  UserSetting,
  userSettings,
} from "~/lib/db/schema";
import { filterColumn } from "~/lib/utils/filterColumns";
import { GetTransactionsSchema } from "~/lib/validations";
import { type DrizzleWhere } from "~/types/DataTable";
import { NonSensitiveUser } from "~/types/User";

/**
 * Get all servers.
 *
 * @returns All servers.
 */
export async function getServers(): Promise<Server[]> {
  return db.select().from(servers).orderBy(asc(servers.id));
}

/**
 * Get a user by their ID.
 *
 * @param userId The ID of the user.
 * @returns The user.
 */
export async function getUserById(userId: number): Promise<User | null> {
  return db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .then((res) => res[0] ?? null);
}

/**
 * Get user settings by their ID.
 *
 * @param userId The ID of the user.
 * @returns The user settings.
 */
export async function getUserSettingsById(
  userId: number,
): Promise<UserSetting> {
  return db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .then((res) => res[0] ?? null);
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
      created_at: users.createdAt,
      updated_at: users.updatedAt,
    })
    .from(users)
    .orderBy(asc(users.id));
}

/**
 * Get account settings for a user.
 *
 * @param userId The ID of the user.
 * @returns The account settings.
 */
export async function getAccountSettings(
  userId: number,
): Promise<Partial<User>> {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    minecraftUsername: user.minecraftUsername,
    minecraftUuid: user.minecraftUuid,
    discordUsername: user.discordUsername,
  };
}

/**
 * Get appearance settings for a user.
 *
 * @param userId The ID of the user.
 * @returns The appearance settings.
 */
export async function getAppearanceSettings(
  userId: number,
): Promise<Partial<UserSetting>> {
  const userSettings = await getUserSettingsById(userId);

  if (!userSettings) {
    throw new Error("User settings not found");
  }

  return {
    font: userSettings.font,
  };
}

/**
 * Get notification settings for a user.
 *
 * @param userId The ID of the user.
 * @returns The notification settings.
 */
export async function getNotificationSettings(
  userId: number,
): Promise<Partial<UserSetting>> {
  const userSettings = await getUserSettingsById(userId);

  if (!userSettings) {
    throw new Error("User settings not found");
  }

  return {
    discordCommunication: userSettings.discordCommunication,
    discordTransactions: userSettings.discordTransactions,
    discordSecurity: userSettings.discordSecurity,
  };
}

/**
 * Get transactions based on the input provided. This function is used to
 * fetch transactions for the transactions table using the search parameters
 * provided by the user.
 *
 * @param userId The ID of the user fetching the transactions.
 * @param serverShortName The short name of the server.
 * @param input The input parameters for fetching transactions.
 * @returns The transactions and the total number of pages.
 */
export async function getTransactions(
  userId: number,
  serverShortName: string,
  input: GetTransactionsSchema,
): Promise<{ data: Transaction[]; pageCount: number }> {
  const { page, per_page, sort, note, paymentType, status, operator } = input;

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
    !operator || operator === "and" ? and(...expressions) : or(...expressions);

  const { data, total } = await db
    .transaction(async (tx) => {
      const [user, server] = await Promise.all([
        tx
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .then((res) => res[0]),
        tx
          .select()
          .from(servers)
          .where(eq(servers.shortName, serverShortName))
          .then((res) => res[0]),
      ]);

      if (!user) {
        throw new Error("User not found");
      }

      if (!server) {
        throw new Error("Server not found");
      }

      const data = await tx
        .select()
        .from(transactions)
        .limit(per_page)
        .offset(offset)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.serverId, server.id),
            where,
          ),
        )
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
    })
    .catch((err) => {
      console.error("Error fetching transactions:", err);
      throw new Error("Error fetching transactions");
    });

  const pageCount = Math.ceil(total / per_page);
  return { data, pageCount };
}

/**
 * Get all transactions of a user.
 *
 * @param userId The ID of the user fetching the transactions.
 * @param serverShortName The short name of the server.
 * @returns All transactions of the user.
 */
export async function getAllTransactions(
  userId: number,
  serverShortName: string,
): Promise<Transaction[]> {
  return await db
    .transaction(async (tx) => {
      const server = await tx
        .select()
        .from(servers)
        .where(eq(servers.shortName, serverShortName))
        .then((res) => res[0]);

      if (!server) {
        throw new Error("Server not found");
      }

      const data = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.serverId, server.id),
          ),
        )
        .orderBy(asc(transactions.id));

      return data;
    })
    .catch((err) => {
      console.error("Error fetching all transactions:", err);
      throw new Error("Error fetching all transactions");
    });
}

/**
 * Get transaction summary for a user on a specific server.
 *
 * @param userId The ID of the user.
 * @param serverShortName The short name of the server.
 * @returns An object containing the transaction count and the latest transaction date.
 */
export async function getTransactionSummary(
  userId: number,
  serverShortName: string,
): Promise<{ transactionsCount: number | null; latestTransactionDate: Date | null }> {
  return await db.transaction(async (tx) => {
    const server = await tx
      .select()
      .from(servers)
      .where(eq(servers.shortName, serverShortName))
      .then((res) => res[0]);

    if (!server) {
      throw new Error("Server not found");
    }

    const result = await tx
      .select({
        transactionCount: count(),
        latestTransactionDate: sql<
          string | null
        >`MAX(${transactions.createdAt})`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.serverId, server.id),
        ),
      )
      .then((res) => res[0]);

    if (Number(result.transactionCount) === 0) {
      return {
        transactionsCount: null,
        latestTransactionDate: null,
      };
    }

    return {
      transactionsCount: Number(result.transactionCount),
      latestTransactionDate: result.latestTransactionDate
        ? new Date(result.latestTransactionDate)
        : null,
    };
  });
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
 * @param serverShortName The short name of the server.
 * @returns The balance of the user.
 */
export async function getBalance(
  userId: number,
  serverShortName: string,
): Promise<number | null> {
  return await db.transaction(async (tx) => {
    const [user, server] = await Promise.all([
      tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then((res) => res[0]),
      tx
        .select()
        .from(servers)
        .where(eq(servers.shortName, serverShortName))
        .then((res) => res[0]),
    ]);

    if (!user) {
      throw new Error("User not found");
    }

    if (!server) {
      throw new Error("Server not found");
    }

    // Check if the user has any transactions on the server, if not, return null
    const transactionCount = await tx
      .select({ count: count() })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.serverId, server.id),
        ),
      )
      .then((res) => res[0]?.count ?? 0);

    if (transactionCount === 0) {
      return null;
    }

    const [creditBalance, debitBalance] = await Promise.all([
      tx
        .select({ amount: sql<string>`SUM(amount)` })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.serverId, server.id),
            eq(transactions.transactionType, TransactionTypes.CREDIT),
            eq(transactions.status, TransactionStatuses.SUCCESS),
          ),
        )
        .then((res) => res[0]?.amount ?? 0),
      tx
        .select({ amount: sql<string>`SUM(amount)` })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.serverId, server.id),
            eq(transactions.transactionType, TransactionTypes.DEBIT),
            or(
              eq(transactions.status, TransactionStatuses.SUCCESS),
              eq(transactions.status, TransactionStatuses.PENDING),
            ),
          ),
        )
        .then((res) => res[0]?.amount ?? 0),
    ]);

    return Number(creditBalance) - Number(debitBalance);
  });
}

/**
 * Get the total balance of a server.
 *
 * @param serverShortName The short name of the server.
 * @returns The total balance of the server.
 */
export async function getTotalServerBalance(
  serverShortName: string,
): Promise<number> {
  return await db.transaction(async (tx) => {
    const server = await tx
      .select()
      .from(servers)
      .where(eq(servers.shortName, serverShortName))
      .then((res) => res[0]);

    if (!server) {
      throw new Error("Server not found");
    }

    const [creditBalance, debitBalance] = await Promise.all([
      tx
        .select({ amount: sql<string>`SUM(amount)`
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.serverId, server.id),
            eq(transactions.transactionType, TransactionTypes.CREDIT),
            eq(transactions.status, TransactionStatuses.SUCCESS),
          ),
        )
        .then((res) => res[0]?.amount ?? 0),
      tx
        .select({ amount: sql<string>`SUM(amount)`
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.serverId, server.id),
            eq(transactions.transactionType, TransactionTypes.DEBIT),
            or(
              eq(transactions.status, TransactionStatuses.SUCCESS),
              eq(transactions.status, TransactionStatuses.PENDING),
            ),
          ),
        )
        .then((res) => res[0]?.amount ?? 0),
    ]);

    return Number(creditBalance) - Number(debitBalance);
  });
}