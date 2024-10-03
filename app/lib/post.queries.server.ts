import { hash } from "@node-rs/bcrypt";
import { eq } from "drizzle-orm";

import PaymentTypes from "~/constants/PaymentTypes";
import TransactionStatuses from "~/constants/TransactionStatuses";
import TransactionTypes from "~/constants/TransactionTypes";
import { db } from "~/lib/db/db.server";
import {
  servers,
  transactions,
  User,
  users,
  UserSetting,
  userSettings,
} from "~/lib/db/schema";
import { getBalance } from "~/lib/get.queries.server";
import { formatCurrency } from "~/lib/utils/formatCurrency";

/**
 * Deposit money into a user's account.
 *
 * @param userId The ID of the user depositing the money.
 * @param amount The amount to deposit.
 * @param proofOfDeposit A proof of deposit.
 * @param serverShortName The short name of the server.
 * @returns The new balance of the user.
 */
export async function deposit(
  userId: number,
  amount: number,
  proofOfDeposit: string,
  serverShortName: string,
): Promise<number> {
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

    const newBalance =
      (await getBalance(userId, serverShortName)) + Number(amount);

    await tx.insert(transactions).values({
      serverId: server.id,
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
 * @param serverShortName The short name of the server.
 * @returns The new balance of the user.
 */
export async function withdraw(
  userId: number,
  amount: number,
  serverShortName: string,
): Promise<number> {
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

    const balance = await getBalance(userId, serverShortName);

    if (balance < Number(amount)) {
      throw new Error("Insufficient funds");
    }

    await tx.insert(transactions).values({
      serverId: server.id,
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
 * @param serverShortName The short name of the server.
 * @returns The new balance of the user sending the money.
 */
export async function transfer(
  userId: number,
  recipientId: number,
  amount: number,
  serverShortName: string,
): Promise<number> {
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

    const recipient = await tx
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .then((res) => res[0]);

    if (!recipient) {
      throw new Error("Recipient not found");
    }

    const balance = await getBalance(userId, serverShortName);

    if (balance < Number(amount)) {
      throw new Error("Insufficient funds");
    }

    await tx.insert(transactions).values({
      serverId: server.id,
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
      serverId: server.id,
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

/**
 * Change a user's password.
 *
 * @param userId The ID of the user.
 * @param newPassword The new password.
 * @returns The new hashed password.
 */
export async function changePassword(
  userId: number,
  newPassword: string,
): Promise<string> {
  const hashedPassword = await hash(newPassword, 12);

  await db.update(users).set({ hashedPassword }).where(eq(users.id, userId));

  return hashedPassword;
}

/**
 * Update a user's account settings.
 *
 * @param userId The ID of the user.
 * @param settings The settings to update.
 */
export async function updateAccountSettings(
  userId: number,
  settings: Omit<
    Partial<User>,
    "id" | "hashedPassword" | "createdAt" | "updatedAt"
  >,
): Promise<void> {
  await db.update(users).set(settings).where(eq(users.id, userId));
}

/**
 * Update a user's appearance settings.
 *
 * @param userId The ID of the user.
 * @param settings The settings to update.
 */
export async function updateAppearanceSettings(
  userId: number,
  settings: Omit<
    Partial<UserSetting>,
    | "id"
    | "user_id"
    | "discordCommunication"
    | "discordTransactions"
    | "discordSecurity"
  >,
): Promise<void> {
  await db
    .update(userSettings)
    .set(settings)
    .where(eq(userSettings.userId, userId));
}

/**
 * Get a user's notification settings.
 *
 * @param userId The ID of the user.
 * @returns The user's notification settings.
 */
export async function updateNotificationSettings(
  userId: number,
  settings: Omit<Partial<UserSetting>, "id" | "user_id" | "font">,
): Promise<void> {
  await db
    .update(userSettings)
    .set(settings)
    .where(eq(userSettings.userId, userId));
}
