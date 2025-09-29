"use server";

import { eq } from "drizzle-orm";

import { getSession } from "@/lib/auth/jwt";
import { PAYMENT_TYPES } from "@/lib/constants/payment-types";
import { TRANSACTION_STATUSES } from "@/lib/constants/transaction-statuses";
import { TRANSACTION_TYPES } from "@/lib/constants/transaction-types";
import { db } from "@/lib/db";
import { transactions, transfers } from "@/lib/db/schema";
import { getBalanceQuery } from "@/lib/db/utils/balance-query";
import { uploadImageFileToS3 } from "@/lib/utils/s3";

type TransactionFormState = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Deposit money into a user's account
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
    const proofOfDeposit = formData.get("proofOfDeposit") as File;

    if (!amount || !proofOfDeposit || !serverId) {
      return {
        success: false,
        error: "Amount, proof of deposit, and server fields are required",
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
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      return {
        success: false,
        error: "Amount can only have up to 2 decimal places",
      };
    }

    // Upload proof of deposit to S3
    const uploadResult = await uploadImageFileToS3(
      proofOfDeposit,
      process.env.R2_BUCKET_NAME!,
      `transactions/server/${serverId}/deposits`
    );

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error,
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
      attachment: uploadResult.key,
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
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
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
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
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
 * Cancel a pending transaction
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
