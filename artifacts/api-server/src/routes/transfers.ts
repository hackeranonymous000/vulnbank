import { Router, type IRouter } from "express";
import { db, accountsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/transfers", requireAuth, async (req, res): Promise<void> => {
  const { fromAccountId, toAccountId, amount, description } = req.body;
  if (!fromAccountId || !toAccountId || !amount) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const transferAmount = parseFloat(amount);
  if (isNaN(transferAmount) || transferAmount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  const [fromAccount] = await db.select().from(accountsTable).where(eq(accountsTable.id, fromAccountId));
  if (!fromAccount) {
    res.status(404).json({ error: "Source account not found" });
    return;
  }

  const fromBalance = parseFloat(fromAccount.balance as unknown as string);
  if (fromBalance < transferAmount) {
    res.status(400).json({ error: "Insufficient funds" });
    return;
  }

  const [toAccount] = await db.select().from(accountsTable).where(eq(accountsTable.id, toAccountId));
  if (!toAccount) {
    res.status(404).json({ error: "Destination account not found" });
    return;
  }

  const toBalance = parseFloat(toAccount.balance as unknown as string);
  const newFromBalance = fromBalance - transferAmount;
  const newToBalance = toBalance + transferAmount;

  await db.update(accountsTable).set({ balance: String(newFromBalance) }).where(eq(accountsTable.id, fromAccountId));
  await db.update(accountsTable).set({ balance: String(newToBalance) }).where(eq(accountsTable.id, toAccountId));

  const [txn] = await db.insert(transactionsTable).values({
    accountId: fromAccountId,
    type: "transfer",
    amount: String(transferAmount),
    description: description || `Transfer to account #${toAccountId}`,
    category: "transfer",
    balanceAfter: String(newFromBalance),
  }).returning();

  await db.insert(transactionsTable).values({
    accountId: toAccountId,
    type: "credit",
    amount: String(transferAmount),
    description: description || `Transfer from account #${fromAccountId}`,
    category: "transfer",
    balanceAfter: String(newToBalance),
  });

  res.json({ success: true, transactionId: txn.id, message: "Transfer successful" });
});

export default router;
