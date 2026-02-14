import prisma from '../../configs/db';
import { Order_Status } from '@prisma/client';
import { GetOrdersParams } from './order.types';
import { OrderQueryHelper } from './order.query.helper';
import { OrderMapper } from './order.mapper';
import { OrderStatsHelper } from './order.stats.helper';

export class OrderService {
  static async getAllOrders(userId: string, params: GetOrdersParams) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const where = OrderQueryHelper.buildWhereClause(userId, params);
    const orderBy = OrderQueryHelper.buildOrderBy(
      params.sortBy,
      params.sortOrder
    );

    const [total, pickupRequests] = await Promise.all([
      prisma.pickup_Request.count({ where }),
      prisma.pickup_Request.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: OrderQueryHelper.getPickupInclude(),
      }),
    ]);

    return {
      data: OrderMapper.toOrderListResponse(pickupRequests),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async confirmOrder(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { pickup_request: true },
    });

    if (!order) throw new Error('Order not found');
    if (order.pickup_request.customer_id !== userId)
      throw new Error('Forbidden');

    if (order.status !== Order_Status.DELIVERED) {
      if (order.status === Order_Status.COMPLETED) return order;
      throw new Error(
        'Order cannot be confirmed yet. Status must be DELIVERED.'
      );
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: Order_Status.COMPLETED },
    });
  }

  static async getOrderStats(userId: string) {
    return OrderStatsHelper.getStats(userId);
  }

  static async autoConfirmOrders() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result = await prisma.order.updateMany({
      where: {
        status: Order_Status.DELIVERED,
        updated_at: { lte: twoDaysAgo },
      },
      data: { status: Order_Status.COMPLETED },
    });

    return result.count;
  }

  static async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: OrderQueryHelper.getOrderInclude(),
    });

    if (!order) throw new Error('Order not found');
    if ((order as any).pickup_request.customer_id !== userId)
      throw new Error('Forbidden');

    return OrderMapper.toOrderDetailResponse(order);
  }
}
