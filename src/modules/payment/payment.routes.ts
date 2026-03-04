import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authMiddleware } from '../../common/middlewares/auth.middleware';

const router = Router();

router.get('/stats', authMiddleware, PaymentController.getPaymentStats);
router.get('/', authMiddleware, PaymentController.getPayments);
router.post('/create', authMiddleware, PaymentController.createPayment);
router.post('/webhook', PaymentController.handlePaymentWebhook);

export default router;
