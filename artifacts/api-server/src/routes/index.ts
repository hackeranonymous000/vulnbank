import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import accountsRouter from "./accounts";
import transactionsRouter from "./transactions";
import transfersRouter from "./transfers";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import webhookRouter from "./webhook";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(accountsRouter);
router.use(transactionsRouter);
router.use(transfersRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(webhookRouter);

export default router;
