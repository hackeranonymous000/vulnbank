import crypto from "node:crypto";
import { db, run } from "./client";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function daysAgo(days: number, hour = 9, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const USERS = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.test",
    fullName: "System Administrator",
    password: "admin123",
    role: "admin",
    phone: null,
    address: null,
    ssn: null,
    apiKey: "vbk_live_admin_changed_d34db33fb4c2e7f9a0b1deadbeef0042",
  },
];

interface SeedAccount {
  id: number;
  userId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}

const ACCOUNTS: SeedAccount[] = [
  { id: 1, userId: 1, accountNumber: "VB-0001-4821", accountType: "checking", balance: 250000.0, currency: "USD" },
];

const CARDS = [
  { id: 1, userId: 1, accountId: 1, brand: "Visa Signature", number: "4024007136512380", cvv: "884", expiry: "09/29", status: "active" },
];

const AUDIT_LOGS = [
  { action: "SYSTEM_INIT", details: "System initialised", userId: null, ip: "127.0.0.1", days: 0 },
];

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      phone TEXT,
      address TEXT,
      ssn TEXT,
      api_key TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      account_number TEXT NOT NULL UNIQUE,
      account_type TEXT NOT NULL DEFAULT 'checking',
      balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other',
      balance_after REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      user_id INTEGER,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      brand TEXT NOT NULL,
      number TEXT NOT NULL,
      cvv TEXT NOT NULL,
      expiry TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token TEXT NOT NULL,
      created_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );
  `);
}

function signed(type: string, amount: number): number {
  return type === "credit" ? amount : -amount;
}

export function seed(): void {
  createTables();

  const { total } = db.prepare("SELECT COUNT(*) AS total FROM users").get() as { total: number };
  if (total > 0) return;

  const insertUser = db.prepare(
    `INSERT INTO users (id, username, email, full_name, password_hash, role, phone, address, ssn, api_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const u of USERS) {
    insertUser.run(
      u.id,
      u.username,
      u.email,
      u.fullName,
      hashPassword(u.password),
      u.role,
      u.phone,
      u.address,
      u.ssn,
      u.apiKey,
      daysAgo(180 + u.id, 10, 0),
    );
  }

  const insertAccount = db.prepare(
    `INSERT INTO accounts (id, user_id, account_number, account_type, balance, currency, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const a of ACCOUNTS) {
    insertAccount.run(a.id, a.userId, a.accountNumber, a.accountType, a.balance, a.currency, daysAgo(170, 10, 0));
  }

  const insertCard = db.prepare(
    `INSERT INTO cards (id, user_id, account_id, brand, number, cvv, expiry, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const c of CARDS) {
    insertCard.run(c.id, c.userId, c.accountId, c.brand, c.number, c.cvv, c.expiry, c.status);
  }

  const insertLog = db.prepare(
    `INSERT INTO audit_logs (action, details, user_id, ip_address, created_at) VALUES (?, ?, ?, ?, ?)`,
  );
  for (const l of AUDIT_LOGS) {
    insertLog.run(l.action, l.details, l.userId, l.ip, daysAgo(l.days, 14, 0));
  }

  insertLog.run(
    "SYSTEM_INIT",
    "System initialised",
    null,
    "127.0.0.1",
    new Date().toISOString(),
  );

  run("SELECT 1");
}
