import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({
    status: "ok",
    app: "VulnBank",
    developedBy: "Alexis",
    time: new Date().toISOString(),
  });
});

export default router;
