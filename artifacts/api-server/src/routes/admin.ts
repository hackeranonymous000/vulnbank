import { Router, type IRouter } from "express";
import { db, usersTable, auditLogsTable } from "@workspace/db";
import { pool } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { hashPassword } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/users", requireAuth, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    createdAt: u.createdAt,
  })));
});

router.post("/admin/users/:userId/reset-password", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const { newPassword } = req.body;

  if (!newPassword) {
    res.status(400).json({ error: "New password is required" });
    return;
  }

  const passwordHash = hashPassword(newPassword);
  const [updated] = await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, userId)).returning();
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await db.insert(auditLogsTable).values({
    action: "PASSWORD_RESET",
    details: `Password forcibly reset for user ${updated.username} (id: ${userId})`,
    userId: req.userId,
    ipAddress: req.ip,
  });

  res.json({ message: `Password reset for user ${updated.username}` });
});

router.get("/admin/stats", requireAuth, async (_req, res): Promise<void> => {
  const usersResult = await pool.query("SELECT COUNT(*) as total FROM users");
  const accountsResult = await pool.query("SELECT COUNT(*) as total FROM accounts");
  const txnResult = await pool.query("SELECT COUNT(*) as total, COALESCE(SUM(amount::numeric), 0) as volume FROM transactions");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const newTodayResult = await pool.query("SELECT COUNT(*) as total FROM users WHERE created_at >= $1", [today]);
  const volumeTodayResult = await pool.query("SELECT COALESCE(SUM(amount::numeric), 0) as volume FROM transactions WHERE created_at >= $1", [today]);
  const flaggedResult = await pool.query("SELECT COUNT(*) as total FROM transactions WHERE amount::numeric > 5000");

  res.json({
    totalUsers: parseInt(usersResult.rows[0].total),
    totalAccounts: parseInt(accountsResult.rows[0].total),
    totalTransactions: parseInt(txnResult.rows[0].total),
    totalVolume: parseFloat(txnResult.rows[0].volume),
    activeUsers: parseInt(usersResult.rows[0].total),
    flaggedTransactions: parseInt(flaggedResult.rows[0].total),
    newUsersToday: parseInt(newTodayResult.rows[0].total),
    volumeToday: parseFloat(volumeTodayResult.rows[0].volume),
  });
});

// CVE: Stored XSS — details field stored and returned as-is, rendered as HTML in frontend
router.get("/admin/audit-logs", requireAuth, async (_req, res): Promise<void> => {
  const logs = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(50);
  res.json(logs);
});

router.post("/admin/audit-logs", requireAuth, async (req, res): Promise<void> => {
  const { action, details } = req.body;
  if (!action || !details) {
    res.status(400).json({ error: "Action and details are required" });
    return;
  }

  const [log] = await db.insert(auditLogsTable).values({
    action,
    details,
    userId: req.userId,
    ipAddress: req.ip,
  }).returning();

  res.status(201).json(log);
});

router.get("/admin/transactions", requireAuth, async (req, res): Promise<void> => {
  const limit = parseInt((req.query.limit as string) || "50", 10);
  const result = await pool.query(
    `SELECT t.*, a.user_id, u.username
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     JOIN users u ON a.user_id = u.id
     ORDER BY t.created_at DESC
     LIMIT $1`,
    [limit]
  );

  res.json(result.rows.map((t: Record<string, unknown>) => ({
    id: t.id,
    accountId: t.account_id,
    userId: t.user_id,
    username: t.username,
    type: t.type,
    amount: parseFloat(t.amount as string),
    description: t.description,
    category: t.category,
    balanceAfter: parseFloat(t.balance_after as string),
    createdAt: t.created_at,
  })));
});

export default router;
