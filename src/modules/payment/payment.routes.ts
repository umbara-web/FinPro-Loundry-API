import { Router } from 'express';
import {
  createPayment,
  handlePaymentWebhook,
  getPayments,
  getPaymentStats,
} from './payment.controller';
import { authMiddleware } from '../../common/middlewares/auth.middleware';

const router = Router();

router.get('/stats', authMiddleware, getPaymentStats);
router.get('/', authMiddleware, getPayments);
router.post('/create', authMiddleware, createPayment);
router.post('/webhook', handlePaymentWebhook); // Webhook usually no auth or specific signature header check

export default router;
