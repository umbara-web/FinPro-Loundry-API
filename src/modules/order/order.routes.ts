import { Router } from 'express';
import { OrderController } from './order.controller';
import {
  authMiddleware,
  verificationGuard,
} from '../../common/middlewares/auth.middleware';
import { validateQuery } from '../../common/middlewares/validate.middleware';
import { getOrdersSchema } from './order.schemas';

const router = Router();

router.get(
  '/',
  authMiddleware,
  verificationGuard,
  validateQuery(getOrdersSchema),
  OrderController.getOrders
);

router.get(
  '/stats',
  authMiddleware,
  verificationGuard,
  OrderController.getOrderStats
);

router.post(
  '/:orderId/confirm',
  authMiddleware,
  verificationGuard,
  OrderController.confirmOrder
);

export const OrderRoutes = router;
