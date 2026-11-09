export interface HealthStatus {
  status: string;
}

export interface ErrorResponse {
  error: string;
}

export interface MessageResponse {
  message: string;
}

export interface LoginBody {
  username: string;
  password: string;
}

export interface RegisterBody {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRole = {
  user: "user",
  admin: "admin",
} as const;

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateUserBody {
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
}

export type AccountAccountType =
  (typeof AccountAccountType)[keyof typeof AccountAccountType];

export const AccountAccountType = {
  checking: "checking",
  savings: "savings",
  investment: "investment",
} as const;

export interface Account {
  id: number;
  userId: number;
  accountNumber: string;
  accountType: AccountAccountType;
  balance: number;
  currency: string;
  createdAt: string;
}

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionType = {
  credit: "credit",
  debit: "debit",
  transfer: "transfer",
} as const;

export interface Transaction {
  id: number;
  accountId: number;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  balanceAfter: number;
  createdAt: string;
}

export interface TransferBody {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
}

export interface TransferResult {
  success: boolean;
  transactionId?: number;
  message: string;
}

export type DashboardSummaryAccountBreakdownItem = {
  type: string;
  balance: number;
  count: number;
};

export interface DashboardSummary {
  totalBalance: number;
  totalAccounts: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  accountBreakdown: DashboardSummaryAccountBreakdownItem[];
}

export interface ResetPasswordBody {
  newPassword: string;
}

export interface AdminStats {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalVolume: number;
  activeUsers: number;
  flaggedTransactions: number;
  newUsersToday: number;
  volumeToday: number;
}

export interface AuditLog {
  id: number;
  action: string;
  details: string;
  userId?: number;
  ipAddress?: string;
  createdAt: string;
}

export interface CreateAuditLogBody {
  action: string;
  details: string;
}

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
  createdAt: string;
}

export type WebhookBodyPayload = { [key: string]: unknown };

export interface WebhookBody {
  url: string;
  event: string;
  payload?: WebhookBodyPayload;
}

export interface WebhookResult {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  message: string;
}

export type GetTransactionsParams = {
  accountId?: number;
  search?: string;
  limit?: number;
};

export type AdminGetTransactionsParams = {
  limit?: number;
};
