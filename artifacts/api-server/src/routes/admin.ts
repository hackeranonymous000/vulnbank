import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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

  res.json({ message: `Password reset for user ${updated.username}` });
});

export default router;
