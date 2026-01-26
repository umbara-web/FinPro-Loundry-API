import prisma from '../../configs/db';
import { GetPaymentsParams } from './payment.types';
import { PaymentQueryHelper } from './payment.helpers';

export class PaymentService {
  static async getPayments(userId: string, params: GetPaymentsParams) {
    const { page, limit, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where = PaymentQueryHelper.buildWhereClause(userId, params);

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

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
                include: {
                  customer_address: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPaymentStats(userId: string) {
    const stats = await prisma.payment.groupBy({
      by: ['status'],
      where: {
        order: {
          pickup_request: {
            customer_id: userId,
          },
        },
      },
      _count: {
        _all: true,
      },
    });

    let pending = 0;
    let paid = 0;
    let failed = 0;

    stats.forEach((stat) => {
      const count = stat._count._all;
      const status = stat.status;

      if (status === 'PENDING') {
        pending += count;
      } else if (status === 'PAID') {
        paid += count;
      } else if (['FAILED', 'EXPIRED', 'REFUNDED'].includes(status)) {
        failed += count;
      }
    });

    return {
      all: pending + paid + failed,
      PENDING: pending,
      PAID: paid,
      FAILED_GROUP: failed,
    };
  }

  static async createPayment(
    userId: string,
    orderId: string,
    paymentMethod: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { pickup_request: true, payment: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.pickup_request.customer_id !== userId) {
      throw new Error('Forbidden');
    }

    const successPayment = order.payment.find((p) => p.status === 'PAID');
    if (successPayment || order.paid_at) {
      throw new Error('Order already paid');
    }

    const amount = order.price_total;

    const payment = await prisma.payment.create({
      data: {
        order_id: orderId,
        amount: amount,
        method: paymentMethod || 'SIMULATION',
        status: 'PENDING',
        payment_ref: `REF-${Date.now()}`,
      },
    });

    return {
      paymentId: payment.id,
      amount: amount,
      snapToken: 'SIMULATED-SNAP-TOKEN-' + payment.id,
      redirectUrl: `/customer/orders/${orderId}/payment/success`,
    };
  }

  static async handlePaymentWebhook(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) throw new Error('Order not found');

    const pendingPayment = await prisma.payment.findFirst({
      where: { order_id: orderId, status: 'PENDING' },
    });

    if (pendingPayment) {
      await prisma.payment.update({
        where: { id: pendingPayment.id },
        data: {
          status: 'PAID',
          paid_at: new Date(),
          method: 'GOPAY_SIMULATION',
        },
      });
    }

    let updateData: any = {
      paid_at: new Date(),
    };

    if (order.status === 'IN_PACKING' || order.status === 'WAITING_PAYMENT') {
      if (order.status === 'WAITING_PAYMENT') {
        updateData.status = 'READY_FOR_DELIVERY';

        await prisma.driver_Task.create({
          data: {
            order_id: orderId,
            task_type: 'DELIVERY',
            status: 'AVAILABLE',
          },
        });
      }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return { message: 'Payment success handled' };
  }
}
