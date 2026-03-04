import { Router } from 'express';
import { DriverRoutes } from './driver.router';
import authRouter from '../modules/auth/auth.routes';

const driverRouter = Router();

// Mobile App endpoints strictly for Drivers
driverRouter.use('/auth', authRouter);
driverRouter.use('/tasks', DriverRoutes); // Wrapping inside tasks context

export default driverRouter;
