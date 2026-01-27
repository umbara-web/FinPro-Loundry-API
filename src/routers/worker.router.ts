import { Router } from "express";
import { getStationTasks, processTask, requestBypass } from "../controllers/worker.controller";
import { authMiddleware } from "../common/middlewares/auth.middleware"; 

const router = Router();

router.use(authMiddleware);

router.get("/station/tasks", getStationTasks);
router.post("/station/tasks/:taskId/process", processTask);
router.post("/station/tasks/:taskId/bypass", requestBypass);

export const WorkerRoutes = router;
