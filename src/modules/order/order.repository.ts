import { prisma } from '../../core/prisma/prisma.client';
import { Order_Status } from '@prisma/client';
import { OrderQueryHelper } from './order.query.helper';
import { GetOrdersParams } from './order.types';

export class OrderRepository {
  async getPickupRequestsWithCount(
    userId: string,
    params: GetOrdersParams,
    skip: number,
    limit: number
  ) {
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

    return { total, pickupRequests };
  }

  async findOrderById(orderId: string, includePickup: boolean = false) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: includePickup
        ? { pickup_request: true }
        : OrderQueryHelper.getOrderInclude(),
    });
  }

  async updateOrderStatus(orderId: string, status: Order_Status) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async autoConfirmDeliveredOrders(twoDaysAgo: Date) {
    return await prisma.order.updateMany({
      where: {
        status: Order_Status.DELIVERED,
        updatedAt: { lte: twoDaysAgo },
      },
      data: { status: Order_Status.COMPLETED },
    });
  }
}
