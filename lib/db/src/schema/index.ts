
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: string;
  phone: string | null;
  address: string | null;
  ssn: string | null;
  apiKey: string | null;
  createdAt: string;
}

export type PublicUser = Omit<User, "passwordHash" | "apiKey"> & {
  apiKey?: string | null;
};

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

export interface AuditLog {
  id: number;
  action: string;
  details: string;
  userId: number | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface Card {
  id: number;
  userId: number;
  accountId: number;
  brand: string;
  number: string;
  cvv: string;
  expiry: string;
  status: string;
}

export interface Payee {
  id: number;
  userId: number;
  name: string;
  bank: string;
  accountNumber: string;
  nickname: string | null;
}

export interface PasswordReset {
  id: number;
  userId: number;
  token: string;
  createdAt: string;
  used: number;
}


export interface UserRow {
  id: number;
  username: string;
  email: string;
  full_name: string;
  password_hash: string;
  role: string;
  phone: string | null;
  address: string | null;
  ssn: string | null;
  api_key: string | null;
  created_at: string;
}
