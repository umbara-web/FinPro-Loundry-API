import { GetPaymentsParams } from './payment.types';
import { PaymentRepository } from './payment.repository';
import { NotFoundError } from '../../core/exceptions/NotFoundError';
import { BadRequestError } from '../../core/exceptions/BadRequestError';

export class PaymentService {
  private static paymentRepository = new PaymentRepository();

  static async getPayments(userId: string, params: GetPaymentsParams) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const { total, payments } = await this.paymentRepository.getPayments(
      userId,
      params,
      skip,
      limit
    );

    return {
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPaymentStats(userId: string) {
    const paidOrdersCount =
      await this.paymentRepository.getPaidOrdersCount(userId);
    const stats = await this.paymentRepository.getPaymentStats(userId);

    let pending = 0;
    let failed = 0;

    stats.forEach((stat) => {
      const count = stat._count._all;
      const status = stat.status;

      if (status === 'PENDING') {
        pending += count;
      } else if (['FAILED', 'EXPIRED', 'REFUNDED'].includes(status)) {
        failed += count;
      }
    });

    return {
      all: pending + paidOrdersCount + failed,
      PENDING: pending,
      PAID: paidOrdersCount,
      FAILED_GROUP: failed,
    };
  }

  static async createPayment(
    userId: string,
    orderId: string,
    paymentMethod: string
  ) {
    const order =
      await this.paymentRepository.findOrderWithPaymentDetails(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if ((order as any).pickup_request.customer_id !== userId) {
      throw new BadRequestError('Forbidden');
    }

    const successPayment = order.payments.find((p) => p.status === 'PAID');
    if (successPayment || order.paid_at) {
      throw new BadRequestError('Order already paid');
    }

    let amount = order.price_total;
    if (amount === 0 && order.order_items.length > 0) {
      amount = order.order_items.reduce((sum, item) => {
        const unitPrice = item.price || (item as any).laundry_item?.price || 0;
        return sum + unitPrice * item.qty;
      }, 0);
    }

    const payment = await this.paymentRepository.createPayment(
      orderId,
      amount || 0,
      paymentMethod
    );

    return {
      paymentId: payment.id,
      amount: amount,
      snapToken: 'SIMULATED-SNAP-TOKEN-' + payment.id,
      redirectUrl: `${process.env.BASE_WEB_URL}/dashboard/payments/payment-gateway-mock?orderId=${orderId}&pickupId=${(order as any).pickup_request.id}&paymentId=${payment.id}&amount=${amount}&method=${paymentMethod}`,
    };
  }

  static async handlePaymentWebhook(orderId: string, paymentId?: string) {
    const order = await this.paymentRepository.findOrderWithPayments(orderId);

    if (!order) throw new NotFoundError('Order not found');

    let pendingPayment;
    if (paymentId) {
      pendingPayment = await this.paymentRepository.findPaymentById(paymentId);
      if (pendingPayment && pendingPayment.order_id !== orderId) {
        pendingPayment = null;
      }
    } else {
      pendingPayment =
        await this.paymentRepository.findPendingPaymentForOrder(orderId);
    }

    if (pendingPayment && pendingPayment.status === 'PENDING') {
      await this.paymentRepository.markPaymentAsPaid(pendingPayment.id);
    }

    let updateData: any = {
      paid_at: new Date(),
    };

    if (order.status === 'IN_PACKING' || order.status === 'WAITING_PAYMENT') {
      if (order.status === 'WAITING_PAYMENT') {
        updateData.status = 'READY_FOR_DELIVERY';
        await this.paymentRepository.createDeliveryTask(orderId);
      }
    } else if (order.status === 'CREATED') {
      updateData.status = 'PAID';
    }

    await this.paymentRepository.updateOrderStatus(orderId, updateData);

    return { message: 'Payment success handled' };
  }
}
