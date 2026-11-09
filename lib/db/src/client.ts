import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dbFile =
  process.env.VULNBANK_DB_FILE ?? path.resolve(process.cwd(), ".data", "vulnbank.db");

fs.mkdirSync(path.dirname(dbFile), { recursive: true });

export const db = new DatabaseSync(dbFile);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

export type Param = string | number | bigint | null | Uint8Array;

export function query<T = Record<string, unknown>>(sql: string, params: Param[] = []): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: Param[] = [],
): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

export function run(sql: string, params: Param[] = []): { changes: number; lastInsertRowid: number } {
  const result = db.prepare(sql).run(...params);
  return {
    changes: Number(result.changes),
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

export function quote(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  return `'${String(value)}'`;
}

export const databaseFile = dbFile;
