"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/jwt";
import { uploadImageFileToS3 } from "@/lib/utils/s3";
import { TRANSACTION_STATUSES } from "@/lib/constants/transaction-statuses";
import { TRANSACTION_TYPES } from "@/lib/constants/transaction-types";
import { PAYMENT_TYPES } from "@/lib/constants/payment-types";

type TransactionFormState = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Deposit money into a user's account
 */
export async function depositAction(
  _state: TransactionFormState | null,
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
      note: `Deposit of $${amountNum.toFixed(2)}`,
      status: TRANSACTION_STATUSES.PENDING,
    });

    return {
      success: true,
      message: "Your deposit has been submitted and is pending approval",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

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
export async function withdrawAction(
  _state: TransactionFormState | null,
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
      note: `Withdrawal of $${amountNum.toFixed(2)}`,
      status: TRANSACTION_STATUSES.PENDING,
    });

    return {
      success: true,
      message: "Your withdrawal has been submitted and is being processed",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

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
export async function transferAction(
  _state: TransactionFormState | null,
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

    // Create DEBIT transaction for sender
    await db.insert(transactions).values({
      serverId: parseInt(serverId),
      userId: parseInt(session.id),
      createdByUserId: parseInt(session.id),
      amount: amountNum.toString(),
      fee: "0.00",
      transactionType: TRANSACTION_TYPES.DEBIT,
      paymentType: PAYMENT_TYPES.TRANSFER,
      status: TRANSACTION_STATUSES.PENDING,
      note: `Transfer of ${amountNum.toFixed(2)} to ${recipientId} (${recipientUsername})`,
    });

    // Create CREDIT transaction for recipient
    await db.insert(transactions).values({
      serverId: parseInt(serverId),
      userId: parseInt(recipientId),
      createdByUserId: parseInt(session.id),
      amount: amountNum.toString(),
      fee: "0.00",
      transactionType: TRANSACTION_TYPES.CREDIT,
      paymentType: PAYMENT_TYPES.TRANSFER,
      status: TRANSACTION_STATUSES.PENDING,
      note: `Transfer of ${amountNum.toFixed(2)} from ${session.id} (${session.username})`,
    });

    return {
      success: true,
      message: "Your transfer has been submitted and was successful",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Failed to process transfer:", error);
    return {
      success: false,
      error: "An unexpected error occurred during transfer.",
    };
  }
}
