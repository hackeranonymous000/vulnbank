import { Router, type IRouter } from "express";
import { queryOne } from "@workspace/db";

const router: IRouter = Router();

router.get("/meta", (_req, res) => {
  const counts = queryOne<Record<string, number>>(
    `SELECT
       (SELECT COUNT(*) FROM users) AS users,
       (SELECT COUNT(*) FROM accounts) AS accounts,
       (SELECT COUNT(*) FROM transactions) AS transactions`,
  );

  res.json({
    name: "VulnBank", tagline: "Digital banking for everyday life",
    developedBy: "Alexis",
    version: "2.0.0",
    environment: "testbed",
    features: {
      accounts: true,
      transfers: true,
      cards: true,
      statements: true,
      webhooks: true,
      admin: true,
      debugRoutes: true,
    },
    records: {
      users: Number(counts?.users ?? 0),
      accounts: Number(counts?.accounts ?? 0),
      transactions: Number(counts?.transactions ?? 0),
    },
  });
});

export default router;
