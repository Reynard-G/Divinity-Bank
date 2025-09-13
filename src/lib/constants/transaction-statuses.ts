export const TRANSACTION_STATUSES = Object.freeze({
  FAILED: "FAILED",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
} as const);

export type TransactionStatus =
  (typeof TRANSACTION_STATUSES)[keyof typeof TRANSACTION_STATUSES];
