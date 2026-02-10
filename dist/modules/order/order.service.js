"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const db_1 = __importDefault(require("../../configs/db"));
const client_1 = require("@prisma/client");
const order_query_helper_1 = require("./order.query.helper");
class OrderService {
    static async getAllOrders(userId, params) {
        const { page, limit, sortBy, sortOrder } = params;
        const skip = (page - 1) * limit;
        const where = order_query_helper_1.OrderQueryHelper.buildWhereClause(userId, params);
        const orderBy = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'desc';
        }
        else {
            orderBy.created_at = 'desc';
        }
        const [total, pickupRequests] = await Promise.all([
            db_1.default.pickup_Request.count({ where }),
            db_1.default.pickup_Request.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    customer_address: true,
                    outlet: true,
                    driver: { select: { id: true, name: true, phone: true } },
                    order: {
                        include: {
                            order_item: {
                                include: {
                                    laundry_item: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);
        // Map pickup requests to order format
        const orders = pickupRequests.map((pickup) => {
            var _a, _b, _c;
            const orderData = (_a = pickup.order) === null || _a === void 0 ? void 0 : _a[0]; // Type assertion might be needed depending on generated types, or just rely on runtime
            return {
                id: pickup.id,
                order_id: ((_c = (_b = pickup.order) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.id) || '', // Expose real Order ID
                pickup_request_id: pickup.id,
                outlet_id: pickup.assigned_outlet_id,
                outlet_admin_id: '',
                total_weight: (orderData === null || orderData === void 0 ? void 0 : orderData.total_weight) || 0,
                price_total: (orderData === null || orderData === void 0 ? void 0 : orderData.price_total) || 0,
                status: (orderData === null || orderData === void 0 ? void 0 : orderData.status) ||
                    order_query_helper_1.OrderQueryHelper.mapPickupStatusToOrderStatus(pickup.status),
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
                payment: [],
            };
        });
        return {
            data: orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    static async confirmOrder(userId, orderId) {
        const order = await db_1.default.order.findUnique({
            where: { id: orderId },
            include: { pickup_request: true },
        });
        if (!order) {
            throw new Error('Order not found');
        }
        if (order.pickup_request.customer_id !== userId) {
            throw new Error('Forbidden');
        }
        if (order.status !== 'DELIVERED') {
            if (order.status === 'COMPLETED') {
                return order;
            }
            throw new Error('Order cannot be confirmed yet. Status must be DELIVERED.');
        }
        const updatedOrder = await db_1.default.order.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETED',
            },
        });
        return updatedOrder;
    }
    static async getOrderStats(userId) {
        const stats = await db_1.default.pickup_Request.groupBy({
            by: ['status'],
            where: {
                customer_id: userId,
            },
            _count: {
                _all: true,
            },
        });
        let ongoing = 0;
        let delivery = 0;
        let completed = 0;
        let cancelled = 0;
        stats.forEach((stat) => {
            const count = stat._count._all;
            const status = stat.status;
            if ([
                'WAITING_DRIVER',
                'DRIVER_ASSIGNED',
                'PICKED_UP',
                'ARRIVED_OUTLET',
            ].includes(status)) {
                ongoing += count;
            }
            else if (status === 'CANCELLED') {
                cancelled += count;
            }
        });
        return {
            all: ongoing + delivery + completed + cancelled,
            ONGOING: ongoing,
            DELIVERY: delivery,
            COMPLETED: completed,
            CANCELLED: cancelled,
        };
    }
    static async autoConfirmOrders() {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const result = await db_1.default.order.updateMany({
            where: {
                status: client_1.Order_Status.DELIVERED,
                updated_at: {
                    lte: twoDaysAgo,
                },
            },
            data: {
                status: client_1.Order_Status.COMPLETED,
            },
        });
        return result.count;
    }
}
exports.OrderService = OrderService;
