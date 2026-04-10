import { Router, type IRouter } from "express";
import { pool, accountsTable, transactionsTable } from "@workspace/db";
import { db } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const accounts = await db.select().from(accountsTable).where(eq(accountsTable.userId, req.userId!));

  let totalBalance = 0;
  const accountBreakdown: Array<{ type: string; balance: number; count: number }> = [];
  const typeMap: Record<string, { balance: number; count: number }> = {};

  for (const acc of accounts) {
    const bal = parseFloat(acc.balance as unknown as string);
    totalBalance += bal;
    if (!typeMap[acc.accountType]) typeMap[acc.accountType] = { balance: 0, count: 0 };
    typeMap[acc.accountType].balance += bal;
    typeMap[acc.accountType].count += 1;
  }

  for (const [type, data] of Object.entries(typeMap)) {
    accountBreakdown.push({ type, ...data });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyResult = await pool.query(
    `SELECT t.type, SUM(t.amount::numeric) as total
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = $1 AND t.created_at >= $2
     GROUP BY t.type`,
    [req.userId, startOfMonth]
  );

  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  for (const row of monthlyResult.rows) {
    if (row.type === "credit") monthlyIncome += parseFloat(row.total);
    else if (row.type === "debit") monthlyExpenses += parseFloat(row.total);
  }

  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  res.json({
    totalBalance,
    totalAccounts: accounts.length,
    monthlyIncome,
    monthlyExpenses,
    savingsRate: Math.round(savingsRate * 100) / 100,
    accountBreakdown,
  });
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res): Promise<void> => {
  const result = await pool.query(
    `SELECT t.* FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = $1
     ORDER BY t.created_at DESC
     LIMIT 10`,
    [req.userId]
  );

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

export default router;
