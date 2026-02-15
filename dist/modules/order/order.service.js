"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const db_1 = __importDefault(require("../../configs/db"));
const client_1 = require("@prisma/client");
const order_query_helper_1 = require("./order.query.helper");
const order_mapper_1 = require("./order.mapper");
const order_stats_helper_1 = require("./order.stats.helper");
class OrderService {
    static async getAllOrders(userId, params) {
        const { page, limit } = params;
        const skip = (page - 1) * limit;
        const where = order_query_helper_1.OrderQueryHelper.buildWhereClause(userId, params);
        const orderBy = order_query_helper_1.OrderQueryHelper.buildOrderBy(params.sortBy, params.sortOrder);
        const [total, pickupRequests] = await Promise.all([
            db_1.default.pickup_Request.count({ where }),
            db_1.default.pickup_Request.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: order_query_helper_1.OrderQueryHelper.getPickupInclude(),
            }),
        ]);
        return {
            data: order_mapper_1.OrderMapper.toOrderListResponse(pickupRequests),
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
        if (!order)
            throw new Error('Order not found');
        if (order.pickup_request.customer_id !== userId)
            throw new Error('Forbidden');
        if (order.status !== client_1.Order_Status.DELIVERED) {
            if (order.status === client_1.Order_Status.COMPLETED)
                return order;
            throw new Error('Order cannot be confirmed yet. Status must be DELIVERED.');
        }
        return db_1.default.order.update({
            where: { id: orderId },
            data: { status: client_1.Order_Status.COMPLETED },
        });
    }
    static async getOrderStats(userId) {
        return order_stats_helper_1.OrderStatsHelper.getStats(userId);
    }
    static async autoConfirmOrders() {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const result = await db_1.default.order.updateMany({
            where: {
                status: client_1.Order_Status.DELIVERED,
                updated_at: { lte: twoDaysAgo },
            },
            data: { status: client_1.Order_Status.COMPLETED },
        });
        return result.count;
    }
    static async getOrderById(userId, orderId) {
        const order = await db_1.default.order.findUnique({
            where: { id: orderId },
            include: order_query_helper_1.OrderQueryHelper.getOrderInclude(),
        });
        if (!order)
            throw new Error('Order not found');
        if (order.pickup_request.customer_id !== userId)
            throw new Error('Forbidden');
        return order_mapper_1.OrderMapper.toOrderDetailResponse(order);
    }
}
exports.OrderService = OrderService;
