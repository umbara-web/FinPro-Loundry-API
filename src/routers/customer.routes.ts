import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes';
import addressRouter from '../modules/address/address.routes';
import userRouter from '../modules/user/user.routes';
import { OrderRoutes } from '../modules/order/order.routes';
import paymentRouter from '../modules/payment/payment.routes';
import { ComplaintRoutes } from '../modules/complaint/complaint.routes';
import pickupRouter from '../modules/pickup/pickup.routes';

const customerRouter = Router();

// Customer specific routes
customerRouter.use('/auth', authRouter);
customerRouter.use('/users', userRouter);
customerRouter.use('/addresses', addressRouter);
customerRouter.use('/orders', OrderRoutes);
customerRouter.use('/payments', paymentRouter);
customerRouter.use('/complaints', ComplaintRoutes);
customerRouter.use('/pickups', pickupRouter);

export default customerRouter;
