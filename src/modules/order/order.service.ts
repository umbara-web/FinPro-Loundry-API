import prisma from '../../configs/db';
import { Order_Status } from '@prisma/client';
import { GetOrdersParams } from './order.types';
import { OrderQueryHelper } from './order.query.helper';

export class OrderService {
  static async getAllOrders(userId: string, params: GetOrdersParams) {
    const { page, limit, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where = OrderQueryHelper.buildWhereClause(userId, params);

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.created_at = 'desc';
    }

    const [total, pickupRequests] = await Promise.all([
      prisma.pickup_Request.count({ where }),
      prisma.pickup_Request.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer_address: true,
          outlet: true,
          driver: { select: { id: true, name: true, phone: true } },
          order: {
            include: {
              order_item: {
                include: {
                  laundry_item: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Map pickup requests to order format
    const orders = pickupRequests.map((pickup) => {
      const orderData = (pickup as any).order?.[0]; // Type assertion might be needed depending on generated types, or just rely on runtime

      return {
        id: pickup.id,
        pickup_request_id: pickup.id,
        outlet_id: pickup.assigned_outlet_id,
        outlet_admin_id: '',
        total_weight: orderData?.total_weight || 0,
        price_total: orderData?.price_total || 0,
        status: OrderQueryHelper.mapPickupStatusToOrderStatus(pickup.status),
        paid_at: null,
        created_at: pickup.created_at.toISOString(),
        updated_at: pickup.updated_at.toISOString(),
        pickup_request: {
          id: pickup.id,
          customer_address: {
            id: pickup.customer_address.id,
            address: pickup.customer_address.address,
            city: pickup.customer_address.city,
            postal_code: pickup.customer_address.postal_code,
          },
        },
        order_item: orderData?.order_item || [],
        driver_task: pickup.driver ? [{ driver: pickup.driver }] : [],
        payment: [],
      };
    });

    return {
      data: orders,
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

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.pickup_request.customer_id !== userId) {
      throw new Error('Forbidden');
    }

    if (order.status !== 'DELIVERED') {
      if (order.status === 'COMPLETED') {
        return order;
      }
      throw new Error(
        'Order cannot be confirmed yet. Status must be DELIVERED.'
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
      },
    });

    return updatedOrder;
  }

  static async getOrderStats(userId: string) {
    const stats = await prisma.pickup_Request.groupBy({
      by: ['status'],
      where: {
        customer_id: userId,
      },
      _count: {
        _all: true,
      },
    });

    let ongoing = 0;
    let delivery = 0;
    let completed = 0;
    let cancelled = 0;

    stats.forEach((stat) => {
      const count = stat._count._all;
      const status = stat.status;

      if (
        [
          'WAITING_DRIVER',
          'DRIVER_ASSIGNED',
          'PICKED_UP',
          'ARRIVED_OUTLET',
        ].includes(status)
      ) {
        ongoing += count;
      } else if (status === 'CANCELLED') {
        cancelled += count;
      }
    });

    return {
      all: ongoing + delivery + completed + cancelled,
      ONGOING: ongoing,
      DELIVERY: delivery,
      COMPLETED: completed,
      CANCELLED: cancelled,
    };
  }

  static async autoConfirmOrders() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result = await prisma.order.updateMany({
      where: {
        status: Order_Status.DELIVERED,
        updated_at: {
          lte: twoDaysAgo,
        },
      },
      data: {
        status: Order_Status.COMPLETED,
      },
    });

    return result.count;
  }
}
