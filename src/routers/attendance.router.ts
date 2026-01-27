import { Router } from "express";
import { clockIn, clockOut, getHistory, getStatus } from "../controllers/attendance.controller";
import { authMiddleware } from "../common/middlewares/auth.middleware"; 

const router = Router();

router.use(authMiddleware);

router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.get("/history", getHistory);
router.get("/status", getStatus);

export const AttendanceRoutes = router;
