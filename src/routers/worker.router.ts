import { Router } from "express";
import { getStationTasks, processTask, requestBypass } from "../controllers/worker.controller";
import { authMiddleware } from "../common/middlewares/auth.middleware"; 

export class WorkerRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authMiddleware);
    
    this.router.get("/station/tasks", getStationTasks);
    this.router.post("/station/tasks/:taskId/process", processTask);
    this.router.post("/station/tasks/:taskId/bypass", requestBypass);
  }

  getRouter(): Router {
    return this.router;
  }
}
