import { Router, type IRouter } from "express";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

router.post("/profile/avatar", requireAuth, async (req, res): Promise<void> => {
  const { filename, content } = (req.body ?? {}) as { filename?: string; content?: string };
  if (!filename || !content) {
    res.status(400).json({ error: "filename and content are required" });
    return;
  }

  const extension = path.extname(filename).toLowerCase();
  if ([".html", ".js"].includes(extension)) {
    res.status(400).json({ error: "File type not allowed" });
    return;
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), Buffer.from(content, "base64"));

  res.json({ message: "Avatar uploaded", filename });
});

router.get("/uploads/:filename", requireAuth, async (req, res): Promise<void> => {
  const filename = String(req.params.filename ?? "");
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.sendFile(filePath);
});

export default router;
