import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { sendResponse } from '../../core/utils/response.util';
import { BadRequestError } from '../../core/exceptions/BadRequestError';

export class PaymentController {
  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new BadRequestError('Unauthorized');
      }

      const params = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        search: req.query.search as string,
        status: req.query.status as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      };

      const result = await PaymentService.getPayments(userId, params);
      return sendResponse(res, 200, 'OK', result);
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentStats(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new BadRequestError('Unauthorized');
      }

      const stats = await PaymentService.getPaymentStats(userId);
      return sendResponse(res, 200, 'OK', stats);
    } catch (error) {
      next(error);
    }
  }

  static async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { orderId, paymentMethod } = req.body;

      if (!userId) {
        throw new BadRequestError('Unauthorized');
      }

      const result = await PaymentService.createPayment(
        userId,
        orderId,
        paymentMethod
      );

      return sendResponse(res, 201, 'Payment initiated', result);
    } catch (error) {
      next(error);
    }
  }

  static async handlePaymentWebhook(
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

      return sendResponse(res, 200, 'Payment success handled', result);
    } catch (error) {
      next(error);
    }
  }
}
