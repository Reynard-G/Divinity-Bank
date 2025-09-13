export const PAYMENT_TYPES = Object.freeze({
  DEPOSIT: "DEPOSIT",
  WITHDRAW: "WITHDRAW",
  TRANSFER: "TRANSFER",
  INTEREST: "INTEREST",
} as const);

export type PaymentType = (typeof PAYMENT_TYPES)[keyof typeof PAYMENT_TYPES];
