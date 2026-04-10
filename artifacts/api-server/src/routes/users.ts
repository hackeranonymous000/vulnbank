import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  });
});

router.get("/users/:userId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  });
});

// CVE: Mass Assignment — allows setting role, passwordHash, and any other field
// No filtering of dangerous fields from req.body
router.put("/users/:userId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);

  const { email, fullName, phone, address, role } = req.body;
  const updateData: Record<string, string> = {};
  if (email) updateData.email = email;
  if (fullName) updateData.fullName = fullName;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  // CVE: Mass Assignment — role should never be user-settable, but it is here
  if (role !== undefined) updateData.role = role;

  const [updated] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: updated.id,
    username: updated.username,
    email: updated.email,
    fullName: updated.fullName,
    role: updated.role,
    phone: updated.phone,
    address: updated.address,
    createdAt: updated.createdAt,
  });
});

export default router;
