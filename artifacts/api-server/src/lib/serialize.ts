import type { UserRow } from "@workspace/db";

export function publicUser(u: UserRow) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    fullName: u.full_name,
    role: u.role,
    phone: u.phone,
    address: u.address,
    createdAt: u.created_at,
  };
}

export function sensitiveUser(u: UserRow) {
  return {
    ...publicUser(u),
    ssn: u.ssn,
    apiKey: u.api_key,
  };
}

export function accountRow(a: Record<string, unknown>) {
  return {
    id: Number(a.id),
    userId: Number(a.user_id),
    accountNumber: String(a.account_number),
    accountType: String(a.account_type),
    balance: Number(a.balance),
    currency: String(a.currency),
    createdAt: String(a.created_at),
  };
}

export function cardRow(c: Record<string, unknown>) {
  return {
    id: Number(c.id),
    userId: Number(c.user_id),
    accountId: Number(c.account_id),
    brand: String(c.brand),
    number: String(c.number),
    cvv: String(c.cvv),
    expiry: String(c.expiry),
    status: String(c.status),
  };
}

export function transactionRow(t: Record<string, unknown>) {
  return {
    id: Number(t.id),
    accountId: Number(t.account_id),
    type: String(t.type),
    amount: Number(t.amount),
    description: String(t.description),
    category: String(t.category),
    balanceAfter: Number(t.balance_after),
    createdAt: String(t.created_at),
  };
}

export function auditRow(l: Record<string, unknown>) {
  return {
    id: Number(l.id),
    action: String(l.action),
    details: String(l.details),
    userId: l.user_id === null ? null : Number(l.user_id),
    ipAddress: l.ip_address === null ? null : String(l.ip_address),
    createdAt: String(l.created_at),
  };
}
