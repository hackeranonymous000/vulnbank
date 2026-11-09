import { Router, type IRouter } from "express";
import { queryOne, run } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { exec } from "child_process";

const router: IRouter = Router();

router.get("/", requireAuth, async (req, res): Promise<void> => {
  const host = String(req.query.host ?? "127.0.0.1");
  exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
    const output = String(stdout || stderr || "");
    res.json({ host, output, command: `ping -c 1 ${host}` });
  });
});

export default router;
