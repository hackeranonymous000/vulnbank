import { Router, type IRouter } from "express";
import { queryOne, run } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/", requireAuth, async (req, res): Promise<void> => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  };
  res.json({ env: envVars });
});

router.get("/users", requireAuth, async (req, res): Promise<void> => {
  const users = queryOne<{ id: number; username: string }[]>(`SELECT id, username FROM users`)!;
  res.json({ users });
});

export default router;