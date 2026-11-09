import { Router, type IRouter } from "express";
import fs from "node:fs";
import path from "node:path";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/download", requireAuth, async (req, res): Promise<void> => {
  const file = String(req.query.file ?? "statement.json");
  const filePath = path.resolve(process.cwd(), "statements", file);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.type("text/plain").send(fs.readFileSync(filePath, "utf8"));
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

export default router;