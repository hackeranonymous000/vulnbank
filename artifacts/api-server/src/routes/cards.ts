import { Router, type IRouter } from "express";
import { query, queryOne, run } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { cardRow } from "../lib/serialize";

const router: IRouter = Router();

const CARD_COLUMNS = "id, user_id, account_id, brand, number, cvv, expiry, status";

router.get("/", requireAuth, async (req, res): Promise<void> => {
  const rows = query(`SELECT ${CARD_COLUMNS} FROM cards WHERE user_id = ? ORDER BY id`, [
    req.userId!,
  ]);
  res.json(rows.map(cardRow));
});

router.get("/:cardId", requireAuth, async (req, res): Promise<void> => {
  const card = queryOne(`SELECT ${CARD_COLUMNS} FROM cards WHERE id = ?`, [
    Number(req.params.cardId),
  ]);
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.json(cardRow(card));
});

router.post("/:cardId/reveal", requireAuth, async (req, res): Promise<void> => {
  const card = queryOne(`SELECT ${CARD_COLUMNS} FROM cards WHERE id = ?`, [
    Number(req.params.cardId),
  ]);
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  const row = cardRow(card);
  res.json({ id: row.id, number: row.number, cvv: row.cvv, expiry: row.expiry });
});

router.put("/:cardId", requireAuth, async (req, res): Promise<void> => {
  const cardId = Number(req.params.cardId);
  const { status } = (req.body ?? {}) as { status?: unknown };
  if (status === undefined) {
    res.status(400).json({ error: "status is required" });
    return;
  }
  run("UPDATE cards SET status = ? WHERE id = ?", [String(status), cardId]);
  const card = queryOne(`SELECT ${CARD_COLUMNS} FROM cards WHERE id = ?`, [cardId]);
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.json(cardRow(card));
});

export default router;
