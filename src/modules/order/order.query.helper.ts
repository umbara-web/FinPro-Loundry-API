import { GetOrdersParams } from './order.types';
import { Prisma } from '@prisma/client';

export class OrderQueryHelper {
  static buildWhereClause(userId: string, params: GetOrdersParams) {
    const where: any = {
      customer_id: userId,
    };

    if (params.status) {
      if (params.status === 'ONGOING') {
        where.status = {
          in: [
            'WAITING_DRIVER',
            'DRIVER_ASSIGNED',
            'PICKED_UP',
            'ARRIVED_OUTLET',
          ],
        };
      } else {
        const statusMapping: { [key: string]: string } = {
          CREATED: 'WAITING_DRIVER',
          WAITING_PAYMENT: 'ARRIVED_OUTLET',
          PAID: 'ARRIVED_OUTLET',
          IN_WASHING: 'ARRIVED_OUTLET',
          IN_IRONING: 'ARRIVED_OUTLET',
          IN_PACKING: 'ARRIVED_OUTLET',
          READY_FOR_DELIVERY: 'ARRIVED_OUTLET',
          ON_DELIVERY: 'ARRIVED_OUTLET',
          DELIVERED: 'ARRIVED_OUTLET',
          COMPLETED: 'ARRIVED_OUTLET',
          CANCELLED: 'CANCELLED',
        };
        where.status = statusMapping[params.status] || params.status;
      }
    }

    if (params.search) {
      where.id = { contains: params.search };
    }

    if (params.dateFrom || params.dateTo) {
      where.created_at = {};
      if (params.dateFrom) {
        where.created_at.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        const endDate = new Date(params.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.created_at.lte = endDate;
      }
    }

    return where;
  }

  static buildOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.created_at = 'desc';
    }
    return orderBy;
  }

  static getPickupInclude() {
    return {
      customer_address: true,
      outlet: true,
      driver: { select: { id: true, name: true, phone: true } },
      order: {
        include: {
          order_item: { include: { laundry_item: true } },
          payment: { orderBy: { created_at: Prisma.SortOrder.desc } },
        },
      },
    };
  }

  static getOrderInclude() {
    return {
      pickup_request: {
        include: {
          customer_address: true,
          outlet: true,
          driver: { select: { id: true, name: true, phone: true } },
        },
      },
      order_item: { include: { laundry_item: true } },
      payment: { orderBy: { created_at: Prisma.SortOrder.desc } },
    };
  }

  static mapPickupStatusToOrderStatus(pickupStatus: string): string {
    const statusMapping: { [key: string]: string } = {
      WAITING_DRIVER: 'CREATED',
      DRIVER_ASSIGNED: 'CREATED',
      PICKED_UP: 'WAITING_PAYMENT',
      ARRIVED_OUTLET: 'WAITING_PAYMENT',
      CANCELLED: 'CANCELLED',
    };
    return statusMapping[pickupStatus] || 'CREATED';
  }
}
