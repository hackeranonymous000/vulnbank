import { Router, type IRouter } from "express";
import { query } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { transactionRow } from "../lib/serialize";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const accounts = query("SELECT * FROM accounts WHERE user_id = ? ORDER BY id", [req.userId!]);

  let totalBalance = 0;
  const typeMap: Record<string, { balance: number; count: number }> = {};
  for (const acc of accounts) {
    const bal = Number(acc.balance);
    totalBalance += bal;
    const type = String(acc.account_type);
    typeMap[type] ??= { balance: 0, count: 0 };
    typeMap[type]!.balance += bal;
    typeMap[type]!.count += 1;
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthly = query(
    `SELECT t.type AS type, SUM(t.amount) AS total
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = ? AND t.created_at >= ?
     GROUP BY t.type`,
    [req.userId!, monthStart.toISOString()],
  );

  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  for (const row of monthly) {
    const total = Number(row.total);
    if (row.type === "credit") monthlyIncome += total;
    else monthlyExpenses += total;
  }

  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  const spendRows = query(
    `SELECT t.category AS category, SUM(t.amount) AS total
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = ? AND t.type != 'credit' AND t.created_at >= ?
     GROUP BY t.category
     ORDER BY total DESC`,
    [req.userId!, monthStart.toISOString()],
  );

  const flowRows = query(
    `SELECT substr(t.created_at, 1, 10) AS day,
            SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END) AS net
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = ? AND t.created_at >= ?
     GROUP BY day
     ORDER BY day`,
    [req.userId!, new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()],
  );

  res.json({
    totalBalance: Math.round(totalBalance * 100) / 100,
    totalAccounts: accounts.length,
    monthlyIncome: Math.round(monthlyIncome * 100) / 100,
    monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
    savingsRate: Math.round(savingsRate * 100) / 100,
    accountBreakdown: Object.entries(typeMap).map(([type, data]) => ({
      type,
      balance: Math.round(data.balance * 100) / 100,
      count: data.count,
    })),
    spendingByCategory: spendRows.map((r) => ({
      category: String(r.category),
      total: Math.round(Number(r.total) * 100) / 100,
    })),
    dailyFlow: flowRows.map((r) => ({ day: String(r.day), net: Math.round(Number(r.net) * 100) / 100 })),
  });
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res): Promise<void> => {
  const rows = query(
    `SELECT t.* FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = ?
     ORDER BY t.created_at DESC
     LIMIT 8`,
    [req.userId!],
  );
  res.json(rows.map(transactionRow));
});

export default router;
