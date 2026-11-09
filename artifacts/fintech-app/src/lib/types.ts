export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string | null;
  address?: string | null;
  ssn?: string | null;
  apiKey?: string | null;
  passwordHash?: string | null;
  createdAt?: string;
}

export interface Account {
  id: number;
  userId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  type: string;
  amount: number;
  description: string;
  category: string;
  balanceAfter: number;
  createdAt: string;
}

export interface DashboardSummary {
  totalBalance: number;
  totalAccounts: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  accountBreakdown: { type: string; balance: number; count: number }[];
  spendingByCategory?: { category: string; total: number }[];
  dailyFlow?: { day: string; net: number }[];
}

export interface CardRecord {
  id: number;
  userId: number;
  accountId: number;
  brand: string;
  number: string;
  cvv: string;
  expiry: string;
  status: string;
}

export interface AuditLog {
  id: number;
  action: string;
  details: string;
  userId: number | null;
  ipAddress: string | null;
  createdAt: string;
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
