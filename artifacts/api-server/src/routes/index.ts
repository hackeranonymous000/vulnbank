import { Router, type IRouter } from "express";
import healthRouter from "./health";
import metaRouter from "./meta";
import authRouter from "./auth";
import usersRouter from "./users";
import accountsRouter from "./accounts";
import transactionsRouter from "./transactions";
import transfersRouter from "./transfers";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import webhookRouter from "./webhook";
import statementsRouter from "./statements";
import diagnosticsRouter from "./diagnostics";
import uploadsRouter from "./uploads";
import debugRouter from "./debug";
import cardsRouter from "./cards";
import preferencesRouter from "./preferences";

const router: IRouter = Router();

router.use(healthRouter);
router.use(metaRouter);
router.use(authRouter);
router.use("/users", usersRouter);
router.use("/accounts", accountsRouter);
router.use("/transactions", transactionsRouter);
router.use("/transfers", transfersRouter);
router.use(dashboardRouter);
router.use("/cards", cardsRouter);
router.use(preferencesRouter);
router.use("/admin", adminRouter);
router.use("/webhook", webhookRouter);
router.use("/statements", statementsRouter);
router.use("/support", diagnosticsRouter);
router.use(uploadsRouter);
router.use("/debug", debugRouter);

export default router;
