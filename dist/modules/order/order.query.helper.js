"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderQueryHelper = void 0;
class OrderQueryHelper {
    static buildWhereClause(userId, params) {
        const where = {
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
            }
            else {
                const statusMapping = {
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
    static mapPickupStatusToOrderStatus(pickupStatus) {
        const statusMapping = {
            WAITING_DRIVER: 'CREATED',
            DRIVER_ASSIGNED: 'CREATED',
            PICKED_UP: 'WAITING_PAYMENT',
            ARRIVED_OUTLET: 'WAITING_PAYMENT',
            CANCELLED: 'CANCELLED',
        };
        return statusMapping[pickupStatus] || 'CREATED';
    }
}
exports.OrderQueryHelper = OrderQueryHelper;
