import { Router, type IRouter } from "express";
import { query } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { transactionRow } from "../lib/serialize";

const router: IRouter = Router();

const BASE_SELECT = `SELECT t.* FROM transactions t
  JOIN accounts a ON t.account_id = a.id
  WHERE a.user_id = ?`;

router.get("/", requireAuth, async (req, res): Promise<void> => {
  const search = String(req.query.search ?? "");
  const accountId = req.query.accountId ? Number(req.query.accountId) : null;
  const requestedLimit = Number(req.query.limit ?? 50);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 200)
    : 50;

  let sql = BASE_SELECT;
  const params: (string | number)[] = [req.userId!];

  if (accountId !== null) {
    sql += " AND t.account_id = ?";
    params.push(accountId);
  }

  if (search) {
    sql += ` AND (CAST(a.user_id AS TEXT) LIKE ? OR t.description LIKE ? OR t.category LIKE ?)`;
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  sql += ` ORDER BY t.created_at DESC LIMIT ${limit}`;
  res.json(query(sql, params).map(transactionRow));
});

router.get("/sort", requireAuth, async (req, res): Promise<void> => {
  const sort = String(req.query.sort ?? "t.id");
  const sql = `SELECT t.* FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    ORDER BY ${sort} LIMIT 20`;
  res.json(query(sql).map(transactionRow));
});

export default router;
