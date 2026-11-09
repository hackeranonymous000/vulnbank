
export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionType = {
  credit: "credit",
  debit: "debit",
  transfer: "transfer",
} as const;
