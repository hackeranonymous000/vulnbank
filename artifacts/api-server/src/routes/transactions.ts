import { Router, type IRouter } from "express";
import { pool, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/transactions", requireAuth, async (req, res): Promise<void> => {
  const { accountId, search, limit } = req.query;
  const lim = parseInt((limit as string) || "20", 10);

  if (search) {
    const rawQuery = `
      SELECT t.* FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = ${req.userId}
      AND (t.description LIKE '%${search}%' OR t.category LIKE '%${search}%')
      ORDER BY t.created_at DESC
      LIMIT ${lim}
    `;
    const result = await pool.query(rawQuery);
    res.json(result.rows.map((t: Record<string, unknown>) => ({
      id: t.id,
      accountId: t.account_id,
      type: t.type,
      amount: parseFloat(t.amount as string),
      description: t.description,
      category: t.category,
      balanceAfter: parseFloat(t.balance_after as string),
      createdAt: t.created_at,
    })));
    return;
  }

  if (accountId) {
    const accId = parseInt(accountId as string, 10);
    const txns = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.accountId, accId))
      .limit(lim);
    res.json(txns.map(t => ({
      ...t,
      amount: parseFloat(t.amount as unknown as string),
      balanceAfter: parseFloat(t.balanceAfter as unknown as string),
    })));
    return;
  }

  const rawQuery = `
    SELECT t.* FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE a.user_id = ${req.userId}
    ORDER BY t.created_at DESC
    LIMIT ${lim}
  `;
  const result = await pool.query(rawQuery);
  res.json(result.rows.map((t: Record<string, unknown>) => ({
    id: t.id,
    accountId: t.account_id,
    type: t.type,
    amount: parseFloat(t.amount as string),
    description: t.description,
    category: t.category,
    balanceAfter: parseFloat(t.balance_after as string),
    createdAt: t.created_at,
  })));
});

router.get("/transactions/:transactionId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : req.params.transactionId;
  const txId = parseInt(raw, 10);

  const [txn] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, txId));
  if (!txn) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.json({
    ...txn,
    amount: parseFloat(txn.amount as unknown as string),
    balanceAfter: parseFloat(txn.balanceAfter as unknown as string),
  });
});

export default router;
