export const TRANSACTION_TYPES = Object.freeze({
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
} as const);

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
