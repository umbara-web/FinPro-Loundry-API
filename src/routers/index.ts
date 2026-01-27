import { Router } from 'express';

import authRouter from './auth.routers';
import { AttendanceRoutes } from './attendance.router';
import { DriverRoutes } from './driver.router';
import { WorkerRoutes } from './worker.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/attendance', AttendanceRoutes);
router.use('/driver', DriverRoutes);
router.use('/worker', WorkerRoutes);

export default router;
