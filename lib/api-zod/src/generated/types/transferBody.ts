
export interface TransferBody {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
}
