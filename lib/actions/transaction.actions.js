'use server';

import { cookies } from 'next/headers';

import Decimal from 'decimal.js-light';
import { eq, sql } from 'drizzle-orm';

import PaymentType from '@/constants/PaymentType';
import TransactionStatus from '@/constants/TransactionStatus';
import TransactionType from '@/constants/TransactionType';
import { transactions, users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import formatCurrency from '@/utils/formatCurrency';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

/**
 * Deposits a specified amount into the user's account.
 *
 * @param {number} amount - The amount to be deposited.
 * @param {string} attachment - The attachment as a base64 string.
 * @returns {Promise<object|null>} - A Promise that resolves to the created transaction object, or null if an error occurs.
 */
export async function deposit(amount, attachment) {
  const cookie = cookies().get('authorization')?.value;

  const userId = (await getPayloadFromJWT(cookie))?.id;
  if (!userId) return null;

  // Check if attachment is a valid base64 string
  if (!attachment) return null;

  try {
    const depositFee = process.env.DEPOSIT_FEE;
    const fee = new Decimal(amount).mul(depositFee).toNumber();

    const transaction = (
      await db
        .insert(transactions)
        .values({
          userId: userId,
          createdByUserId: userId,
          amount: amount,
          fee: fee,
          transactionType: TransactionType.CREDIT,
          paymentType: PaymentType.DEPOSIT,
          //attachment: attachment,
          note: `Deposit of ${formatCurrency(amount)}`,
          status: TransactionStatus.PENDING,
        })
        .returning({ id: transactions.id })
    )[0];

    return transaction;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Withdraws a specified amount from the user's account.
 *
 * @param {number} amount - The amount to be withdrawn.
 * @returns {Promise<object|null>} - A promise that resolves to the transaction object if successful, or null if unsuccessful.
 */
export async function withdraw(amount) {
  const cookie = cookies().get('authorization')?.value;

  const userId = (await getPayloadFromJWT(cookie))?.id;
  if (!userId) return null;

  try {
    const withdrawFee = process.env.WITHDRAW_FEE;
    const fee = new Decimal(amount).mul(withdrawFee).toNumber();

    const transaction = (
      await db
        .insert(transactions)
        .values({
          userId: userId,
          createdByUserId: userId,
          amount: amount,
          fee: fee,
          transactionType: TransactionType.DEBIT,
          paymentType: PaymentType.WITHDRAW,
          note: `Withdraw of ${formatCurrency(amount)}`,
          status: TransactionStatus.PENDING,
        })
        .returning({ id: transactions.id })
    )[0];

    return transaction;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Transfers a specified amount to a recipient.
 *
 * @param {number} amount - The amount to be transferred.
 * @param {number} recipientUserId - The recipient's user ID of the transfer.
 * @returns {Promise<object|null>} - A promise that resolves to the transaction object if successful, or null if unsuccessful.
 */
export async function transfer(amount, recipientUserId) {
  const cookie = cookies().get('authorization')?.value;

  const initiatorUserId = (await getPayloadFromJWT(cookie))?.id;
  if (!initiatorUserId || initiatorUserId == recipientUserId) return null;

  try {
    // Check if initiatorUserId has enough balance
    const initiatorUserBalance = (
      await db
        .select({
          balance: sql`(
          SUM(CASE WHEN transaction_type = ${TransactionType.CREDIT} AND status = ${TransactionStatus.SUCCESS} THEN amount ELSE 0 END) -
          SUM(CASE WHEN transaction_type = ${TransactionType.DEBIT} AND status = ${TransactionStatus.SUCCESS} THEN amount ELSE 0 END) -
          SUM(fee)
        )`,
        })
        .from(transactions)
        .where(
          eq(transactions.userId, initiatorUserId),
          eq(transactions.status, TransactionStatus.SUCCESS),
        )
        .groupBy(transactions.userId, transactions.createdByUserId)
    )[0].balance;

    if (initiatorUserBalance < amount) return null;

    // Check if initiator exists
    const initiator = (
      await db
        .select({
          id: users.id,
          minecraftUsername: users.minecraftUsername,
        })
        .from(users)
        .where(eq(users.id, initiatorUserId))
    )[0];
    if (!initiator) return null;

    // Check if recipient exists
    const recipient = (
      await db
        .select({
          id: users.id,
          minecraftUsername: users.minecraftUsername,
        })
        .from(users)
        .where(eq(users.id, recipientUserId))
    )[0];
    if (!recipient) return null;

    /* ----  Sequentially waiting for both queries to finish in case of errors  ---- */
    // Create a transaction for the initiator
    await db
      .insert(transactions)
      .values({
        userId: initiatorUserId,
        createdByUserId: initiatorUserId,
        amount: amount,
        transactionType: TransactionType.DEBIT,
        paymentType: PaymentType.TRANSFER,
        note: `Transfer of ${formatCurrency(amount)} to ${recipient.minecraftUsername}`,
        status: TransactionStatus.SUCCESS,
      })
      .returning({ id: transactions.id });

    // Create a transaction for the recipient
    await db.insert(transactions).values({
      userId: recipientUserId,
      createdByUserId: initiatorUserId,
      amount: amount,
      transactionType: TransactionType.CREDIT,
      paymentType: PaymentType.TRANSFER,
      note: `Transfer of ${formatCurrency(amount)} from ${initiator.minecraftUsername}`,
      status: TransactionStatus.SUCCESS,
    });

    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}
