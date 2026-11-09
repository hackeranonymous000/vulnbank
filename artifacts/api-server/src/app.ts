import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import fs from "node:fs";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";
import { seed } from "@workspace/db";

seed();

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: "http://localhost:8822", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/api/uploads", express.static(uploadDir));

app.use("/api", router);

const clientDist = path.resolve(process.cwd(), "..", "fintech-app", "dist", "public");
const hasClientBuild = () => fs.existsSync(path.join(clientDist, "index.html"));

app.use((req, res, next) => {
  if (!hasClientBuild()) return next();
  express.static(clientDist)(req, res, next);
});

app.get(/^(?!\/api).*/, (_req, res, next) => {
  if (!hasClientBuild()) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use((err: Error & { sql?: string }, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: err.message });
});

export default app;