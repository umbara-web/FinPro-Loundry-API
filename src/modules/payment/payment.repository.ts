import { prisma } from '../../core/prisma/prisma.client';
import { GetPaymentsParams } from './payment.types';
import { PaymentQueryHelper } from './payment.helpers';

export class PaymentRepository {
  async getPayments(
    userId: string,
    params: GetPaymentsParams,
    skip: number,
    limit: number
  ) {
    const where = PaymentQueryHelper.buildWhereClause(userId, params);

    const orderBy: any = {};
    orderBy[params.sortBy || 'createdAt'] = params.sortOrder || 'desc';

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          order: {
            include: {
              pickup_request: {
                include: { address: true },
              },
            },
          },
        },
      }),
    ]);

    return { total, payments };
  }

  async getPaidOrdersCount(userId: string) {
    return await prisma.order.count({
      where: {
        pickup_request: { customer_id: userId },
        payments: { some: { status: 'PAID' } },
      },
    });
  }

  async getPaymentStats(userId: string) {
    return await prisma.payment.groupBy({
      by: ['status'],
      where: {
        order: {
          pickup_request: { customer_id: userId },
        },
      },
      _count: { _all: true },
    });
  }

  async findOrderWithPaymentDetails(orderId: string) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        pickup_request: true,
        payments: true,
        order_items: { include: { laundry_item: true } },
      },
    });
  }

  async createPayment(orderId: string, amount: number, paymentMethod: string) {
    return await prisma.payment.create({
      data: {
        order_id: orderId,
        amount: amount,
        method: paymentMethod || 'SIMULATION',
        status: 'PENDING',
        payment_ref: `REF-${Date.now()}`,
      },
    });
  }

  async findOrderWithPayments(orderId: string) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });
  }

  async findPaymentById(paymentId: string) {
    return await prisma.payment.findUnique({
      where: { id: paymentId },
    });
  }

  async findPendingPaymentForOrder(orderId: string) {
    return await prisma.payment.findFirst({
      where: { order_id: orderId, status: 'PENDING' },
    });
  }

  async markPaymentAsPaid(paymentId: string) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paid_at: new Date(),
      },
    });
  }

  async updateOrderStatus(orderId: string, updateData: any) {
    return await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });
  }

  async createDeliveryTask(orderId: string) {
    return await prisma.driver_Task.create({
      data: {
        order_id: orderId,
        task_type: 'DELIVERY',
        status: 'AVAILABLE',
      },
    });
  }
}
