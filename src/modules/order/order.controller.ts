import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { GetOrdersQuery } from './order.schemas';

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

      OrderController.sendSuccessResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = OrderController.validateUser(req);
      const result = await OrderService.getOrderStats(user.userId);

      res.status(200).json({
        message: 'Order stats retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async confirmOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const user = OrderController.validateUser(req);
      const { orderId } = req.params;
      const result = await OrderService.confirmOrder(user.userId, orderId);

      res.status(200).json({
        message: 'Order confirmed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private static validateUser(req: Request) {
    const user = req.user;
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  private static parseQueryParams(query: GetOrdersQuery) {
    const { page, limit, sortBy, sortOrder, search, status, dateFrom, dateTo } =
      query;
    return {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'desc',
      search,
      status,
      dateFrom,
      dateTo,
    };
  }

  private static sendSuccessResponse(res: Response, result: any) {
    res.status(200).json({
      message: 'Orders retrieved successfully',
      data: result.data,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }
}
