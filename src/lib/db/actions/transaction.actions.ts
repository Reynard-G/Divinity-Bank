"use server";

import { eq } from "drizzle-orm";
import { NeonDatabase } from "drizzle-orm/neon-serverless";

import { getSession } from "@/lib/auth/jwt";
import { PAYMENT_TYPES } from "@/lib/constants/payment-types";
import { TRANSACTION_STATUSES } from "@/lib/constants/transaction-statuses";
import { TRANSACTION_TYPES } from "@/lib/constants/transaction-types";
import { db } from "@/lib/db";
import { getBalance } from "@/lib/db/queries/transaction.queries";
import { transactions, transfers, balanceSnapshots } from "@/lib/db/schema";
import { getBalanceQuery } from "@/lib/db/utils/balance-query";
import { isMoreThanTwoDecimalPlaces } from "@/lib/utils/regex";

type TransactionFormState = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Deposit money into a user's account
 *
 * @param formData - The form data containing deposit details (including attachmentKey from presigned upload)
 * @return A promise that resolves to the transaction form state
 * @throws Error if the deposit process fails
 */
export async function deposit(
  formData: FormData
): Promise<TransactionFormState> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to make a deposit",
      };
    }

    const serverId = formData.get("serverId")?.toString();
    const amount = formData.get("amount")?.toString();
    const attachmentKey = formData.get("attachmentKey")?.toString();

    if (!amount || !attachmentKey || !serverId) {
      return {
        success: false,
        error: "Amount, proof of deposit, and server fields are required",
      };
    }

    // Validate that the attachment key matches expected path pattern
    const expectedPathPrefix = `transactions/server/${serverId}/deposits/`;
    if (!attachmentKey.startsWith(expectedPathPrefix)) {
      return {
        success: false,
        error: "Invalid attachment",
      };
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return {
        success: false,
        error: "Invalid amount",
      };
    }

    // Check for more than 2 decimal places
    if (isMoreThanTwoDecimalPlaces(amount)) {
      return {
        success: false,
        error: "Amount can only have up to 2 decimal places",
      };
    }

    await db.insert(transactions).values({
      serverId: parseInt(serverId),
      userId: parseInt(session.id),
      createdByUserId: parseInt(session.id),
      amount: amountNum.toString(),
      fee: "0.00",
      transactionType: TRANSACTION_TYPES.CREDIT,
      paymentType: PAYMENT_TYPES.DEPOSIT,
      attachment: attachmentKey,
      note: `Deposit of $${amountNum}`,
      status: TRANSACTION_STATUSES.PENDING,
    });

    return {
      success: true,
      message: "Your deposit has been submitted and is pending approval",
    };
  } catch (error) {
    console.error("Failed to process deposit:", error);
    return {
      success: false,
      error: "An unexpected error occurred during deposit",
    };
  }
}

/**
 * Withdraw money from a user's account
 *
 * @param formData - The form data containing withdrawal details
 * @return A promise that resolves to the transaction form state
 * @throws Error if the withdrawal process fails
 */
export async function withdraw(
  formData: FormData
): Promise<TransactionFormState> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to make a withdrawal",
      };
    }

    const amount = formData.get("amount")?.toString();
    const serverId = formData.get("serverId")?.toString();

    if (!amount || !serverId) {
      return {
        success: false,
        error: "Amount and server fields are required",
      };
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return {
        success: false,
        error: "Invalid amount",
      };
    }

    // Check for more than 2 decimal places
    if (isMoreThanTwoDecimalPlaces(amount)) {
      return {
        success: false,
        error: "Amount can only have up to 2 decimal places",
      };
    }

    await db.insert(transactions).values({
      serverId: parseInt(serverId),
      userId: parseInt(session.id),
      createdByUserId: parseInt(session.id),
      amount: amountNum.toString(),
      fee: "0.00",
      transactionType: TRANSACTION_TYPES.DEBIT,
      paymentType: PAYMENT_TYPES.WITHDRAW,
      note: `Withdrawal of $${amountNum}`,
      status: TRANSACTION_STATUSES.PENDING,
    });

    return {
      success: true,
      message: "Your withdrawal has been submitted and is being processed",
    };
  } catch (error) {
    console.error("Failed to process withdrawal:", error);
    return {
      success: false,
      error: "An unexpected error occurred during withdrawal.",
    };
  }
}

/**
 * Transfer money between users
 *
 * @param formData - The form data containing transfer details
 * @return A promise that resolves to the transaction form state
 * @throws Error if the transfer process fails
 */
export async function transfer(
  formData: FormData
): Promise<TransactionFormState> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to make a transfer",
      };
    }

    const amount = formData.get("amount")?.toString();
    const recipientId = formData.get("recipientId")?.toString();
    const recipientUsername = formData.get("recipientUsername")?.toString();
    const serverId = formData.get("serverId")?.toString();

    if (!amount || !recipientId || !serverId) {
      return {
        success: false,
        error: "Amount, recipient, and server fields are required",
      };
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return {
        success: false,
        error: "Invalid amount",
      };
    }

    // Check for more than 2 decimal places
    if (isMoreThanTwoDecimalPlaces(amount)) {
      return {
        success: false,
        error: "Amount can only have up to 2 decimal places",
      };
    }

    if (recipientId === session.id) {
      return {
        success: false,
        error: "Unable to transfer to yourself",
      };
    }

    // Perform the transfer inside a transaction to prevent race conditions
    await db.transaction(async (tx) => {
      // Check balance inside the transaction to prevent race conditions
      const balanceResult = await tx.execute(
        getBalanceQuery(parseInt(session.id), parseInt(serverId))
      );

      const currentBalance = Number(
        balanceResult.rows[0]?.current_balance ?? 0
      );

      // Check if user has sufficient funds
      if (amountNum > currentBalance) {
        // TODO: Replace with tx.rollback() once Drizzle ORM adds custom messages in rollbacks
        // See: https://github.com/drizzle-team/drizzle-orm/issues/1957
        throw new Error("Insufficient funds");
      }

      // Create DEBIT transaction for sender
      await tx.insert(transactions).values({
        serverId: parseInt(serverId),
        userId: parseInt(session.id),
        createdByUserId: parseInt(session.id),
        amount: amountNum.toString(),
        fee: "0.00",
        transactionType: TRANSACTION_TYPES.DEBIT,
        paymentType: PAYMENT_TYPES.TRANSFER,
        status: TRANSACTION_STATUSES.SUCCESS,
        note: `Transfer of ${amountNum} to ${recipientId} (${recipientUsername})`,
      });

      // Create CREDIT transaction for recipient
      await tx.insert(transactions).values({
        serverId: parseInt(serverId),
        userId: parseInt(recipientId),
        createdByUserId: parseInt(session.id),
        amount: amountNum.toString(),
        fee: "0.00",
        transactionType: TRANSACTION_TYPES.CREDIT,
        paymentType: PAYMENT_TYPES.TRANSFER,
        status: TRANSACTION_STATUSES.SUCCESS,
        note: `Transfer of ${amountNum.toFixed(2)} from ${session.id} (${session.username})`,
      });

      // Create balance snapshots for both users
      await createBalanceSnapshot(parseInt(session.id), parseInt(serverId), tx);
      await createBalanceSnapshot(
        parseInt(recipientId),
        parseInt(serverId),
        tx
      );

      // Create transfer record
      return tx.insert(transfers).values({
        senderUserId: parseInt(session.id),
        recipientUserId: parseInt(recipientId),
        amount: amountNum.toString(),
      });
    });

    return {
      success: true,
      message: "Your transfer has been submitted and was successful",
    };
  } catch (error) {
    // Handle insufficient funds error specifically
    if (error instanceof Error && error.message === "Insufficient funds") {
      return {
        success: false,
        error: "Insufficient funds",
      };
    }

    console.error("Failed to process transfer:", error);
    return {
      success: false,
      error: "An unexpected error occurred during transfer.",
    };
  }
}

/**
 * Approve a pending transaction
 *
 * @param transactionId - The ID of the transaction to approve
 * @return A promise that resolves to an object indicating success or failure
 * @throws Error if the approval process fails
 */
export async function approveTransaction(
  transactionId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to approve a transaction",
      };
    }

    if (!transactionId) {
      return {
        success: false,
        error: "Transaction ID is required",
      };
    }

    // Fetch the transaction to ensure it exists
    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .then((res) => res[0] || null);
    if (!transaction) {
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    // Only pending transactions can be approved
    if (transaction.status !== TRANSACTION_STATUSES.PENDING) {
      return {
        success: false,
        error: "Only pending transactions can be approved",
      };
    }

    await db.transaction(async (tx) => {
      // Update transaction status to SUCCESS
      await tx
        .update(transactions)
        .set({ status: TRANSACTION_STATUSES.SUCCESS })
        .where(eq(transactions.id, transactionId));

      // Create balance snapshot after approval
      await createBalanceSnapshot(transaction.userId, transaction.serverId, tx);
    });

    return {
      success: true,
      message: `Transaction #${transactionId} has been approved successfully`,
    };
  } catch (error) {
    console.error("Failed to approve transaction:", error);
    return {
      success: false,
      error: "An unexpected error occurred during transaction approval",
    };
  }
}

/**
 * Cancel a pending transaction
 *
 * @param transactionId - The ID of the transaction to cancel
 * @return A promise that resolves to an object indicating success or failure
 * @throws Error if the cancellation process fails
 */
export async function cancelTransaction(
  transactionId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to cancel a transaction",
      };
    }

    if (!transactionId) {
      return {
        success: false,
        error: "Transaction ID is required",
      };
    }

    // Fetch the transaction to ensure it exists
    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .then((res) => res[0] || null);
    if (!transaction) {
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    // Ensure the transaction belongs to the logged-in user
    if (transaction.userId !== Number(session.id)) {
      return {
        success: false,
        error: "Transaction not found", // Don't reveal existence of transaction to unauthorized users
      };
    }

    // Only pending transactions can be cancelled
    if (transaction.status !== TRANSACTION_STATUSES.PENDING) {
      return {
        success: false,
        error: "Only pending transactions can be cancelled",
      };
    }

    await db
      .update(transactions)
      .set({ status: TRANSACTION_STATUSES.CANCELLED })
      .where(eq(transactions.id, transactionId));

    return {
      success: true,
      message: `Transaction #${transactionId} has been cancelled successfully`,
    };
  } catch (error) {
    console.error("Failed to cancel transaction:", error);
    return {
      success: false,
      error: "An unexpected error occurred during transaction cancellation",
    };
  }
}

/**
 * Creates a snapshot of the user's balance for a specific server.
 *
 * @param userId - The ID of the user.
 * @param serverId - The ID of the server.
 * @param transactionContext - Optional database context for the transaction.
 * @throws Error if the database operation fails.
 */
async function createBalanceSnapshot(
  userId: number,
  serverId: number,
  transactionContext?: NeonDatabase
): Promise<void> {
  try {
    const dbInstance = transactionContext ?? db;

    // If we're inside a transaction, calculate balance from within that transaction context
    // to include uncommitted transactions. Otherwise, use the cached getBalance function.
    let balance: number;
    if (transactionContext) {
      const result = await dbInstance.execute(
        getBalanceQuery(userId, serverId)
      );
      balance = Number(result.rows[0]?.current_balance ?? 0);
    } else {
      balance = await getBalance(userId, serverId);
    }

    await dbInstance.insert(balanceSnapshots).values({
      userId,
      serverId,
      balance: balance.toString(),
    });
  } catch (error) {
    console.error(
      `Failed to create balance snapshot for user ${userId} on server ${serverId}:`,
      error
    );
    throw new Error("Failed to create balance snapshot");
  }
}
