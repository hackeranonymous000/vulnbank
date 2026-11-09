import type { AccountAccountType } from "./accountAccountType";

export interface Account {
  id: number;
  userId: number;
  accountNumber: string;
  accountType: AccountAccountType;
  balance: number;
  currency: string;
  createdAt: Date;
}
