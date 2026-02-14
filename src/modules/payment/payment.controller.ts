import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';

export async function getPayments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const params = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: (req.query.sortBy as string) || 'created_at',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      search: req.query.search as string,
      status: req.query.status as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
    };

    const result = await PaymentService.getPayments(userId, params);
    res.status(200).json({ message: 'OK', data: result });
  } catch (error) {
    next(error);
  }
}

export async function getPaymentStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await PaymentService.getPaymentStats(userId);
    res.status(200).json({ message: 'OK', data: stats });
  } catch (error) {
    next(error);
  }
}

export async function createPayment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const { orderId, paymentMethod } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await PaymentService.createPayment(
      userId,
      orderId,
      paymentMethod
    );

    res.status(201).json({
      message: 'Payment initiated',
      data: result,
    });
  } catch (error: any) {
    // Basic error handling mapping
    if (error.message === 'Order not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === 'Order already paid') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

export async function handlePaymentWebhook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { orderId, paymentId } = req.body;
    const result = await PaymentService.handlePaymentWebhook(
      orderId,
      paymentId
    );
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}
