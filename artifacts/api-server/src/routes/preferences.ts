import { Router, type IRouter } from "express";
import { queryOne, run } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.put("/profile/preferences", requireAuth, async (req, res): Promise<void> => {
  const { preferences } = req.body ?? {};
  if (!preferences || typeof preferences !== "object") {
    res.status(400).json({ error: "preferences object is required" });
    return;
  }

  run(
    `INSERT INTO audit_logs (action, details, user_id, ip_address, created_at) VALUES (?, ?, ?, ?, ?)`,
    ["PREFERENCES_UPDATED", `preferences=${JSON.stringify(preferences)}`, (req as any).userId ?? null, req.ip ?? null, new Date().toISOString()],
  );

  res.json({ message: "Preferences updated", preferences });
});

router.get("/profile/preferences", requireAuth, async (req, res): Promise<void> => {
  res.json({ preferences: {} });
});

export default router;