import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storesRouter from "./stores";
import ordersRouter from "./orders";
import deliveryRouter from "./delivery";
import notificationsRouter from "./notifications";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storesRouter);
router.use(ordersRouter);
router.use(deliveryRouter);
router.use(notificationsRouter);
router.use(seedRouter);

export default router;
