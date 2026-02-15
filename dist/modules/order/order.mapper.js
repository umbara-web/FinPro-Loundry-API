"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderMapper = void 0;
const order_query_helper_1 = require("./order.query.helper");
class OrderMapper {
    static toOrderResponse(pickup) {
        var _a, _b, _c;
        const orderData = (_a = pickup.order) === null || _a === void 0 ? void 0 : _a[0];
        const mappedStatus = order_query_helper_1.OrderQueryHelper.mapPickupStatusToOrderStatus(pickup.status);
        let status = (orderData === null || orderData === void 0 ? void 0 : orderData.status) || mappedStatus;
        if (status === 'CREATED' && mappedStatus !== 'CREATED') {
            status = mappedStatus;
        }
        // Check if there is a successful payment
        const payments = (orderData === null || orderData === void 0 ? void 0 : orderData.payment) || [];
        const isPaid = payments.some((p) => p.status === 'PAID');
        if (isPaid && (status === 'CREATED' || status === 'WAITING_PAYMENT')) {
            status = 'PAID';
        }
        return {
            id: pickup.id,
            order_id: ((_c = (_b = pickup.order) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.id) || '',
            pickup_request_id: pickup.id,
            outlet_id: pickup.assigned_outlet_id,
            outlet_admin_id: '',
            total_weight: (orderData === null || orderData === void 0 ? void 0 : orderData.total_weight) || 0,
            price_total: (orderData === null || orderData === void 0 ? void 0 : orderData.price_total) || 0,
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
            order_item: (orderData === null || orderData === void 0 ? void 0 : orderData.order_item) || [],
            driver_task: pickup.driver ? [{ driver: pickup.driver }] : [],
            payment: (orderData === null || orderData === void 0 ? void 0 : orderData.payment) || [],
        };
    }
    static toOrderListResponse(pickupRequests) {
        return pickupRequests.map((pickup) => this.toOrderResponse(pickup));
    }
    static toOrderDetailResponse(order) {
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
                const isPaid = payments.some((p) => p.status === 'PAID');
                if (isPaid &&
                    (order.status === 'CREATED' || order.status === 'WAITING_PAYMENT')) {
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
exports.OrderMapper = OrderMapper;
