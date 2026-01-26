import { Router } from 'express';
import authRouter from './modules/auth/auth.routes';
import pickupRouter from './modules/pickup/pickup.routes';
import addressRouter from './modules/address/address.routes';
import userRouter from './modules/user/user.routes';
import { OrderRoutes } from './modules/order/order.routes';
import paymentRouter from './modules/payment/payment.routes';
import { ComplaintRoutes } from './modules/complaint/complaint.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/pickup', pickupRouter);
router.use('/users/addresses', addressRouter);
router.use('/users', userRouter);
router.use('/users', userRouter);
router.use('/orders', OrderRoutes);
router.use('/payments', paymentRouter);
router.use('/complaints', ComplaintRoutes);

export default router;
