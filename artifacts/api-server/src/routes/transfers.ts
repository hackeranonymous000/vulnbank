import { Router, type IRouter } from "express";
import { queryOne, run } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { accountRow } from "../lib/serialize";

const router: IRouter = Router();

router.post("/", requireAuth, async (req, res): Promise<void> => {
  const { fromAccountId, toAccountId, description } = (req.body ?? {}) as {
    fromAccountId?: unknown;
    toAccountId?: unknown;
    amount?: unknown;
    description?: unknown;
  };
  const rawAmount = (req.body ?? {}).amount;

  if (fromAccountId == null || toAccountId == null || rawAmount == null) {
    res.status(400).json({ error: "fromAccountId, toAccountId and amount are required" });
    return;
  }

  const fromId = Number(fromAccountId);
  const toId = Number(toAccountId);
  const amount = Number.parseFloat(String(rawAmount));

  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: "amount must be a positive number" });
    return;
  }
  if (fromId === toId) {
    res.status(400).json({ error: "Choose two different accounts" });
    return;
  }

  const fromAccount = queryOne(`SELECT * FROM accounts WHERE id = ?`, [fromId]);
  const toAccount = queryOne(`SELECT * FROM accounts WHERE id = ?`, [toId]);
  if (!fromAccount || !toAccount) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  const fromBalanceBefore = Number(fromAccount.balance);
  if (fromBalanceBefore < amount) {
    res.status(400).json({ error: "Insufficient funds" });
    return;
  }

  const fromBalance = Math.round((fromBalanceBefore - amount) * 100) / 100;
  const toBalance = Math.round((Number(toAccount.balance) + amount) * 100) / 100;
  const label = String(description ?? "").trim() || "Internal transfer";
  const now = new Date().toISOString();

  run("UPDATE accounts SET balance = ? WHERE id = ?", [fromBalance, fromId]);
  run("UPDATE accounts SET balance = ? WHERE id = ?", [toBalance, toId]);

  run(
    `INSERT INTO transactions (account_id, type, amount, description, category, balance_after, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fromId, "debit", amount, label, "transfer", fromBalance, now],
  );
  run(
    `INSERT INTO transactions (account_id, type, amount, description, category, balance_after, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [toId, "credit", amount, label, "transfer", toBalance, now],
  );

  run(
    `INSERT INTO audit_logs (action, details, user_id, ip_address, created_at) VALUES (?, ?, ?, ?, ?)`,
    ["TRANSFER_CREATED", `${fromId} → ${toId} $${amount}`, req.userId ?? null, req.ip ?? null, now],
  );

  res.json({
    fromAccount: accountRow(fromAccount),
    toAccount: accountRow(toAccount),
    amount,
    fromBalance,
    toBalance,
  });
});

export default router;
