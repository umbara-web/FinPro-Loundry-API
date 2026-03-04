import { Router } from 'express';
// POS usually interacts heavily with Orders, Attendance, and Payments at an Outlet level.
import { AttendanceRoutes } from './attendance.router';
import authRouter from '../modules/auth/auth.routes'; // Shared Auth

const posRouter = Router();

// The Tablet POS system API endpoints
posRouter.use('/auth', authRouter);
posRouter.use('/attendance', AttendanceRoutes);
// Later you'd import specific POS-tailored modules like:
// posRouter.use('/orders', posOrderRoutes);
// posRouter.use('/cash-drawer', cashDrawerRoutes);

export default posRouter;
