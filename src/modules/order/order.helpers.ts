import { Prisma, Order_Status } from '@prisma/client';

interface GetOrdersParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class OrderHelpers {
  static buildWhereClause(
    userId: string,
    params: GetOrdersParams
  ): Prisma.OrderWhereInput {
    const { search, status, dateFrom, dateTo } = params;
    const where: Prisma.OrderWhereInput = {
      pickup_request: {
        customer_id: userId,
      },
    };

    if (dateFrom || dateTo) {
      this.applyDateFilter(where, dateFrom, dateTo);
    }

    if (status) {
      this.applyStatusFilter(where, status);
    }

    if (search) {
      this.applySearchFilter(where, search);
    }

    return where;
  }

  private static applyDateFilter(
    where: Prisma.OrderWhereInput,
    dateFrom?: string,
    dateTo?: string
  ) {
    where.created_at = {};
    if (dateFrom) {
      where.created_at.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.created_at.lte = endDate;
    }
  }

  private static applyStatusFilter(
    where: Prisma.OrderWhereInput,
    status: string
  ) {
    if (status === 'ongoing') {
      where.status = {
        in: [
          'CREATED',
          'WAITING_PAYMENT',
          'PAID',
          'IN_WASHING',
          'IN_IRONING',
          'IN_PACKING',
          'READY_FOR_DELIVERY',
        ],
      };
    } else if (status === 'process') {
      where.status = {
        in: [
          'PAID',
          'IN_WASHING',
          'IN_IRONING',
          'IN_PACKING',
          'READY_FOR_DELIVERY',
          'ON_DELIVERY',
          'DELIVERED',
        ],
      };
    } else if (status === 'shipping') {
      where.status = { in: ['ON_DELIVERY'] };
    } else if (status === 'completed' || status === 'success') {
      where.status = { in: ['COMPLETED'] };
    } else if (status === 'cancelled' || status === 'failed') {
      where.status = { in: ['CANCELLED'] };
    } else if (status === 'waiting') {
      where.status = { in: ['WAITING_PAYMENT'] };
    } else {
      where.status = status as Order_Status;
    }
  }

  private static applySearchFilter(
    where: Prisma.OrderWhereInput,
    search: string
  ) {
    where.OR = [{ id: { contains: search, mode: 'insensitive' } }];
  }

  static buildOrderByClause(params: GetOrdersParams) {
    return {
      [params.sortBy]: params.sortOrder,
    };
  }

  static getIncludes() {
    return {
      pickup_request: {
        include: {
          customer_address: true,
        },
      },
      order_item: {
        include: {
          laundry_item: true,
        },
      },
      driver_task: {
        include: {
          driver: true,
        },
      },
    };
  }
}
