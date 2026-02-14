import { OrderQueryHelper } from './order.query.helper';

export class OrderMapper {
  static toOrderResponse(pickup: any) {
    const orderData = pickup.order?.[0];

    const mappedStatus = OrderQueryHelper.mapPickupStatusToOrderStatus(
      pickup.status
    );
    let status = orderData?.status || mappedStatus;

    if (status === 'CREATED' && mappedStatus !== 'CREATED') {
      status = mappedStatus;
    }

    // Check if there is a successful payment
    const payments = orderData?.payment || [];
    const isPaid = payments.some((p: any) => p.status === 'PAID');

    if (isPaid && (status === 'CREATED' || status === 'WAITING_PAYMENT')) {
      status = 'PAID';
    }

    return {
      id: pickup.id,
      order_id: pickup.order?.[0]?.id || '',
      pickup_request_id: pickup.id,
      outlet_id: pickup.assigned_outlet_id,
      outlet_admin_id: '',
      total_weight: orderData?.total_weight || 0,
      price_total: orderData?.price_total || 0,
      status: status,
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
      payment: orderData?.payment || [],
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
        const payments = order.payment || [];
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
      created_at: order.created_at,
      updated_at: order.updated_at,
      pickup_request: {
        id: order.pickup_request.id,
        customer_address: order.pickup_request.customer_address,
        created_at: order.pickup_request.created_at,
      },
      order_item: order.order_item,
      driver_task: order.pickup_request.driver
        ? [{ driver: order.pickup_request.driver }]
        : [],
      payment: order.payment,
    };
  }
}
