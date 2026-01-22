import { Router } from "express";
import { clockIn, clockOut, getHistory } from "../controllers/attendance.controller";
import { authMiddleware } from "../middlewares/auth.middleware"; 

export class AttendanceRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authMiddleware); 
    
    this.router.post("/clock-in", clockIn);
    this.router.post("/clock-out", clockOut);
    this.router.get("/history", getHistory);
  }

  getRouter(): Router {
    return this.router;
  }
}
