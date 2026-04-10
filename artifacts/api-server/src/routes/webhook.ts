import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// CVE: SSRF (Server-Side Request Forgery) — the server fetches any URL provided by the user
// An attacker can use this to reach internal services: http://localhost:8080/admin, http://169.254.169.254/metadata, etc.
router.post("/webhook/notify", requireAuth, async (req, res): Promise<void> => {
  const { url, event, payload } = req.body;

  if (!url || !event) {
    res.status(400).json({ error: "url and event are required" });
    return;
  }

  try {
    logger.info({ url, event }, "Sending webhook notification (SSRF vulnerable)");

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-VulnBank-Event": event },
      body: JSON.stringify({ event, payload: payload || {}, timestamp: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000),
    });

    const body = await response.text().catch(() => "");

    res.json({
      success: true,
      statusCode: response.status,
      responseBody: body.slice(0, 2000),
      message: `Webhook delivered to ${url}`,
    });
  } catch (err: any) {
    res.json({
      success: false,
      statusCode: 0,
      responseBody: err.message,
      message: `Webhook delivery failed: ${err.message}`,
    });
  }
});

export default router;
