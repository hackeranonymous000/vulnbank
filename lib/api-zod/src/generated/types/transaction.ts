import type { TransactionType } from "./transactionType";

export interface Transaction {
  id: number;
  accountId: number;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  balanceAfter: number;
  createdAt: Date;
}
