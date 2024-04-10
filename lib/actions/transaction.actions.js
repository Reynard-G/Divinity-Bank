'use server';

import { cookies } from 'next/headers';

import Decimal from 'decimal.js-light';

import PaymentType from '@/constants/PaymentType';
import TransactionStatus from '@/constants/TransactionStatus';
import TransactionType from '@/constants/TransactionType';
import prisma from '@/lib/db';
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

    const transaction = await prisma.transactions.create({
      data: {
        user_id: userId,
        created_by_user_id: userId,
        amount: amount,
        fee: fee,
        transaction_type: TransactionType.CREDIT,
        payment_type: PaymentType.DEPOSIT,
        attachment: attachment,
        note: `Deposit of ${formatCurrency(amount)}`,
        status: TransactionStatus.PENDING,
      },
    });

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

    const transaction = await prisma.transactions.create({
      data: {
        user_id: userId,
        created_by_user_id: userId,
        amount: amount,
        fee: fee,
        transaction_type: TransactionType.DEBIT,
        payment_type: PaymentType.WITHDRAW,
        note: `Withdraw of ${formatCurrency(amount)}`,
        status: TransactionStatus.PENDING,
      },
    });

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
 * @param {string} recipient - The recipient of the transfer.
 * @returns {Promise<object|null>} - A promise that resolves to the transaction object if successful, or null if unsuccessful.
 */
export async function transfer(amount, recipient) {
  const cookie = cookies().get('authorization')?.value;

  const initiatorUserId = (await getPayloadFromJWT(cookie))?.id;
  if (!initiatorUserId) return null;

  try {
    await prisma.transactions.create({
      data: {
        user_id: initiatorUserId,
        created_by_user_id: initiatorUserId,
        amount: amount,
        transaction_type: TransactionType.DEBIT,
        payment_type: PaymentType.TRANSFER,
        note: `Transfer of ${formatCurrency(amount)} to ${recipient}`,
        status: TransactionStatus.SUCCESS,
      },
    });

    await prisma.transactions.create({
      data: {
        user_id: recipient,
        created_by_user_id: initiatorUserId,
        amount: amount,
        transaction_type: TransactionType.CREDIT,
        payment_type: PaymentType.TRANSFER,
        note: `Transfer of ${formatCurrency(amount)} from ${initiatorUserId}`,
        status: TransactionStatus.SUCCESS,
      }
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
