export const TRANSACTION_STATUSES = Object.freeze({
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
} as const);

export type TransactionStatus =
  (typeof TRANSACTION_STATUSES)[keyof typeof TRANSACTION_STATUSES];
