import { Router, type IRouter } from "express";
import { query, queryOne, run, type UserRow } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { publicUser, transactionRow } from "../lib/serialize";

const router: IRouter = Router();

router.get("/users", requireAuth, async (_req, res): Promise<void> => {
  const users = query<UserRow>("SELECT * FROM users ORDER BY id");
  res.json({ users: users.map(publicUser) });
});

router.get("/transactions", requireAuth, async (_req, res): Promise<void> => {
  const rows = query(
    `SELECT t.*, a.user_id FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     ORDER BY t.created_at DESC
     LIMIT 200`,
  );
  res.json({
    transactions: rows.map((row) => ({ ...transactionRow(row), userId: Number(row.user_id) })),
  });
});

router.post("/transactions", requireAuth, async (req, res): Promise<void> => {
  const { accountId, type, amount, description } = (req.body ?? {}) as Record<string, unknown>;
  if (accountId == null || type == null || amount == null) {
    res.status(400).json({ error: "accountId, type and amount are required" });
    return;
  }

  const account = queryOne<{ balance: number }>("SELECT balance FROM accounts WHERE id = ?", [
    Number(accountId),
  ]);
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  const value = Number(amount);
  const balanceAfter =
    String(type) === "credit" ? Number(account.balance) + value : Number(account.balance) - value;

  const { lastInsertRowid } = run(
    `INSERT INTO transactions (account_id, type, amount, description, category, balance_after, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(accountId),
      String(type),
      value,
      String(description ?? "manual entry"),
      "adjustment",
      balanceAfter,
      new Date().toISOString(),
    ],
  );

  res.json({ id: lastInsertRowid });
});

export default router;
