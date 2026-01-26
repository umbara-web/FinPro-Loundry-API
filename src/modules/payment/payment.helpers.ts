import { GetPaymentsParams } from './payment.types';

export class PaymentQueryHelper {
  static buildWhereClause(userId: string, params: GetPaymentsParams) {
    const where: any = {
      order: {
        pickup_request: {
          customer_id: userId,
        },
      },
    };

    if (params.status && params.status !== 'all') {
      if (params.status === 'FAILED_GROUP') {
        where.status = {
          in: ['FAILED', 'EXPIRED', 'REFUNDED'],
        };
      } else {
        where.status = params.status;
      }
    }

    if (params.search) {
      where.OR = [
        { payment_ref: { contains: params.search, mode: 'insensitive' } },
        { order: { id: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params.dateFrom || params.dateTo) {
      where.created_at = {};
      if (params.dateFrom) {
        where.created_at.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.created_at.lte = new Date(params.dateTo);
      }
    }

    return where;
  }
}
