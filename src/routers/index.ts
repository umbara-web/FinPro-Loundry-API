import { Router } from 'express';

import authRouter from './auth.routers';
import { AttendanceRouter } from './attendance.router';
import { DriverRouter } from './driver.router';
import { WorkerRouter } from './worker.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/attendance', new AttendanceRouter().getRouter());
router.use('/driver', new DriverRouter().getRouter());
router.use('/worker', new WorkerRouter().getRouter());

export default router;
