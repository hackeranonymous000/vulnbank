import { Router, type IRouter } from "express";
import { db, accountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/accounts", requireAuth, async (req, res): Promise<void> => {
  const accounts = await db.select().from(accountsTable).where(eq(accountsTable.userId, req.userId!));
  res.json(accounts.map(a => ({
    ...a,
    balance: parseFloat(a.balance as unknown as string),
  })));
});

router.get("/accounts/:accountId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.accountId) ? req.params.accountId[0] : req.params.accountId;
  const accountId = parseInt(raw, 10);

  const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, accountId));
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  res.json({
    ...account,
    balance: parseFloat(account.balance as unknown as string),
  });
});

export default router;
