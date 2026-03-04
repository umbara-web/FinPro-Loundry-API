import { OrderQueryHelper } from './order.query.helper';

export class OrderMapper {
  static toOrderResponse(pickup: any) {
    const orderData = pickup.orders?.[0];

    const mappedStatus = OrderQueryHelper.mapPickupStatusToOrderStatus(
      pickup.status
    );
    let status = orderData?.status || mappedStatus;

    if (status === 'CREATED' && mappedStatus !== 'CREATED') {
      status = mappedStatus;
    }

    // Check if there is a successful payment
    const payments = orderData?.payments || [];
    const isPaid = payments.some((p: any) => p.status === 'PAID');

    if (isPaid && (status === 'CREATED' || status === 'WAITING_PAYMENT')) {
      status = 'PAID';
    }

    return {
      id: pickup.id,
      order_id: pickup.orders?.[0]?.id || '',
      pickup_request_id: pickup.id,
      outlet_id: pickup.assigned_outlet_id,
      outlet_admin_id: '',
      total_weight: orderData?.total_weight || 0,
      price_total: orderData?.price_total || 0,
      status: status,
      paid_at: null,
      createdAt: pickup.createdAt.toISOString(),
      updated_at: pickup.updated_at.toISOString(),
      pickup_request: {
        id: pickup.id,
        address: {
          id: pickup.address.id,
          address: pickup.address.address,
          city: pickup.address.city,
          postal_code: pickup.address.postal_code,
        },
      },
      order_items: orderData?.order_items || [],
      driver_task: pickup.driver ? [{ driver: pickup.driver }] : [],
      payments: orderData?.payments || [],
    };
  }

  static toOrderListResponse(pickupRequests: any[]) {
    return pickupRequests.map((pickup) => this.toOrderResponse(pickup));
  }

  static toOrderDetailResponse(order: any) {
    return {
      id: order.pickup_request_id,
      order_id: order.id,
      pickup_request_id: order.pickup_request_id,
      outlet_id: order.pickup_request.assigned_outlet_id,
      outlet_admin_id: '',
      total_weight: order.total_weight,
      price_total: order.price_total,
      status: (() => {
        const payments = order.payments || [];
        const isPaid = payments.some((p: any) => p.status === 'PAID');
        if (
          isPaid &&
          (order.status === 'CREATED' || order.status === 'WAITING_PAYMENT')
        ) {
          return 'PAID';
        }
        return order.status;
      })(),
      paid_at: order.paid_at,
      createdAt: order.createdAt,
      updated_at: order.updated_at,
      pickup_request: {
        id: order.pickup_request.id,
        address: order.pickup_request.address,
        createdAt: order.pickup_request.createdAt,
      },
      order_items: order.order_items,
      driver_task: order.pickup_request.driver
        ? [{ driver: order.pickup_request.driver }]
        : [],
      payments: order.payments,
    };
  }
}
