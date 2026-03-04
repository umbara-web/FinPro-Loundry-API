import { Order_Status } from '@prisma/client';
import { GetOrdersParams } from './order.types';
import { OrderMapper } from './order.mapper';
import { OrderStatsHelper } from './order.stats.helper';
import { OrderRepository } from './order.repository';
import { NotFoundError } from '../../core/exceptions/NotFoundError';
import { BadRequestError } from '../../core/exceptions/BadRequestError';

export class OrderService {
  private static orderRepository = new OrderRepository();

  static async getAllOrders(userId: string, params: GetOrdersParams) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const { total, pickupRequests } =
      await this.orderRepository.getPickupRequestsWithCount(
        userId,
        params,
        skip,
        limit
      );

    return {
      data: OrderMapper.toOrderListResponse(pickupRequests),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async confirmOrder(userId: string, orderId: string) {
    const order = await this.orderRepository.findOrderById(orderId, true);

    if (!order) throw new NotFoundError('Order not found');
    if ((order as any).pickup_request.customer_id !== userId) {
      throw new BadRequestError('Forbidden');
    }

    if (order.status !== Order_Status.DELIVERED) {
      if (order.status === Order_Status.COMPLETED) return order;
      throw new BadRequestError(
        'Order cannot be confirmed yet. Status must be DELIVERED.'
      );
    }

    return await this.orderRepository.updateOrderStatus(
      orderId,
      Order_Status.COMPLETED
    );
  }

  static async getOrderStats(userId: string) {
    return OrderStatsHelper.getStats(userId);
  }

  static async autoConfirmOrders() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result =
      await this.orderRepository.autoConfirmDeliveredOrders(twoDaysAgo);
    return result.count;
  }

  static async getOrderById(userId: string, orderId: string) {
    const order = await this.orderRepository.findOrderById(orderId, false);

    if (!order) throw new NotFoundError('Order not found');
    if ((order as any).pickup_request.customer_id !== userId) {
      throw new BadRequestError('Forbidden');
    }

    return OrderMapper.toOrderDetailResponse(order);
  }
}
