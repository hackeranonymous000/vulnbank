import { Router, type IRouter } from "express";
import { query, queryOne, run } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { accountRow } from "../lib/serialize";

const router: IRouter = Router();

const ACCOUNT_COLUMNS =
  "id, user_id, account_number, account_type, balance, currency, created_at";

router.get("/", requireAuth, async (req, res): Promise<void> => {
  const rows = query(
    `SELECT ${ACCOUNT_COLUMNS} FROM accounts WHERE user_id = ? ORDER BY id`,
    [req.userId!],
  );
  res.json(rows.map(accountRow));
});

router.get("/:id", requireAuth, async (req, res): Promise<void> => {
  const account = queryOne(
    `SELECT ${ACCOUNT_COLUMNS} FROM accounts WHERE id = ?`,
    [Number(req.params.id)],
  );
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json(accountRow(account));
});

router.put("/:id", requireAuth, async (req, res): Promise<void> => {
  const accountId = Number(req.params.id);
  const { balance } = (req.body ?? {}) as { balance?: unknown };
  if (balance === undefined) {
    res.status(400).json({ error: "balance is required" });
    return;
  }
  run("UPDATE accounts SET balance = ? WHERE id = ?", [Number(balance), accountId]);
  const account = queryOne(`SELECT ${ACCOUNT_COLUMNS} FROM accounts WHERE id = ?`, [accountId]);
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json(accountRow(account));
});

export default router;
