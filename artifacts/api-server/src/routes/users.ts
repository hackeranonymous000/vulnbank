import { Router, type IRouter } from "express";
import { query, queryOne, run, type UserRow } from "@workspace/db";
import { publicUser, sensitiveUser } from "../lib/serialize";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const user = queryOne<UserRow>("SELECT * FROM users WHERE id = ?", [req.userId!]);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(sensitiveUser(user));
});

router.get("/", requireAuth, async (_req, res): Promise<void> => {
  const rows = query<UserRow>("SELECT * FROM users ORDER BY id");
  res.json({ users: rows.map(publicUser) });
});

router.get("/:id", requireAuth, async (req, res): Promise<void> => {
  const user = queryOne<UserRow>("SELECT * FROM users WHERE id = ?", [Number(req.params.id)]);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(sensitiveUser(user));
});

router.put("/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = Number(req.params.id);
  const body = (req.body ?? {}) as Record<string, unknown>;
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (body.username !== undefined) {
    updates.push("username = ?");
    values.push(String(body.username));
  }
  if (body.email !== undefined) {
    updates.push("email = ?");
    values.push(String(body.email));
  }
  if (body.fullName !== undefined) {
    updates.push("full_name = ?");
    values.push(String(body.fullName));
  }
  if (body.role !== undefined) {
    updates.push("role = ?");
    values.push(String(body.role));
  }
  if (body.phone !== undefined) {
    updates.push("phone = ?");
    values.push(String(body.phone));
  }
  if (body.address !== undefined) {
    updates.push("address = ?");
    values.push(String(body.address));
  }

  if (updates.length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  values.push(userId);
  run(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

  const user = queryOne<UserRow>("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(publicUser(user));
});

export default router;
