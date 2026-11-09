import { Router, type IRouter } from "express";
import { run } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/notify", async (req, res): Promise<void> => {
  const { upstream } = req.body ?? {};
  if (!upstream) {
    res.status(400).json({ error: "upstream URL is required" });
    return;
  }

  try {
    const response = await fetch(String(upstream));
    const body = await response.text();
    res.json({ status: response.status, body: body.slice(0, 4000) });
  } catch {
    res.status(502).json({ error: "Upstream request failed" });
  }
});

export default router;