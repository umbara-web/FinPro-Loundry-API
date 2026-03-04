import { Router } from 'express';
import itemRouter from '../admin/router/item.router';
import outletRouter from '../admin/router/outlet.router';
import workerRouter from '../admin/router/worker.router';
import orderRouter from '../admin/router/order.router';
import { MasterRoutes } from './master.router';
import { OutletAdminRoutes } from './outlet-admin.router';

// In an enterprise system, you would apply requireSuperAdmin or requireFranchiseOwner middleware here.
const adminRouter = Router();

// Dashboard Management Routes
adminRouter.use('/items', itemRouter);
adminRouter.use('/outlets', outletRouter);
adminRouter.use('/workers', workerRouter);
adminRouter.use('/orders', orderRouter);
adminRouter.use('/master', MasterRoutes);
adminRouter.use('/outlet-admin', OutletAdminRoutes);

export default adminRouter;
