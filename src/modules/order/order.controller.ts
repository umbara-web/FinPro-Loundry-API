import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { GetOrdersQuery } from './order.schemas';
import { sendResponse } from '../../core/utils/response.util';
import { BadRequestError } from '../../core/exceptions/BadRequestError';

export class OrderController {
  static async getOrders(
    req: Request<{}, {}, {}, GetOrdersQuery>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = OrderController.validateUser(req);
      const params = OrderController.parseQueryParams(req.query);
      const result = await OrderService.getAllOrders(user.userId, params);

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result.data,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = OrderController.validateUser(req);
      const result = await OrderService.getOrderStats(user.userId);

      return sendResponse(
        res,
        200,
        'Order stats retrieved successfully',
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async confirmOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const user = OrderController.validateUser(req);
      const { orderId } = req.params;
      const result = await OrderService.confirmOrder(user.userId, orderId);

      return sendResponse(res, 200, 'Order confirmed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = OrderController.validateUser(req);
      const { id } = req.params;
      const result = await OrderService.getOrderById(user.userId, id);

      return sendResponse(
        res,
        200,
        'Order details retrieved successfully',
        result
      );
    } catch (error) {
      next(error);
    }
  }

  private static validateUser(req: Request) {
    const user = req.user as any;
    if (!user) {
      throw new BadRequestError('User not found');
    }
    return user;
  }

  private static parseQueryParams(query: GetOrdersQuery) {
    const { page, limit, sortBy, sortOrder, search, status, dateFrom, dateTo } =
      query;
    return {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
      search,
      status,
      dateFrom,
      dateTo,
    };
  }
}
