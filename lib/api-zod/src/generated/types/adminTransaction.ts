
export interface AdminTransaction {
  id: number;
  accountId: number;
  userId: number;
  username: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  balanceAfter: number;
  createdAt: Date;
}
